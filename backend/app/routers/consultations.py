from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/consultations", tags=["consultations"])


def _to_out(c: models.Consultation, count: int = None) -> schemas.ConsultationOut:
    out = schemas.ConsultationOut.model_validate(c)
    out.comment_count = count if count is not None else len(c.comments)
    return out


@router.get("", response_model=List[schemas.ConsultationOut])
def list_consultations(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(
        models.Consultation, func.count(models.Comment.id).label("cnt")
    ).outerjoin(models.Comment).group_by(models.Consultation.id)

    if status:
        q = q.filter(models.Consultation.status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(models.Consultation.title.ilike(like))

    q = q.order_by(models.Consultation.created_at.desc())
    results = q.all()
    return [_to_out(c, cnt) for c, cnt in results]


@router.get("/{consultation_id}", response_model=schemas.ConsultationOut)
def get_consultation(consultation_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Consultation).filter(models.Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return _to_out(c)


@router.post("", response_model=schemas.ConsultationOut, status_code=201)
def create_consultation(
    payload: schemas.ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    c = models.Consultation(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return _to_out(c, 0)


@router.put("/{consultation_id}", response_model=schemas.ConsultationOut)
def update_consultation(
    consultation_id: int,
    payload: schemas.ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    c = db.query(models.Consultation).filter(models.Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    db.commit()
    db.refresh(c)
    return _to_out(c)


@router.delete("/{consultation_id}", status_code=204)
def delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin),
):
    c = db.query(models.Consultation).filter(models.Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found")
    db.delete(c)
    db.commit()
    return None
