from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.ai import ai_service

router = APIRouter()

class GenerateCaptionRequest(BaseModel):
    description: str
    platform: str
    tone: Optional[str] = "engaging"

class HashtagRequest(BaseModel):
    caption: str
    count: Optional[int] = 10

class RewriteRequest(BaseModel):
    caption: str
    target_tone: str

@router.post("/generate-caption")
async def generate_caption(req: GenerateCaptionRequest):
    try:
        content = await ai_service.generate_caption(req.description, req.platform, req.tone)
        return {"caption": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-hashtags")
async def suggest_hashtags(req: HashtagRequest):
    try:
        tags = await ai_service.suggest_hashtags(req.caption, req.count)
        return {"hashtags": tags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewrite-tone")
async def rewrite_tone(req: RewriteRequest):
    try:
        content = await ai_service.rewrite_tone(req.caption, req.target_tone)
        return {"caption": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
