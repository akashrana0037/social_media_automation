import json
import httpx
from urllib.parse import urlencode
from app.config import settings
from typing import Dict, Any, Optional, List

class MetaSocialService:
    def __init__(self):
        self.client_id = settings.META_CLIENT_ID
        self.client_secret = settings.META_CLIENT_SECRET
        self.base_url = "https://graph.facebook.com/v19.0"
        
        # In production this needs to match exactly what you configure in Meta App dashboard
        self.redirect_uri = f"{settings.PUBLIC_API_URL}/api/social/meta/callback"

    def get_auth_url(self, client_id_db: int) -> str:
        """
        Generates the authorization URL to redirect the user to Meta's login page.
        Passes the internal DB client ID as state so we know who they are on callback.
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "state": str(client_id_db), # We use state to pass our internal client_id to the callback
            "scope": "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish",
            "response_type": "code"
        }
        return f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> str:
        """
        Exchanges the short-lived authorization code for a short-lived access token.
        """
        url = f"{self.base_url}/oauth/access_token"
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "client_secret": self.client_secret,
            "code": code
        }
        async with httpx.AsyncClient() as client:
            # Use POST for security and compatibility
            response = await client.post(url, data=params)
            if response.status_code != 200:
                print(f"!!! META TOKEN EXCHANGE FAILED [{response.status_code}]: {response.text}")
            response.raise_for_status()
            data = response.json()
            return data.get("access_token")

    async def get_long_lived_token(self, short_token: str) -> str:
        """
        Exchanges a short-lived access token for a long-lived access token (usually valid for 60 days).
        """
        url = f"{self.base_url}/oauth/access_token"
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "fb_exchange_token": short_token
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("access_token")

    async def fetch_user_pages(self, access_token: str) -> list:
        """
        Fetches the list of Facebook Pages the user manages.
        """
        url = f"{self.base_url}/me/accounts"
        params = {"access_token": access_token}
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json().get("data", [])

    async def fetch_ig_account_id(self, page_id: str, page_access_token: str) -> Optional[Dict[str, str]]:
        """
        Fetches the Instagram Business account linked to a specific Facebook Page.
        """
        url = f"{self.base_url}/{page_id}"
        params = {
            "fields": "instagram_business_account",
            "access_token": page_access_token
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                return None
            
            data = response.json()
            ig_node = data.get("instagram_business_account")
            if ig_node:
                return {
                    "id": ig_node.get("id"),
                    "name": "Linked Instagram" # We can fetch name later if needed
                }
            return None

    async def publish_to_facebook(self, page_id: str, access_token: str, message: str, media_urls: List[str] = None, link: str = None, is_story: bool = False) -> Dict[str, Any]:
        """
        Publishes a post to a Facebook Page. Supports text, single image/video, multi-photo (Carousel), and Stories (beta).
        """
        async with httpx.AsyncClient() as client:
            if is_story:
                # Organic Page Stories via Graph API are restricted to internal/partner apps usually, 
                # but target_surface=STORY is the standard protocol for some accounts.
                if not media_urls or len(media_urls) == 0:
                    raise Exception("Facebook Story requires an image or video.")
                
                url = media_urls[0]
                is_video = any(ext in url.lower() for ext in ['.mp4', '.mov', '.avi'])
                endpoint = f"{self.base_url}/{page_id}/{'videos' if is_video else 'photos'}"
                payload = {
                    "access_token": access_token,
                    "target_surface": "STORY",
                    "published": "true"
                }
                if is_video:
                    payload["file_url"] = url
                    payload["description"] = message
                else:
                    payload["url"] = url
                    payload["message"] = message
                
                res = await client.post(endpoint, data=payload)
                res.raise_for_status()
                return res.json()

            if media_urls and len(media_urls) > 1:
                # Multi-photo post
                photo_ids = []
                for url in media_urls:
                    photo_res = await client.post(
                        f"{self.base_url}/{page_id}/photos",
                        data={"access_token": access_token, "url": url, "published": "false"}
                    )
                    photo_res.raise_for_status()
                    photo_ids.append(photo_res.json()["id"])
                
                payload = {
                    "access_token": access_token,
                    "message": message,
                    "attached_media": json.dumps([{"media_fbid": pid} for pid in photo_ids])
                }
                res = await client.post(f"{self.base_url}/{page_id}/feed", data=payload)
                res.raise_for_status()
                return res.json()

            elif media_urls and len(media_urls) == 1:
                image_url = media_urls[0]
                is_video = any(ext in image_url.lower() for ext in ['.mp4', '.mov', '.avi'])
                if is_video:
                    url = f"{self.base_url}/{page_id}/videos"
                    payload = {"access_token": access_token, "description": message, "file_url": image_url}
                else:
                    url = f"{self.base_url}/{page_id}/photos"
                    payload = {"access_token": access_token, "message": message, "url": image_url}
                
                # Pro: Add location if available
                location_id = kwargs.get("location_id")
                if location_id:
                    payload["place"] = location_id

                res = await client.post(url, data=payload)
                res.raise_for_status()
                return res.json()
            
            else:
                # Text or Link only
                url = f"{self.base_url}/{page_id}/feed"
                payload = {"access_token": access_token, "message": message}
                if link:
                    payload["link"] = link
                res = await client.post(url, data=payload)
                res.raise_for_status()
                return res.json()

    async def _wait_for_container(self, container_id: str, access_token: str):
        """
        Polls the container status until it's 'FINISHED' or fails.
        Essential for Reels, Stories, and Carousels as they are processed asynchronously.
        """
        url = f"{self.base_url}/{container_id}"
        params = {
            "fields": "status_code,status",
            "access_token": access_token
        }
        
        async with httpx.AsyncClient() as client:
            for _ in range(15): # Max 30 seconds (15 * 2)
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    status = data.get("status_code")
                    if status == "FINISHED":
                        return True
                    if status == "ERROR":
                        raise Exception(f"Meta container error: {data.get('status')}")
                
                await asyncio.sleep(2)
            
            raise Exception("Meta container timeout: Processing took too long.")

    async def _post_comment(self, media_id: str, access_token: str, message: str):
        """
        Posts a first comment on a newly published media.
        """
        url = f"{self.base_url}/{media_id}/comments"
        payload = {
            "access_token": access_token,
            "message": message
        }
        async with httpx.AsyncClient() as client:
            try:
                await client.post(url, data=payload)
            except Exception as e:
                print(f"Warning: Failed to post first comment: {str(e)}")

    async def publish_to_instagram(self, ig_user_id: str, access_token: str, caption: str, media_urls: List[str], is_reel: bool = False, is_story: bool = False, **kwargs) -> Dict[str, Any]:
        """
        Publishes a photo, story, reel or multi-image carousel to Instagram.
        Supports advanced features: location_id, cover_url, and first_comment.
        """
        async with httpx.AsyncClient() as client:
            if not media_urls:
                raise Exception("Instagram requires at least one media asset.")

            if len(media_urls) > 1 and not is_story:
                # Step 1: Create each item container
                child_ids = []
                for url in media_urls:
                    is_video = any(ext in url.lower() for ext in ['.mp4', '.mov', '.avi'])
                    item_payload = {
                        "access_token": access_token,
                        "is_carousel_item": "true"
                    }
                    if is_video:
                        item_payload["video_url"] = url
                        item_payload["media_type"] = "VIDEO"
                    else:
                        item_payload["image_url"] = url
                    
                    item_res = await client.post(f"{self.base_url}/{ig_user_id}/media", data=item_payload)
                    item_res.raise_for_status()
                    child_ids.append(item_res.json()["id"])
                
                # Wait for all children to be ready (Meta requires children to be processed before parent)
                for cid in child_ids:
                    await self._wait_for_container(cid, access_token)

                # Step 2: Create Parent CAROUSEL container
                parent_payload = {
                    "access_token": access_token,
                    "caption": caption,
                    "media_type": "CAROUSEL",
                    "children": ",".join(child_ids)
                }
                parent_res = await client.post(f"{self.base_url}/{ig_user_id}/media", data=parent_payload)
                parent_res.raise_for_status()
                creation_id = parent_res.json()["id"]

            else:
                # Single Media logic (Feed, Reel, or Story)
                image_url = media_urls[0]
                is_video = any(ext in image_url.lower() for ext in ['.mp4', '.mov', '.avi'])
                container_payload = {
                    "access_token": access_token,
                    "caption": caption
                }
                if is_story:
                    container_payload["media_type"] = "STORIES"
                    if is_video:
                        container_payload["video_url"] = image_url
                    else:
                        container_payload["image_url"] = image_url
                elif is_reel:
                    container_payload["media_type"] = "REELS"
                    container_payload["video_url"] = image_url
                    # Pro: Cover photo for Reels
                    if kwargs.get("cover_url"):
                        container_payload["cover_url"] = kwargs.get("cover_url")
                else:
                    if is_video:
                        container_payload["media_type"] = "VIDEO"
                        container_payload["video_url"] = image_url
                    else:
                        container_payload["image_url"] = image_url
                
                # Pro: Add location if available
                if kwargs.get("location_id"):
                    container_payload["location_id"] = kwargs.get("location_id")
                
                container_res = await client.post(f"{self.base_url}/{ig_user_id}/media", data=container_payload)
                container_res.raise_for_status()
                creation_id = container_res.json()["id"]

            # Step 3: Wait for processing before publishing
            await self._wait_for_container(creation_id, access_token)

            # Step 4: Final Publish
            publish_res = await client.post(
                f"{self.base_url}/{ig_user_id}/media_publish",
                data={"access_token": access_token, "creation_id": creation_id}
            )
            publish_res.raise_for_status()
            result = publish_res.json()
            media_id = result.get("id")

            # Pro: Post First Comment
            if media_id and kwargs.get("first_comment"):
                import asyncio
                # Small delay to ensure the post is Indexed by Meta's search engine
                await asyncio.sleep(2)
                await self._post_comment(media_id, access_token, kwargs.get("first_comment"))

            return result

meta_service = MetaSocialService()
