import csv
import io
import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db
from ..ai.analyzer import analyze_text, ModelNotTrainedError
from .comments import _to_out

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


@router.post("", response_model=schemas.AnalyzeResponse)
def analyze(
    payload: schemas.AnalyzeRequest,
    current_user: models.User = Depends(auth.require_admin),
):
    try:
        result = analyze_text(payload.text)
    except ModelNotTrainedError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return schemas.AnalyzeResponse(**result)


@router.post("/batch", response_model=schemas.BatchAnalyzeResult)
async def analyze_batch(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded CSV")

    reader = csv.DictReader(io.StringIO(text))
    required_cols = {"comment", "consultation"}
    if not required_cols.issubset({c.strip().lower() for c in (reader.fieldnames or [])}):
        raise HTTPException(
            status_code=400,
            detail="CSV must contain 'comment' and 'consultation' columns (optional: 'date').",
        )

    # normalize header casing
    field_map = {c.lower(): c for c in reader.fieldnames}

    consultations_cache = {}
    processed, failed, errors, out_comments = 0, 0, [], []

    rows = list(reader)
    total_rows = len(rows)

    for idx, row in enumerate(rows, start=1):
        try:
            comment_text = (row.get(field_map.get("comment", "comment")) or "").strip()
            consultation_title = (row.get(field_map.get("consultation", "consultation")) or "").strip()
            date_str = row.get(field_map.get("date", "date"), "") if "date" in field_map else ""

            if not comment_text or not consultation_title:
                raise ValueError("missing comment or consultation")

            if consultation_title not in consultations_cache:
                consultation = db.query(models.Consultation).filter(
                    models.Consultation.title == consultation_title
                ).first()
                if not consultation:
                    now = datetime.datetime.utcnow()
                    consultation = models.Consultation(
                        title=consultation_title,
                        description="Auto-created from batch CSV upload.",
                        department="Ministry of Corporate Affairs",
                        start_date=now,
                        end_date=now + datetime.timedelta(days=30),
                        status="Active",
                    )
                    db.add(consultation)
                    db.commit()
                    db.refresh(consultation)
                consultations_cache[consultation_title] = consultation
            consultation = consultations_cache[consultation_title]

            submitted_at = datetime.datetime.utcnow()
            if date_str:
                try:
                    submitted_at = datetime.datetime.fromisoformat(date_str.strip())
                except ValueError:
                    pass

            comment = models.Comment(
                consultation_id=consultation.id,
                comment_text=comment_text,
                submitted_at=submitted_at,
                submitter_name="Batch Upload",
                status="pending",
            )
            db.add(comment)
            db.commit()
            db.refresh(comment)

            result = analyze_text(comment_text)
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

            out_comments.append(_to_out(comment))
            processed += 1
        except ModelNotTrainedError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            failed += 1
            errors.append(f"Row {idx}: {e}")

    return schemas.BatchAnalyzeResult(
        total_rows=total_rows,
        processed=processed,
        failed=failed,
        comments=out_comments,
        errors=errors,
    )
