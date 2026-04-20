import asyncio
from datetime import datetime, timezone
import logging
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import SessionLocal
from app.models.posts import Post, PostPlatform, PostStatus
from app.models.core import PlatformToken
from app.services.social_meta import meta_service
from app.utils.crypto import decrypt_token

logger = logging.getLogger(__name__)

async def dispatch_single_post(post_id: int):
    """
    Attempts to publish a specific post to all its target platforms immediately.
    """
    async with SessionLocal() as session:
        # Load post with platforms and assets
        query = (
            select(Post)
            .where(Post.id == post_id)
            .options(
                selectinload(Post.platforms),
                selectinload(Post.assets)
            )
        )
        result = await session.execute(query)
        post = result.scalar_one_or_none()
        
        if not post:
            logger.error(f"Cannot dispatch: Post {post_id} not found.")
            return

        logger.info(f"🚀 IMMEDIATE DISPATCH: Post ID {post.id} ({post.title})")
        
        post.status = PostStatus.PUBLISHING
        await session.commit()
        
        all_success = True
        
        for platform_record in post.platforms:
            # Skip if already published or failed? Actually for "Post Now" we want to try everything once.
            
            # Fetch token
            token_query = select(PlatformToken).where(
                PlatformToken.client_id == post.client_id,
                PlatformToken.platform == platform_record.platform
            )
            token_res = await session.execute(token_query)
            token_record = token_res.scalar_one_or_none()
            
            if not token_record:
                platform_record.status = PostStatus.FAILED
                platform_record.error_message = "No auth token found"
                all_success = False
                continue
                
            try:
                access_token = decrypt_token(token_record.access_token)
            except Exception:
                access_token = token_record.access_token

            media_urls = [asset.original_url for asset in post.assets]
            caption = post.caption
            if post.caption_overrides and platform_record.platform in post.caption_overrides:
                caption = post.caption_overrides[platform_record.platform]
            
            # Extract platform-specific settings
            p_data = post.platform_data.get(platform_record.platform, {}) if post.platform_data else {}
            is_story = p_data.get("is_story", False) or post.content_type == "story"
            
            try:
                if platform_record.platform == "facebook":
                    res = await meta_service.publish_to_facebook(
                        page_id=token_record.platform_id,
                        access_token=access_token,
                        message=caption,
                        media_urls=media_urls,
                        link=p_data.get("link"),
                        is_story=is_story,
                        location_id=post.location_place_id
                    )
                    platform_record.platform_post_id = res.get("id")
                elif platform_record.platform == "instagram":
                    res = await meta_service.publish_to_instagram(
                        ig_user_id=token_record.platform_id,
                        access_token=access_token,
                        caption=caption,
                        media_urls=media_urls,
                        is_reel=p_data.get("is_reel", False) or post.content_type == "reels",
                        is_story=is_story,
                        location_id=post.location_place_id,
                        cover_url=post.thumbnail_url,
                        first_comment=post.first_comment
                    )
                    platform_record.platform_post_id = res.get("id")
                
                platform_record.status = PostStatus.PUBLISHED
            except Exception as e:
                logger.error(f"Failed to publish to {platform_record.platform}: {str(e)}")
                platform_record.status = PostStatus.FAILED
                platform_record.error_message = str(e)
                all_success = False
        
        post.status = PostStatus.PUBLISHED if all_success else PostStatus.FAILED
        await session.commit()
        logger.info(f"✅ DISPATCH COMPLETE: Post ID {post.id}. Status: {post.status}")

async def dispatch_scheduled_posts():
    """
    Background worker that continuously polls for scheduled posts
    """
    logger.info("Starting Social Sync Dispatcher background task...")
    
    while True:
        try:
            async with SessionLocal() as session:
                now = datetime.now(timezone.utc)
                query = (
                    select(Post.id)
                    .where(Post.status == PostStatus.SCHEDULED)
                    .where(Post.scheduled_at <= now)
                )
                
                result = await session.execute(query)
                post_ids = result.scalars().all()
                
                for pid in post_ids:
                    # We call our new single dispatcher
                    await dispatch_single_post(pid)
                    
        except Exception as e:
            logger.error(f"Error in dispatcher loop: {str(e)}")
            
        await asyncio.sleep(30)
