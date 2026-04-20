import ffmpeg
import os
import shutil
import shortuuid
from pathlib import Path
from app.config import settings

UPLOADS_DIR = Path("uploads/media")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class MediaService:
    def __init__(self):
        self.base_url = settings.PUBLIC_API_URL # e.g. http://localhost:8000

    def upload_file(self, file_path: str, client_id: int, object_name: str = None) -> str:
        """
        Moves a file from a temporary location to the permanent uploads directory
        and returns the local URI or accessible URL.
        """
        if object_name is None:
            object_name = f"assets_{client_id}_{shortuuid.uuid()}_{os.path.basename(file_path)}"
            
        destination_path = UPLOADS_DIR / object_name
        
        # Copy or move file to final destination
        shutil.copy2(file_path, destination_path)
        
        # Return a relative path that can be served by FastAPI StaticFiles
        return f"/{destination_path.as_posix()}"
        
    def delete_local_file(self, file_path: str):
        """
        Deletes a file from the local filesystem to free up space.
        Expects a path like /uploads/media/filename.mp4 or uploads/media/filename.mp4
        """
        # Strip leading slash if present
        if file_path.startswith('/'):
            file_path = file_path[1:]
            
        full_path = Path(file_path)
        if full_path.exists() and full_path.is_file():
            os.remove(full_path)

    def process_video(self, input_path: str, output_path: str, aspect_ratio: str = "9:16"):
        # Enforce 9:16 for Reels/Shorts or 4:5 for feed
        width, height = (1080, 1920) if aspect_ratio == "9:16" else (1080, 1350)
        
        try:
            (
                ffmpeg
                .input(input_path)
                .filter('scale', width, height, force_original_aspect_ratio='decrease')
                .filter('pad', width, height, '(ow-iw)/2', '(oh-ih)/2', color='black')
                .output(output_path, vcodec='libx264', acodec='aac', strict='experimental', pix_fmt='yuv420p')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            print('stdout:', e.stdout.decode('utf8'))
            print('stderr:', e.stderr.decode('utf8'))
            raise e

    def generate_thumbnail(self, video_path: str, output_path: str, time_offset: float = 0.5):
        try:
            (
                ffmpeg
                .input(video_path, ss=time_offset)
                .filter('scale', 1080, -1)
                .output(output_path, vframes=1)
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            print('stderr:', e.stderr.decode('utf8'))
            raise e

media_service = MediaService()
