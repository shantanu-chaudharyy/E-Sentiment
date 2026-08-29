"""
Sentiment model: TF-IDF + Logistic Regression.

Design goal: keep this class as the ONLY place that knows about scikit-learn
so the model can later be swapped for a BERT/DistilBERT/Transformers-based
implementation. Anything outside this file should only ever call:

    model = SentimentModel.load(MODEL_DIR)
    result = model.predict(text)

MODEL_VERSION is bumped whenever the underlying algorithm/pipeline changes.
"""
import os
import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from .preprocessing import preprocess_text

MODEL_VERSION = "tfidf-logreg-v1.0"


class SentimentModel:
    def __init__(self, vectorizer=None, classifier=None, labels=None):
        self.vectorizer: TfidfVectorizer = vectorizer
        self.classifier: LogisticRegression = classifier
        self.labels = labels or ["Negative", "Neutral", "Positive"]

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    @classmethod
    def train(cls, texts, labels_list, test_size=0.2, random_state=42):
        processed = [preprocess_text(t) for t in texts]

        vectorizer = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            min_df=1,
        )
        X = vectorizer.fit_transform(processed)

        X_train, X_test, y_train, y_test = train_test_split(
            X, labels_list, test_size=test_size, random_state=random_state,
            stratify=labels_list,
        )

        classifier = LogisticRegression(
            max_iter=1000,
            C=2.0,
            class_weight="balanced",
        )
        classifier.fit(X_train, y_train)

        y_pred = classifier.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average="macro", zero_division=0
        )
        labels_sorted = sorted(set(labels_list))
        cm = confusion_matrix(y_test, y_pred, labels=labels_sorted).tolist()

        metrics = {
            "accuracy": round(float(accuracy), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "labels": labels_sorted,
            "confusion_matrix": cm,
            "train_size": int(X_train.shape[0]),
            "test_size": int(X_test.shape[0]),
            "model_version": MODEL_VERSION,
        }

        model = cls(vectorizer=vectorizer, classifier=classifier, labels=classifier.classes_.tolist())
        return model, metrics

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save(self, model_dir: str, metrics: dict = None):
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.vectorizer, os.path.join(model_dir, "vectorizer.joblib"))
        joblib.dump(self.classifier, os.path.join(model_dir, "classifier.joblib"))
        meta = {"model_version": MODEL_VERSION, "labels": self.labels}
        with open(os.path.join(model_dir, "meta.json"), "w") as f:
            json.dump(meta, f, indent=2)
        if metrics is not None:
            with open(os.path.join(model_dir, "metrics.json"), "w") as f:
                json.dump(metrics, f, indent=2)

    @classmethod
    def load(cls, model_dir: str):
        vectorizer = joblib.load(os.path.join(model_dir, "vectorizer.joblib"))
        classifier = joblib.load(os.path.join(model_dir, "classifier.joblib"))
        with open(os.path.join(model_dir, "meta.json")) as f:
            meta = json.load(f)
        return cls(vectorizer=vectorizer, classifier=classifier, labels=meta.get("labels"))

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict(self, text: str):
        processed = preprocess_text(text)
        if not processed:
            return {
                "sentiment": "Neutral",
                "confidence": 0.34,
                "processed_text": processed,
                "probabilities": {},
            }
        X = self.vectorizer.transform([processed])
        proba = self.classifier.predict_proba(X)[0]
        classes = self.classifier.classes_
        best_idx = int(np.argmax(proba))
        sentiment = classes[best_idx]
        confidence = float(proba[best_idx])
        prob_map = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}
        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 4),
            "processed_text": processed,
            "probabilities": prob_map,
        }
