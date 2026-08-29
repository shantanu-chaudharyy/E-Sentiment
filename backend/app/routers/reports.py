import os
import csv
import io
import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


@router.post("/generate", response_model=schemas.ReportOut)
def generate_report(
    payload: schemas.ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    q = db.query(models.Comment).options(joinedload(models.Comment.sentiment_result),
                                          joinedload(models.Comment.consultation))
    consultation = None
    if payload.consultation_id:
        consultation = db.query(models.Consultation).filter(
            models.Consultation.id == payload.consultation_id
        ).first()
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        q = q.filter(models.Comment.consultation_id == payload.consultation_id)

    comments = q.all()
    pos = sum(1 for c in comments if c.sentiment_result and c.sentiment_result.sentiment == "Positive")
    neg = sum(1 for c in comments if c.sentiment_result and c.sentiment_result.sentiment == "Negative")
    neu = sum(1 for c in comments if c.sentiment_result and c.sentiment_result.sentiment == "Neutral")

    report_data = {
        "title": consultation.title if consultation else "Overall Sentiment Report",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "department": consultation.department if consultation else "Ministry of Corporate Affairs",
        "total_comments": len(comments),
        "positive_count": pos,
        "negative_count": neg,
        "neutral_count": neu,
        "comments": [
            {
                "comment": c.comment_text,
                "sentiment": c.sentiment_result.sentiment if c.sentiment_result else "Not analyzed",
                "confidence": c.sentiment_result.confidence if c.sentiment_result else None,
                "submitted_at": c.submitted_at.isoformat(),
            }
            for c in comments
        ],
    }

    ts = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    suffix = f"consultation_{payload.consultation_id}" if payload.consultation_id else "overall"
    filename = f"report_{suffix}_{ts}.json"
    file_path = os.path.join(REPORTS_DIR, filename)
    with open(file_path, "w") as f:
        json.dump(report_data, f, indent=2)

    report = models.Report(
        consultation_id=payload.consultation_id,
        file_path=os.path.join("data", "reports", filename),
        total_comments=len(comments),
        positive_count=pos,
        negative_count=neg,
        neutral_count=neu,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=List[schemas.ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    return db.query(models.Report).order_by(models.Report.generated_at.desc()).all()


@router.get("/export/csv")
def export_csv(
    consultation_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    q = db.query(models.Comment).options(joinedload(models.Comment.sentiment_result),
                                          joinedload(models.Comment.consultation))
    if consultation_id:
        q = q.filter(models.Comment.consultation_id == consultation_id)
    comments = q.order_by(models.Comment.submitted_at.desc()).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "id", "consultation", "comment", "sentiment", "confidence",
        "keywords", "submitted_at", "model_version",
    ])
    for c in comments:
        sr = c.sentiment_result
        writer.writerow([
            c.id,
            c.consultation.title if c.consultation else "",
            c.comment_text,
            sr.sentiment if sr else "",
            sr.confidence if sr else "",
            sr.keywords if sr else "",
            c.submitted_at.isoformat(),
            sr.model_version if sr else "",
        ])
    buffer.seek(0)
    filename = f"esentiment_export_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/model-metrics", response_model=schemas.ModelMetrics)
def model_metrics(current_user: models.User = Depends(auth.require_admin)):
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "..", "model", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Model metrics not found. Train the model first.")
    with open(metrics_path) as f:
        return json.load(f)
