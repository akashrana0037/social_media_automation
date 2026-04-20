import httpx
import asyncio
import os

async def run_diagnostics():
    print("--- Starting Phase 3 Diagnostics ---")
    
    backend_url = "http://localhost:8000"
    
    # 1. Create a dummy file for the test
    test_image_path = "test_image.jpg"
    with open(test_image_path, "wb") as f:
        f.write(os.urandom(1024)) # create a 1KB random file
        
    try:
        # TEST 1: Media Upload Pipeline
        print(f"Test 1: Uploading Media to {backend_url}/api/media/upload...")
        async with httpx.AsyncClient() as client:
            with open(test_image_path, "rb") as f:
                upload_res = await client.post(
                    f"{backend_url}/api/media/upload",
                    files={"file": ("test_image.jpg", f, "image/jpeg")}
                )
            
            if upload_res.status_code != 200:
                print(f"ERROR: Upload Failed: {upload_res.text}")
                return
                
            upload_data = upload_res.json()
            media_url = upload_data.get("url")
            print(f"SUCCESS: Upload Success! Generated URL: {media_url}")
            
        # TEST 2: Post Creation Pipeline
        print(f"\nTest 2: Scheduling Post with Media URL to {backend_url}/api/posts/...")
        post_payload = {
            "title": "Automated Diagnostic Post",
            "content_type": "feed",
            "caption": "This is a test post from the system diagnostics.",
            "scheduled_at": "2026-12-31T23:59:59Z", # Schedule into the future
            "platforms": ["facebook", "instagram"],
            "media_urls": [media_url]
        }
        
        async with httpx.AsyncClient() as client:
            post_res = await client.post(
                f"{backend_url}/api/posts/?client_id=1",
                json=post_payload
            )
            
            if post_res.status_code != 201:
                print(f"ERROR: Post Creation Failed: {post_res.text}")
                return
                
            post_data = post_res.json()
            print(f"SUCCESS: Post Scheduled Success! Post ID: {post_data.get('id')}, Status: {post_data.get('status')}")
            
        print("\n--- Diagnostics Complete. All Systems Go! ---")
        
    except httpx.ConnectError:
        print("ERROR: Could not connect to the Backend server. Did it crash?")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR: An error occurred: {str(e)}")
    finally:
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

if __name__ == "__main__":
    asyncio.run(run_diagnostics())
