import asyncio
import asyncpg
from app.config import settings

async def migrate():
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    try:
        await conn.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform_data JSONB")
        print("Migration successful: added platform_data to posts")
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
