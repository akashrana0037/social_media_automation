import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import SessionLocal
from app.models.posts import Post, PostPlatform
from app.models.core import Client, User

async def audit_posts():
    print("\n--- SOCIAL SYNC POST AUDIT ---")
    async with SessionLocal() as session:
        result = await session.execute(
            select(Post).options(selectinload(Post.platforms)).order_by(Post.created_at.desc())
        )
        posts = result.scalars().all()
        
        if not posts:
            print("No posts found in database.")
        else:
            for post in posts[:5]: # Check last 5
                print(f"Post ID: {post.id} | Status: {post.status} | Created: {post.created_at}")
                print(f"Caption: {post.caption[:50]}...")
                for plat in post.platforms:
                    print(f"  -> Platform: {plat.platform} | Status: {plat.status} | Error: {plat.error_message}")
                print("-" * 30)
    print("--- AUDIT COMPLETE ---\n")

if __name__ == "__main__":
    asyncio.run(audit_posts())
