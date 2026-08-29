# E-Sentiment — Architecture Notes

## System flow

```
Citizen → Consultation page → Submit Feedback
        → POST /api/comments
        → Comment row inserted (status=pending)
        → app.ai.analyzer.analyze_text(text)
            → preprocessing.preprocess_text()
            → SentimentModel.predict()  (TF-IDF vectorizer + LogisticRegression)
            → keyword_extractor.extract_keywords()
        → SentimentResult row inserted, Comment.status=analyzed
        → Response returned to citizen (sentiment + confidence)

Admin → Dashboard
      → GET /api/dashboard/stats|trends|by-consultation|keywords
      → all values computed live via SQL aggregation over comments +
        sentiment_results — nothing cached or hardcoded
```

## Why this modularization

`backend/app/ai/analyzer.py` is the only file the rest of the backend is
allowed to import from the AI layer. It exposes exactly one function,
`analyze_text(text) -> dict`. This means:

- The comments router, the analyze router, and the seed script all call the
  same function, so a comment submitted by a citizen and a comment analyzed
  in the admin "AI Analyzer" playground go through *identical* code —
  there's no separate "demo" path that fakes a result.
- Swapping the model (e.g. to a Hugging Face Transformers pipeline) means
  rewriting `sentiment_model.py`'s `SentimentModel` class only. As long as
  `predict()` still returns `{sentiment, confidence, processed_text}`,
  nothing else in the codebase needs to change.

## Data model rationale

- `sentiment_results` is a separate table from `comments` (1:1) rather than
  extra columns on `comments`, so that a comment can exist in a
  "pending"/"failed" state before analysis completes, and so the schema
  matches the specification's required tables exactly.
- `reports.consultation_id` is nullable to support "overall" reports that
  span every consultation, not just a single one.
- `keywords` on `sentiment_results` is stored as a comma-separated string
  rather than a separate join table — sufficient for a prototype's read
  patterns (always read alongside the parent row) without another JOIN.

## Frontend data flow

`src/api/client.ts` is the only place that knows about `/api/*` routes and
Axios; every page imports typed functions from it (e.g. `fetchDashboardStats()`)
rather than calling `axios` directly. This keeps the actual REST contract in
one file and makes it easy to see, at a glance, everywhere in the UI that
talks to the backend.

Auth token is stored in `localStorage` and attached to every request via an
Axios request interceptor; `AuthContext` re-validates it against
`GET /api/auth/me` on page load so a refresh doesn't lose the session
silently attach an expired/invalid token.
