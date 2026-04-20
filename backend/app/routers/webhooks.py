from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from app.config import settings

router = APIRouter()

@router.get("/meta")
async def verify_meta_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Required verification handler for Meta (Facebook/Instagram) webhooks.
    When you add a webhook URL in Meta Dashboard, they send a GET request here.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.META_VERIFY_TOKEN:
        print(f"Webhook verified successfully!")
        return PlainTextResponse(content=hub_challenge)
        
    print(f"Webhook verification failed. Token mismatch or invalid mode.")
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/meta")
async def handle_meta_webhook(data: dict):
    """
    Handles incoming notifications from Meta.
    """
    print(f"Received Meta Webhook: {data}")
    # In future, process data here (e.g., comment alerts, post status changes)
    return {"status": "ok"}
