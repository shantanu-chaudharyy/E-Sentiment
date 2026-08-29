"""
Text preprocessing utilities for the E-Sentiment AI engine.

Kept dependency-free (no NLTK/spaCy download requirement) so the prototype
runs offline out of the box. This module can be swapped later for a more
sophisticated pipeline (e.g. spaCy lemmatization) without touching the
rest of the AI layer, since `preprocess_text` is the only public contract.
"""
import re

STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "and", "or", "but", "if", "then", "so", "of", "at", "by", "for", "with",
    "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "once", "here",
    "there", "all", "any", "both", "each", "few", "more", "most", "other",
    "some", "such", "only", "own", "same", "than", "too", "very", "s", "t",
    "can", "will", "just", "don", "should", "now", "i", "me", "my", "we",
    "our", "you", "your", "he", "she", "it", "they", "them", "this", "that",
    "these", "those", "am", "as", "do", "does", "did", "doing", "have",
    "has", "had", "having", "not", "no", "nor",
}

# Very small suffix-stripping "lemmatizer" — good enough for a TF-IDF
# demonstration pipeline without external model downloads.
_SUFFIXES = ("ing", "edly", "ed", "es", "ly")


def _simple_lemmatize(token: str) -> str:
    for suf in _SUFFIXES:
        if token.endswith(suf) and len(token) - len(suf) >= 3:
            return token[: -len(suf)]
    return token


def clean_text(text: str) -> str:
    """Lowercase, strip punctuation/numbers, collapse whitespace."""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str):
    return text.split()


def remove_stopwords(tokens):
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]


def lemmatize(tokens):
    return [_simple_lemmatize(t) for t in tokens]


def preprocess_text(text: str) -> str:
    """
    Full preprocessing pipeline used both at training time and inference
    time so the feature space is always consistent:
        lowercase -> strip punctuation/numbers -> tokenize
        -> remove stopwords -> lemmatize -> rejoin
    """
    if not text:
        return ""
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    tokens = lemmatize(tokens)
    return " ".join(tokens)
