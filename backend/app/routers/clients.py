from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.database import get_db
from app.models.core import Client
from pydantic import BaseModel

router = APIRouter()

class ClientCreate(BaseModel):
    name: str
    industry: str | None = None
    contact_email: str | None = None
    notes: str | None = None

class ClientUpdate(BaseModel):
    name: str | None = None
    industry: str | None = None
    contact_email: str | None = None
    notes: str | None = None
    internal_status: str | None = None

class ClientResponse(BaseModel):
    id: int
    name: str
    industry: str | None = None
    contact_email: str | None = None
    notes: str | None = None
    internal_status: str | None = "active"
    token_status: str = "healthy"
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=ClientResponse)
async def create_client(client_in: ClientCreate, db: AsyncSession = Depends(get_db)):
    db_client = Client(
        name=client_in.name, 
        industry=client_in.industry,
        contact_email=client_in.contact_email,
        notes=client_in.notes,
        internal_status="active"
    )
    db.add(db_client)
    await db.commit()
    await db.refresh(db_client)
    return db_client

@router.get("/")
async def list_clients(db: AsyncSession = Depends(get_db)):
    """
    Returns a list of clients with calculated health status.
    """
    # Fetch clients and their tokens to check expiry
    result = await db.execute(select(Client).options(selectinload(Client.tokens)))
    clients = result.scalars().all()
    
    response = []
    now = datetime.now(timezone.utc)
    
    for client in clients:
        status = "healthy"
        if not client.tokens:
            status = "critical" # Agency alert: No social accounts linked
        else:
            for token in client.tokens:
                if token.expires_at:
                    # Timezone-aware comparison
                    expires_at = token.expires_at if token.expires_at.tzinfo else token.expires_at.replace(tzinfo=timezone.utc)
                    days_left = (expires_at - now).days
                    if days_left < 0:
                        status = "critical"
                        break
                    elif days_left < 7:
                        status = "warning"
                elif not token.access_token:
                    status = "critical"
        
        # Consistent mapping for the frontend
        response.append({
            "id": client.id,
            "name": client.name,
            "industry": client.industry,
            "contact_email": client.contact_email,
            "notes": client.notes,
            "internal_status": client.internal_status or "active",
            "token_status": status,
            "created_at": client.created_at.isoformat() if client.created_at else None
        })
        
    return response

@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, client_in: ClientUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    update_data = client_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
        
    await db.commit()
    await db.refresh(client)
    return client

@router.delete("/{client_id}")
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Client).where(Client.id == client_id)
    result = await db.execute(query)
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    await db.delete(client)
    await db.commit()
    return {"message": f"Client {client_id} and all related data deleted successfully"}
