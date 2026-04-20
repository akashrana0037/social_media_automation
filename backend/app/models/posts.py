from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Enum, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"

class ContentType(str, enum.Enum):
    FEED = "feed"
    STORY = "story"
    REEL = "reel"
    CAROUSEL = "carousel"
    SHORT = "short"

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    title = Column(String)
    content_type = Column(String)
    caption = Column(Text)
    
    # Overrides
    caption_overrides = Column(JSON, nullable=True) # {platform: caption}
    
    hashtags = Column(Text, nullable=True)
    first_comment = Column(Text, nullable=True)
    
    scheduled_at = Column(DateTime(timezone=True))
    status = Column(String, default=PostStatus.DRAFT)
    approval_required = Column(Boolean, default=False)
    
    location_name = Column(String, nullable=True)
    location_place_id = Column(String, nullable=True)
    
    platform_data = Column(JSON, nullable=True) # {facebook: {link: '...'}, instagram: {type: 'reel'}}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="posts")
    platforms = relationship("PostPlatform", back_populates="post")
    assets = relationship("MediaAsset", back_populates="post")

class PostPlatform(Base):
    __tablename__ = "post_platforms"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    platform = Column(String)
    
    status = Column(String, default=PostStatus.DRAFT)
    platform_post_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Meta specific
    container_id = Column(String, nullable=True)
    container_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    post = relationship("Post", back_populates="platforms")

class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    file_name = Column(String)
    file_type = Column(String) # image/jpeg, video/mp4, etc.
    original_url = Column(String)
    processed_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    
    order = Column(Integer, default=0) # For carousels
    
    post = relationship("Post", back_populates="assets")
