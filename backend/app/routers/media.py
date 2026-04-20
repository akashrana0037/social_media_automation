from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import aiofiles
import os
import shortuuid
from pathlib import Path

from app.database import get_db
from app.config import settings

router = APIRouter()

# Ensure the upload directory exists
UPLOADS_DIR = Path("uploads/media")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    client_id: int = 1, # Placeholder for now
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a media asset (image/video) to local storage.
    """
    # 1. Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "video/mp4"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not supported. Use JPG, PNG, WEBP, or MP4."
        )

    # 2. Generate unique filename
    extension = os.path.splitext(file.filename)[1]
    filename = f"cli_{client_id}_{shortuuid.uuid()}{extension}"
    file_path = UPLOADS_DIR / filename

    # 3. Save file asynchronously
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            while content := await file.read(1024 * 1024): # Read in 1MB chunks
                await out_file.write(content)
                
        # 4. Generate the public URL
        public_url = f"{settings.PUBLIC_API_URL}/uploads/media/{filename}"
        
        return {
            "status": "success",
            "file_name": filename,
            "original_name": file.filename,
            "url": public_url,
            "content_type": file.content_type
        }
        
    except Exception as e:
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
