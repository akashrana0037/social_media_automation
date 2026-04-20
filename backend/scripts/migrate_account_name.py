import asyncio
import asyncpg
from app.config import settings

async def migrate():
    # Convert sqlalchemy URL to asyncpg URL
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    try:
        await conn.execute("ALTER TABLE platform_tokens ADD COLUMN IF NOT EXISTS account_name TEXT")
        print("Migration successful: added account_name to platform_tokens")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
