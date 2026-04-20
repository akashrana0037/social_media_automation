import pandas as pd
from io import StringIO
from typing import List, Dict, Any
from datetime import datetime
from app.schemas.posts import PostCreate
from app.models.posts import ContentType
import json

REQUIRED_FIELDS = ['post_title', 'platforms', 'content_type', 'scheduled_date', 'scheduled_time', 'caption']

def validate_calendar_row(row: Dict[str, Any]) -> List[str]:
    errors = []
    
    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in row or pd.isna(row[field]) or str(row[field]).strip() == "":
            errors.append(f"Missing required field: {field}")
            
    if errors:
        return errors

    # Platform validation
    valid_platforms = ['instagram', 'facebook', 'linkedin', 'youtube']
    platforms = [p.strip().lower() for p in str(row['platforms']).split(',')]
    invalid_platforms = [p for p in platforms if p not in valid_platforms]
    if invalid_platforms:
        errors.append(f"Invalid platforms: {', '.join(invalid_platforms)}")

    # Content Type validation
    valid_content_types = [c.value for c in ContentType]
    if str(row['content_type']).lower() not in valid_content_types:
        errors.append(f"Invalid content_type: {row['content_type']}")

    # YouTube Specifics
    if 'youtube' in platforms:
        if 'youtube_title' not in row or pd.isna(row['youtube_title']):
            errors.append("YouTube title is required for YouTube posts")

    # Carousel Specifics
    if str(row['content_type']).lower() == 'carousel':
        media_urls = [row.get(f'media_url_{i}') for i in range(1, 11) if not pd.isna(row.get(f'media_url_{i}'))]
        if len(media_urls) < 2:
            errors.append("Carousel requires at least 2 media URLs")
        if len(media_urls) > 10:
            errors.append("Carousel supports max 10 media URLs")

    return errors

async def parse_calendar_csv(csv_content: str):
    try:
        df = pd.read_csv(StringIO(csv_content))
    except Exception as e:
        return {"error": f"Failed to parse CSV: {str(e)}"}
        
    results = []
    
    for index, row in df.iterrows():
        row_dict = row.to_dict()
        errors = validate_calendar_row(row_dict)
        
        results.append({
            "row_index": index + 2, # +2 for 1-based and header
            "data": row_dict,
            "errors": errors,
            "is_valid": len(errors) == 0
        })
        
    return results

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.posts import Post, PostPlatform, PostStatus, MediaAsset

async def bulk_create_posts(db: AsyncSession, valid_results: List[Dict[str, Any]], client_id: int):
    """
    Takes valid parsed CSV data and creates database records.
    """
    created_ids = []
    
    for item in valid_results:
        row = item['data']
        
        # Combine date and time
        try:
            sched_str = f"{row['scheduled_date']} {row['scheduled_time']}"
            scheduled_at = datetime.strptime(sched_str, "%Y-%m-%d %H:%M")
        except:
            scheduled_at = datetime.now() # Fallback

        # Parse platforms
        platforms = [p.strip().lower() for p in str(row['platforms']).split(',')]
        
        # Extract media
        media_urls = [row.get(f'media_url_{i}') for i in range(1, 11) if not pd.isna(row.get(f'media_url_{i}'))]
        
        # 1. Create Post
        new_post = Post(
            client_id=client_id,
            title=row['post_title'],
            content_type=row['content_type'],
            caption=row['caption'],
            hashtags=row.get('hashtags', ''),
            scheduled_at=scheduled_at,
            status=PostStatus.SCHEDULED
        )
        db.add(new_post)
        await db.flush()
        
        # 2. Add Platforms
        for p_name in platforms:
            db.add(PostPlatform(post_id=new_post.id, platform=p_name, status=PostStatus.SCHEDULED))
            
        # 3. Add Media
        for idx, url in enumerate(media_urls):
            db.add(MediaAsset(
                post_id=new_post.id,
                file_name=f"bulk_{idx}",
                file_type="image/jpeg",
                original_url=url,
                order=idx
            ))
            
        created_ids.append(new_post.id)
    
    await db.commit()
    return created_ids
