"""
Lightweight keyword extraction.

For the prototype we rank tokens of the (already stopword-stripped)
processed text by their TF-IDF weight using the SAME vectorizer that the
sentiment model was trained with, so the "important" words we surface are
exactly the ones driving the model's decision. This keeps the AI layer
internally consistent and avoids pulling in an extra NLP dependency.
"""
from typing import List


def extract_keywords(processed_text: str, vectorizer, top_n: int = 5) -> List[str]:
    if not processed_text:
        return []

    try:
        vocab = vectorizer.vocabulary_
        idf = vectorizer.idf_
    except AttributeError:
        # Vectorizer not fitted yet — fall back to raw token frequency.
        tokens = processed_text.split()
        seen = []
        for t in tokens:
            if t not in seen:
                seen.append(t)
        return seen[:top_n]

    tokens = processed_text.split()
    scored = {}
    for tok in tokens:
        if tok in vocab:
            idx = vocab[tok]
            # weight by idf so rarer/more distinctive words rank higher
            scored[tok] = idf[idx]

    if not scored:
        # none of the tokens were in the training vocabulary
        seen = []
        for t in tokens:
            if t not in seen:
                seen.append(t)
        return seen[:top_n]

    ranked = sorted(scored.items(), key=lambda kv: kv[1], reverse=True)
    return [w for w, _ in ranked[:top_n]]


def extract_corpus_keywords(processed_texts: List[str], top_n: int = 15):
    """
    Aggregate keyword frequency across many comments — used to power the
    'Top Keywords' dashboard chart.
    """
    from collections import Counter

    counter = Counter()
    for text in processed_texts:
        if not text:
            continue
        counter.update(set(text.split()))

    return [{"keyword": k, "count": c} for k, c in counter.most_common(top_n)]
