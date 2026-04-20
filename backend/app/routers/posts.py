from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.posts import Post, PostPlatform, PostStatus, MediaAsset
from app.schemas.posts import PostCreate, PostOut
from app.config import settings
from app.services.dispatcher import dispatch_single_post

router = APIRouter()

@router.post("/", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: PostCreate,
    client_id: int, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new social media post and queues it for platforms.
    """
    try:
        # 1. Create the base Post
        new_post = Post(
            client_id=client_id,
            title=post_in.title,
            content_type=post_in.content_type,
            caption=post_in.caption,
            caption_overrides=post_in.caption_overrides,
            hashtags=post_in.hashtags,
            first_comment=post_in.first_comment,
            scheduled_at=post_in.scheduled_at,
            approval_required=post_in.approval_required,
            location_name=post_in.location_name,
            location_place_id=post_in.location_place_id,
            platform_data=post_in.platform_data,
            status=PostStatus.SCHEDULED if (post_in.scheduled_at or post_in.publish_now) else PostStatus.DRAFT
        )
        db.add(new_post)
        await db.flush() # Get the new_post.id
        
        # 2. Link Platforms
        for platform_name in post_in.platforms:
            pp = PostPlatform(
                post_id=new_post.id,
                platform=platform_name,
                status=PostStatus.SCHEDULED if (post_in.scheduled_at or post_in.publish_now) else PostStatus.DRAFT
            )
            db.add(pp)
            
        # 3. Link Media Assets
        for idx, url in enumerate(post_in.media_urls):
            asset = MediaAsset(
                post_id=new_post.id,
                file_name=f"asset_{idx}",
                file_type="image/jpeg", # Defaulting for now
                original_url=url,
                order=idx
            )
            db.add(asset)
            
        await db.commit()
        await db.refresh(new_post)
        
        # 4. Immediate Dispatch (Post Now)
        if post_in.publish_now:
            background_tasks.add_task(dispatch_single_post, new_post.id)
            
        return new_post
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[PostOut])
async def get_posts(
    client_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all posts for a client.
    """
    query = select(Post).where(Post.client_id == client_id).order_by(Post.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()
