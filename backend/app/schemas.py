import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    name: str
    email: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------------
# Consultations
# ---------------------------------------------------------------------
class ConsultationCreate(BaseModel):
    title: str
    description: str = ""
    department: str = "Ministry of Corporate Affairs"
    start_date: datetime.datetime
    end_date: datetime.datetime
    status: str = "Draft"


class ConsultationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    start_date: Optional[datetime.datetime] = None
    end_date: Optional[datetime.datetime] = None
    status: Optional[str] = None


class ConsultationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    title: str
    description: str
    department: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    status: str
    created_at: datetime.datetime
    comment_count: int = 0


# ---------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------
class CommentCreate(BaseModel):
    consultation_id: int
    comment_text: str = Field(..., min_length=2, max_length=5000)
    submitter_name: Optional[str] = "Anonymous Citizen"


class SentimentResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    sentiment: str
    confidence: float
    processed_text: str
    keywords: List[str]
    model_version: str
    analyzed_at: datetime.datetime


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    consultation_id: int
    consultation_title: Optional[str] = None
    comment_text: str
    submitted_at: datetime.datetime
    submitter_name: str
    status: str
    sentiment_result: Optional[SentimentResultOut] = None


class CommentSubmitResponse(BaseModel):
    comment: CommentOut
    message: str = "Your feedback has been submitted successfully."


# ---------------------------------------------------------------------
# AI Analyze
# ---------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class AnalyzeResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    sentiment: str
    confidence: float
    processed_text: str
    keywords: List[str]
    probabilities: dict
    model_version: str


class BatchAnalyzeResult(BaseModel):
    total_rows: int
    processed: int
    failed: int
    comments: List[CommentOut]
    errors: List[str] = []


# ---------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------
class DashboardStats(BaseModel):
    total_comments: int
    positive_count: int
    negative_count: int
    neutral_count: int
    positive_pct: float
    negative_pct: float
    neutral_pct: float
    average_confidence: float
    total_consultations: int
    active_consultations: int


class SentimentByConsultation(BaseModel):
    consultation_id: int
    consultation_title: str
    positive: int
    negative: int
    neutral: int
    total: int


class TrendPoint(BaseModel):
    date: str
    positive: int
    negative: int
    neutral: int


class KeywordCount(BaseModel):
    keyword: str
    count: int


# ---------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------
class ReportGenerateRequest(BaseModel):
    consultation_id: Optional[int] = None  # None = overall report


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    consultation_id: Optional[int]
    generated_at: datetime.datetime
    file_path: str
    total_comments: int
    positive_count: int
    negative_count: int
    neutral_count: int


class ModelMetrics(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    labels: List[str]
    confusion_matrix: List[List[int]]
    train_size: int
    test_size: int
    model_version: str
