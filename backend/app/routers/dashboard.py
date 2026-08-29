from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..ai.keyword_extractor import extract_corpus_keywords

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total_comments = db.query(func.count(models.Comment.id)).scalar() or 0

    sentiment_counts = dict(
        db.query(models.SentimentResult.sentiment, func.count(models.SentimentResult.id))
        .group_by(models.SentimentResult.sentiment)
        .all()
    )
    positive = sentiment_counts.get("Positive", 0)
    negative = sentiment_counts.get("Negative", 0)
    neutral = sentiment_counts.get("Neutral", 0)
    analyzed_total = positive + negative + neutral

    avg_conf = db.query(func.avg(models.SentimentResult.confidence)).scalar() or 0.0

    total_consultations = db.query(func.count(models.Consultation.id)).scalar() or 0
    active_consultations = db.query(func.count(models.Consultation.id)).filter(
        models.Consultation.status == "Active"
    ).scalar() or 0

    def pct(n):
        return round((n / analyzed_total) * 100, 1) if analyzed_total else 0.0

    return schemas.DashboardStats(
        total_comments=total_comments,
        positive_count=positive,
        negative_count=negative,
        neutral_count=neutral,
        positive_pct=pct(positive),
        negative_pct=pct(negative),
        neutral_pct=pct(neutral),
        average_confidence=round(float(avg_conf) * 100, 1),
        total_consultations=total_consultations,
        active_consultations=active_consultations,
    )


@router.get("/by-consultation", response_model=List[schemas.SentimentByConsultation])
def sentiment_by_consultation(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Consultation.id,
            models.Consultation.title,
            models.SentimentResult.sentiment,
            func.count(models.SentimentResult.id),
        )
        .join(models.Comment, models.Comment.consultation_id == models.Consultation.id)
        .join(models.SentimentResult, models.SentimentResult.comment_id == models.Comment.id)
        .group_by(models.Consultation.id, models.SentimentResult.sentiment)
        .all()
    )

    agg = {}
    for cid, title, sentiment, count in rows:
        if cid not in agg:
            agg[cid] = {"consultation_id": cid, "consultation_title": title,
                        "positive": 0, "negative": 0, "neutral": 0, "total": 0}
        key = sentiment.lower()
        if key in agg[cid]:
            agg[cid][key] = count
        agg[cid]["total"] += count

    return [schemas.SentimentByConsultation(**v) for v in agg.values()]


@router.get("/trends", response_model=List[schemas.TrendPoint])
def sentiment_trends(db: Session = Depends(get_db)):
    rows = (
        db.query(
            func.date(models.Comment.submitted_at).label("day"),
            models.SentimentResult.sentiment,
            func.count(models.SentimentResult.id),
        )
        .join(models.SentimentResult, models.SentimentResult.comment_id == models.Comment.id)
        .group_by("day", models.SentimentResult.sentiment)
        .order_by("day")
        .all()
    )

    agg = {}
    for day, sentiment, count in rows:
        if day not in agg:
            agg[day] = {"date": day, "positive": 0, "negative": 0, "neutral": 0}
        key = sentiment.lower()
        if key in agg[day]:
            agg[day][key] = count

    return [schemas.TrendPoint(**v) for v in sorted(agg.values(), key=lambda x: x["date"])]


@router.get("/keywords", response_model=List[schemas.KeywordCount])
def top_keywords(limit: int = 15, db: Session = Depends(get_db)):
    processed_texts = [
        r[0] for r in db.query(models.SentimentResult.processed_text).all()
    ]
    keywords = extract_corpus_keywords(processed_texts, top_n=limit)
    return [schemas.KeywordCount(**k) for k in keywords]
