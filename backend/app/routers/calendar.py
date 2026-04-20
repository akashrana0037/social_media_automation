from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import pandas as pd
from app.database import get_db
from app.services.calendar import parse_calendar_csv, bulk_create_posts
from app.dependencies.auth import get_current_active_user
from app.models.core import User

from app.models.posts import Post
from sqlalchemy import select

router = APIRouter()

@router.get("/")
async def get_calendar_events(
    db: AsyncSession = Depends(get_db)
):
    query = select(Post).where(Post.scheduled_at != None).order_by(Post.scheduled_at)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    events = []
    for p in posts:
        events.append({
            "id": p.id,
            "title": p.title or "Untitled Post",
            "start": p.scheduled_at.isoformat(),
            "platforms": [], # Simplified for dashboard
            "status": p.status,
            "type": p.content_type
        })
    return events

@router.post("/upload")
async def upload_calendar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    results = await parse_calendar_csv(content.decode('utf-8'))
    
    if isinstance(results, dict) and "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    
    # Process only valid rows
    valid_rows = [r for r in results if r['is_valid']]
    if valid_rows:
        created_ids = await bulk_create_posts(db, valid_rows, client_id=1)
        return {
            "status": "success",
            "posts_created": len(created_ids),
            "total_rows": len(results),
            "invalid_rows": len(results) - len(valid_rows)
        }
    
    return {"status": "error", "message": "No valid rows found in CSV", "results": results}

@router.get("/template")
async def download_template():
    csv_headers = [
        "post_title", "platforms", "content_type", "scheduled_date", 
        "scheduled_time", "caption", "hashtags", "media_url_1", "media_url_2"
    ]
    sample_row = [
        "Summer Product Launch", "instagram,facebook,linkedin", "feed", 
        "2026-06-01", "09:00", "Big news coming soon!", "#launch #summer", 
        "https://r2.example.com/image1.jpg", ""
    ]
    
    csv_content = ",".join(csv_headers) + "\n" + ",".join(sample_row)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=calendar_template.csv"}
    )

@router.get("/sheets-sync")
async def sync_google_sheets(
    sheet_url: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    # This will be implemented in Phase 2.2 once Google API is configured
    return {"message": "Google Sheets sync is being initialized. Please provide Google API keys in .env"}
