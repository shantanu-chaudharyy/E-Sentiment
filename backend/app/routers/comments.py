import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas, auth
from ..database import get_db
from ..ai.analyzer import analyze_text, ModelNotTrainedError

router = APIRouter(prefix="/api/comments", tags=["comments"])


def _run_sentiment_analysis(db: Session, comment: models.Comment):
    """Send the comment through the AI engine and persist the result."""
    try:
        result = analyze_text(comment.comment_text)
    except ModelNotTrainedError:
        comment.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Sentiment model is not trained yet. Run scripts/train_model.py.",
        )

    sr = models.SentimentResult(
        comment_id=comment.id,
        sentiment=result["sentiment"],
        confidence=result["confidence"],
        processed_text=result["processed_text"],
        keywords=",".join(result["keywords"]),
        model_version=result["model_version"],
    )
    db.add(sr)
    comment.status = "analyzed"
    db.commit()
    db.refresh(comment)
    return comment


def _to_out(c: models.Comment) -> schemas.CommentOut:
    sr_out = None
    if c.sentiment_result:
        sr_out = schemas.SentimentResultOut(
            sentiment=c.sentiment_result.sentiment,
            confidence=c.sentiment_result.confidence,
            processed_text=c.sentiment_result.processed_text,
            keywords=[k for k in c.sentiment_result.keywords.split(",") if k],
            model_version=c.sentiment_result.model_version,
            analyzed_at=c.sentiment_result.analyzed_at,
        )
    return schemas.CommentOut(
        id=c.id,
        consultation_id=c.consultation_id,
        consultation_title=c.consultation.title if c.consultation else None,
        comment_text=c.comment_text,
        submitted_at=c.submitted_at,
        submitter_name=c.submitter_name,
        status=c.status,
        sentiment_result=sr_out,
    )


@router.post("", response_model=schemas.CommentSubmitResponse, status_code=201)
def submit_comment(payload: schemas.CommentCreate, db: Session = Depends(get_db)):
    consultation = db.query(models.Consultation).filter(
        models.Consultation.id == payload.consultation_id
    ).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    if consultation.status != "Active":
        raise HTTPException(
            status_code=400,
            detail="This consultation is not currently accepting feedback.",
        )

    comment = models.Comment(
        consultation_id=payload.consultation_id,
        comment_text=payload.comment_text.strip(),
        submitter_name=payload.submitter_name or "Anonymous Citizen",
        status="pending",
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    comment = _run_sentiment_analysis(db, comment)
    return schemas.CommentSubmitResponse(comment=_to_out(comment))


@router.get("", response_model=dict)
def list_comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    sentiment: Optional[str] = None,
    consultation_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Comment).options(
        joinedload(models.Comment.sentiment_result),
        joinedload(models.Comment.consultation),
    )

    if search:
        q = q.filter(models.Comment.comment_text.ilike(f"%{search}%"))
    if consultation_id:
        q = q.filter(models.Comment.consultation_id == consultation_id)
    if sentiment:
        q = q.join(models.SentimentResult).filter(models.SentimentResult.sentiment == sentiment)
    if date_from:
        try:
            df = datetime.datetime.fromisoformat(date_from)
            q = q.filter(models.Comment.submitted_at >= df)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.datetime.fromisoformat(date_to)
            q = q.filter(models.Comment.submitted_at <= dt)
        except ValueError:
            pass

    total = q.count()
    q = q.order_by(models.Comment.submitted_at.desc())
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [_to_out(c) for c in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@router.get("/{comment_id}", response_model=schemas.CommentOut)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Comment).options(
        joinedload(models.Comment.sentiment_result),
        joinedload(models.Comment.consultation),
    ).filter(models.Comment.id == comment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Comment not found")
    return _to_out(c)
