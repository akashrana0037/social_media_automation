from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from app.routers import auth, clients, posts, calendar, analytics, webhooks, social, media, ai
from app.services.dispatcher import dispatch_scheduled_posts

app = FastAPI(
    title="Social Media Automation API",
    description="Agency-grade social media automation platform backend",
    version="2.0.0"
)

# Mount uploads directory to serve media locally
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "*", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(dispatch_scheduled_posts())

@app.get("/")
async def root():
    return {"message": "Social Media Automation API is running", "version": "2.0.0"}

# Include routers
app.include_router(auth, prefix="/api/auth", tags=["Authentication"])
app.include_router(clients, prefix="/api/clients", tags=["Clients"])
app.include_router(social, prefix="/api/social", tags=["Social Accounts"])
app.include_router(posts, prefix="/api/posts", tags=["Posts"])
app.include_router(calendar, prefix="/api/calendar", tags=["Calendar"])
app.include_router(analytics, prefix="/api/analytics", tags=["Analytics"])
app.include_router(webhooks, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(media, prefix="/api/media", tags=["Media Management"])
