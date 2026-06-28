from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.db.session import engine
from app.db.base import Base
from app.db.init_db import init_db
from app.db.session import SessionLocal
import os

app = FastAPI(
    title="DocuFlow AI API",
    description="AI Document & Invoice Intelligence Platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
def on_startup():
    # Base.metadata.create_all acts as a fallback/convenience helper for the demo environment.
    # Alembic migrations remain the primary schema management mechanism for production deployments.
    Base.metadata.create_all(bind=engine)
    
    # Ensure local upload directory exists (safe for local & Docker)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Run database seed checks (idempotent, checks each table individually)
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}
