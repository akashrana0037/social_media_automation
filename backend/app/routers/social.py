from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Optional
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.config import settings
from app.models.core import PlatformToken, Client
from app.services.social_meta import meta_service
from app.utils.crypto import encrypt_token

router = APIRouter()

from app.utils.crypto import decrypt_token as safe_decrypt

@router.get("/status")
async def get_connection_status(client_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Returns the list of currently connected platforms for the given client.
    """
    query = select(PlatformToken).where(PlatformToken.client_id == client_id)
    result = await db.execute(query)
    tokens = result.scalars().all()
    
    connected = []
    for token in tokens:
        try:
            raw_token = safe_decrypt(token.access_token)
        except Exception:
            raw_token = token.access_token

        connected.append({
            "platform": token.platform,
            "account_name": token.account_name,
            "platform_id": token.platform_id,
            "access_token": raw_token,
            "updated_at": token.updated_at
        })
        
    return {"connected": connected}

@router.get("/meta/login")
async def meta_login(client_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates the Meta Auth URL and redirects the user.
    """
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == client_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Client not found")
        
    auth_url = meta_service.get_auth_url(client_id_db=client_id)
    return RedirectResponse(url=auth_url)

@router.get("/meta/callback")
async def meta_callback(code: str, state: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """
    Handles the redirect from Meta after user authorizes.
    The 'state' variable contains our client_id passed during login.
    """
    try:
        print(f"DEBUG: Entering Meta Callback. Code: {code[:10]}... State: {state}")
        
        if state:
            client_id = int(state)
        else:
            print("Warning: Missing state. Defaulting to 1.")
            client_id = 1

        # 1. Token Exchange
        print("DEBUG: Exchanging code for token...")
        short_token = await meta_service.exchange_code_for_token(code)
        
        # 2. Upgrade Token
        print("DEBUG: Upgrading to long-lived token...")
        long_token = await meta_service.get_long_lived_token(short_token)
        
        # 3. Save to DB
        print(f"DEBUG: Saving token for Client {client_id}...")
        
        # 4. Fetch Pages
        print("DEBUG: Fetching Facebook Pages...")
        pages = await meta_service.fetch_user_pages(long_token)
        if not pages:
             return RedirectResponse(url=f"{settings.FRONTEND_URL}/connections?status=error&message=No+Facebook+Pages+Found")
             
        primary_page = pages[0]
        page_id = primary_page.get("id")
        page_name = primary_page.get("name")
        page_access_token = primary_page.get("access_token")
        
        if not page_access_token:
            # Fallback to long_token if for some reason the page token isn't there
            page_access_token = long_token

        # 5. DB Persistence
        encrypted_page_token = encrypt_token(page_access_token)
        query = select(PlatformToken).where(
            PlatformToken.client_id == client_id,
            PlatformToken.platform == "facebook"
        )
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        
        if existing:
            existing.access_token = encrypted_page_token
            existing.platform_id = page_id
            existing.account_name = page_name
        else:
            db.add(PlatformToken(
                client_id=client_id,
                platform="facebook",
                platform_id=page_id,
                account_name=page_name,
                access_token=encrypted_page_token
            ))
            
        # 6. Optional: Auto-connect Instagram
        ig_account = await meta_service.fetch_ig_account_id(page_id, page_access_token)
        if ig_account:
            ig_id = ig_account.get("id")
            # Save or update IG token
            ig_query = select(PlatformToken).where(
                PlatformToken.client_id == client_id,
                PlatformToken.platform == "instagram"
            )
            ig_res = await db.execute(ig_query)
            ig_existing = ig_res.scalar_one_or_none()
            
            if ig_existing:
                ig_existing.access_token = encrypted_page_token # Instagram uses the Page Access Token for business accounts
                ig_existing.platform_id = ig_id
                ig_existing.account_name = f"IG: {page_name}"
            else:
                db.add(PlatformToken(
                    client_id=client_id,
                    platform="instagram",
                    platform_id=ig_id,
                    account_name=f"IG: {page_name}",
                    access_token=encrypted_page_token
                ))

        await db.commit()
        print("DEBUG: Callback success! Redirecting...")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/connections?status=success")

    except Exception as e:
        import traceback
        print("\n!!! CRITICAL BACKEND ERROR !!!")
        traceback.print_exc()
        # Fallback to a safe redirect so the user doesn't see a blank error page
        err_msg = str(e).replace(" ", "+")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/connections?status=error&message={err_msg}")
