"""
Trains the TF-IDF + Logistic Regression sentiment model on the
demonstration dataset and saves the model + evaluation metrics to
backend/model/.

Run:
    python scripts/train_model.py
"""
import os
import sys
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.ai.sentiment_model import SentimentModel  # noqa: E402

BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
DATA_PATH = os.path.join(BASE_DIR, "data", "training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")


def main():
    if not os.path.exists(DATA_PATH):
        print("Training data not found — generating it first...")
        os.system(f"{sys.executable} {os.path.join(os.path.dirname(__file__), 'generate_training_data.py')}")

    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=["text", "label"])
    print(f"Loaded {len(df)} labeled rows from {DATA_PATH}")
    print(df["label"].value_counts())

    model, metrics = SentimentModel.train(df["text"].tolist(), df["label"].tolist())

    model.save(MODEL_DIR, metrics=metrics)
    print("\nModel saved to", MODEL_DIR)
    print("\nEvaluation metrics (computed on held-out test split):")
    for k, v in metrics.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
