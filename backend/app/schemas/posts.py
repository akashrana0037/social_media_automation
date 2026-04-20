from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.posts import PostStatus, ContentType

class MediaAssetBase(BaseModel):
    file_name: str
    file_type: str
    original_url: str
    order: int = 0

class PostPlatformBase(BaseModel):
    platform: str
    status: PostStatus = PostStatus.DRAFT

class PostCreate(BaseModel):
    title: str
    content_type: str
    caption: str
    
    caption_overrides: Optional[Dict[str, str]] = None
    hashtags: Optional[str] = None
    first_comment: Optional[str] = None
    
    scheduled_at: Optional[datetime] = None
    publish_now: bool = False
    approval_required: bool = False
    
    location_name: Optional[str] = None
    location_place_id: Optional[str] = None
    
    platforms: List[str]
    media_urls: List[str]
    thumbnail_url: Optional[str] = None
    platform_data: Optional[Dict[str, Any]] = None

class PostOut(BaseModel):
    id: int
    title: str
    status: str
    created_at: datetime
    platform_data: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True
