import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from . import models  # noqa: F401  (ensures models are registered on Base)
from .routers import auth, consultations, comments, analyze, dashboard, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("esentiment")

app = FastAPI(
    title="E-Sentiment API",
    description="AI-Powered Sentiment Analysis System for E-Consultation Comments (SIH25035, Ministry of Corporate Affairs)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # relaxed for local prototype use
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables if they don't already exist (prototype-grade migration strategy)
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(consultations.router)
app.include_router(comments.router)
app.include_router(analyze.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)
app.mount("/files/reports", StaticFiles(directory=REPORTS_DIR), name="reports")


@app.get("/api/health")
def health_check():
    model_dir = os.path.join(os.path.dirname(__file__), "..", "model")
    model_ready = os.path.exists(os.path.join(model_dir, "vectorizer.joblib"))
    return {
        "status": "ok",
        "service": "E-Sentiment API",
        "model_ready": model_ready,
    }


@app.get("/")
def root():
    return {
        "message": "E-Sentiment API is running",
        "docs": "/docs",
        "health": "/api/health",
    }
