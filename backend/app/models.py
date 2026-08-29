import datetime
import enum
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum
)
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    citizen = "citizen"


class ConsultationStatus(str, enum.Enum):
    draft = "Draft"
    active = "Active"
    closed = "Closed"


class CommentStatus(str, enum.Enum):
    pending = "pending"
    analyzed = "analyzed"
    failed = "failed"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.admin.value, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    department = Column(String(150), default="Ministry of Corporate Affairs")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), default=ConsultationStatus.draft.value)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    comments = relationship("Comment", back_populates="consultation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="consultation", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=False)
    comment_text = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitter_name = Column(String(120), default="Anonymous Citizen")
    status = Column(String(20), default=CommentStatus.pending.value)

    consultation = relationship("Consultation", back_populates="comments")
    sentiment_result = relationship(
        "SentimentResult", back_populates="comment", uselist=False,
        cascade="all, delete-orphan"
    )


class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False, unique=True)
    sentiment = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)
    processed_text = Column(Text, default="")
    keywords = Column(Text, default="")  # comma-separated
    model_version = Column(String(50), default="")
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)

    comment = relationship("Comment", back_populates="sentiment_result")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    file_path = Column(String(500), nullable=False)
    total_comments = Column(Integer, default=0)
    positive_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)

    consultation = relationship("Consultation", back_populates="reports")
