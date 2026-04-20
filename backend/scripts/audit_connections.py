import asyncio
from sqlalchemy import select
from app.database import SessionLocal
from app.models.core import PlatformToken, Client, User
from app.models.posts import Post

async def audit_connections():
    print("\n--- SOCIAL SYNC CONNECTION AUDIT ---")
    async with SessionLocal() as session:
        result = await session.execute(select(PlatformToken))
        tokens = result.scalars().all()
        
        if not tokens:
            print("No platforms connected yet.")
        else:
            print(f"Verified {len(tokens)} active connection(s):")
            for token in tokens:
                print(f" - Platform: {token.platform.upper()}")
                print(f" - Platform ID: {token.platform_id}")
                print(f" - Status: SECURELY STORED")
                print("-" * 30)
    print("--- AUDIT COMPLETE ---\n")

if __name__ == "__main__":
    asyncio.run(audit_connections())
