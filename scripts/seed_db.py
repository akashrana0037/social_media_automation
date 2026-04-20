import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os
import sys
from dotenv import load_dotenv

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Load the .env from the backend folder
load_dotenv(os.path.join(os.getcwd(), "backend", ".env"))

# Import all models to resolve relationships
from app.models.core import Client, User, PlatformToken
from app.models.posts import Post
from app.config import settings

async def create_test_client():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if client 1 already exists
        result = await session.execute(select(Client).where(Client.id == 1))
        existing_client = result.scalar_one_or_none()

        if not existing_client:
            test_client = Client(
                id=1,
                name="Astra Agency (Test Client)",
                subdomain="astra-test",
                branding={"primary_color": "#1A56DB", "logo": "https://via.placeholder.com/150"}
            )
            session.add(test_client)
            await session.commit()
            print("Successfully created Test Client with ID 1.")
        else:
            print("Test Client with ID 1 already exists.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_test_client())
