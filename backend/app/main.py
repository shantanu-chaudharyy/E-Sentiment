import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base, SessionLocal
from . import models
from . import auth
from .routers import (
    auth as auth_router,
    consultations,
    comments,
    analyze,
    dashboard,
    reports,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("esentiment")


app = FastAPI(
    title="E-Sentiment API",
    description="AI-Powered Sentiment Analysis System for E-Consultation Comments (SIH25035, Ministry of Corporate Affairs)",
    version="1.0.0",
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# Create demo admin automatically on server startup
# --------------------------------------------------

def ensure_demo_admin():
    db = SessionLocal()

    try:
        existing = (
            db.query(models.User)
            .filter(
                models.User.email == "admin@esentiment.local"
            )
            .first()
        )

        if existing:
            logger.info("Demo admin already exists.")
            return

        admin = models.User(
            name="E-Sentiment Admin",
            email="admin@esentiment.local",
            password_hash=auth.hash_password("admin123"),
            role="admin",
        )

        db.add(admin)
        db.commit()

        logger.info("Created demo admin account.")

    except Exception:
        db.rollback()
        logger.exception("Failed to create demo admin.")

    finally:
        db.close()


# Run admin check when backend starts
ensure_demo_admin()


# --------------------------------------------------
# API Routers
# --------------------------------------------------

app.include_router(auth_router.router)
app.include_router(consultations.router)
app.include_router(comments.router)
app.include_router(analyze.router)
app.include_router(dashboard.router)
app.include_router(reports.router)


# --------------------------------------------------
# Reports
# --------------------------------------------------

REPORTS_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "reports",
)

os.makedirs(REPORTS_DIR, exist_ok=True)

app.mount(
    "/files/reports",
    StaticFiles(directory=REPORTS_DIR),
    name="reports",
)


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/api/health")
def health_check():

    model_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "model",
    )

    model_ready = os.path.exists(
        os.path.join(
            model_dir,
            "vectorizer.joblib",
        )
    )

    return {
        "status": "ok",
        "service": "E-Sentiment API",
        "model_ready": model_ready,
    }


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():

    return {
        "message": "E-Sentiment API is running",
        "docs": "/docs",
        "health": "/api/health",
    }