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
import csv
import os
from .sentiment_model import SentimentModel, MODEL_VERSION
from .keyword_extractor import extract_keywords

_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "model")
_model_cache = None


class ModelNotTrainedError(RuntimeError):
    pass


def ensure_model() -> bool:
    """Create the bundled demonstration model when a fresh deploy has none.

    Render (and most container hosts) start each deploy with a new filesystem.
    Model artifacts are generated files, so they are deliberately not committed.
    The labeled demo CSV *is* committed, which lets the API restore the model
    automatically on first startup.
    """
    required_artifacts = ("vectorizer.joblib", "classifier.joblib", "meta.json")
    if all(os.path.exists(os.path.join(_MODEL_DIR, artifact)) for artifact in required_artifacts):
        return False

    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "training_data.csv")
    if not os.path.exists(data_path):
        raise ModelNotTrainedError(
            "Sentiment model and training data are both unavailable. "
            "Deploy backend/data/training_data.csv or train the model before starting the API."
        )

    with open(data_path, newline="", encoding="utf-8") as csv_file:
        rows = list(csv.DictReader(csv_file))

    texts = [row["text"] for row in rows if row.get("text") and row.get("label")]
    labels = [row["label"] for row in rows if row.get("text") and row.get("label")]
    if not texts:
        raise ModelNotTrainedError("Training data contains no labeled text rows.")

    model, metrics = SentimentModel.train(texts, labels)
    model.save(_MODEL_DIR, metrics=metrics)
    return True


def _get_model() -> SentimentModel:
    global _model_cache
    if _model_cache is None:
        required_artifacts = ("vectorizer.joblib", "classifier.joblib", "meta.json")
        if not all(os.path.exists(os.path.join(_MODEL_DIR, artifact)) for artifact in required_artifacts):
            ensure_model()
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
