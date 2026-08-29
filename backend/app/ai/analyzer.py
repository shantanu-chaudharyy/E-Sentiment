"""
Analyzer facade — the single entry point the rest of the backend calls into.

    from app.ai.analyzer import analyze_text
    result = analyze_text("This policy will help small businesses.")

Returns:
    {
        "sentiment": "Positive" | "Negative" | "Neutral",
        "confidence": 0.92,
        "processed_text": "policy help small business",
        "keywords": ["policy", "help", "business"],
        "model_version": "tfidf-logreg-v1.0",
    }

The model is loaded lazily and cached in-process. If no trained model is
found on disk, a clear error is raised so the API layer can surface a
meaningful message rather than silently faking a result.
"""
import os
from .sentiment_model import SentimentModel, MODEL_VERSION
from .keyword_extractor import extract_keywords

_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "model")
_model_cache = None


class ModelNotTrainedError(RuntimeError):
    pass


def _get_model() -> SentimentModel:
    global _model_cache
    if _model_cache is None:
        vectorizer_path = os.path.join(_MODEL_DIR, "vectorizer.joblib")
        if not os.path.exists(vectorizer_path):
            raise ModelNotTrainedError(
                "Sentiment model not found. Run scripts/train_model.py first."
            )
        _model_cache = SentimentModel.load(_MODEL_DIR)
    return _model_cache


def reload_model():
    """Force a fresh load next time _get_model() is called (used after retraining)."""
    global _model_cache
    _model_cache = None


def analyze_text(text: str) -> dict:
    if text is None or not text.strip():
        raise ValueError("text must be a non-empty string")

    model = _get_model()
    result = model.predict(text)
    keywords = extract_keywords(result["processed_text"], model.vectorizer, top_n=6)

    return {
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "processed_text": result["processed_text"],
        "keywords": keywords,
        "probabilities": result["probabilities"],
        "model_version": MODEL_VERSION,
    }
