# E-Sentiment — AI-Powered Sentiment Analysis for E-Consultation Comments

Prototype built for **Smart India Hackathon problem statement SIH25035**
("Sentiment analysis of comments received through E-consultation module"),
Ministry of Corporate Affairs.

This is a **working full-stack prototype**: a citizen submits a comment on a
published consultation → the comment is stored in SQLite → it is sent to a
trained TF-IDF + Logistic Regression model → the predicted sentiment
(Positive / Negative / Neutral) and confidence score are stored → an admin
dashboard reads live statistics from the database and lets analysts search,
filter, batch-analyze, and export reports.

Nothing in the dashboard or comment list is hardcoded — every number comes
from a real API call to a real SQLite database, and every sentiment label
comes from a real trained model.

---

## 1. Project structure

```
e-sentiment/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app, CORS, router wiring
│   │   ├── database.py        SQLAlchemy engine/session (SQLite)
│   │   ├── models.py          ORM tables: users, consultations, comments,
│   │   │                      sentiment_results, reports
│   │   ├── schemas.py         Pydantic request/response models
│   │   ├── auth.py            JWT + bcrypt password hashing
│   │   ├── ai/
│   │   │   ├── preprocessing.py     clean/tokenize/stopword/lemmatize
│   │   │   ├── sentiment_model.py   TF-IDF + Logistic Regression wrapper
│   │   │   ├── keyword_extractor.py TF-IDF-ranked keyword extraction
│   │   │   └── analyzer.py          analyze_text() — the single AI entrypoint
│   │   └── routers/
│   │       ├── auth.py, consultations.py, comments.py,
│   │       └── analyze.py, dashboard.py, reports.py
│   ├── scripts/
│   │   ├── generate_training_data.py   builds a synthetic training set
│   │   ├── train_model.py              trains + evaluates the model
│   │   └── seed_data.py                seeds demo admin/consultations/comments
│   ├── data/                    training_data.csv, esentiment.db (generated)
│   ├── model/                   trained model artifacts + metrics.json
│   └── requirements.txt
│
├── frontend/                    React + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── api/client.ts        typed Axios client for every endpoint
│       ├── context/             AuthContext, ToastContext
│       ├── components/          layouts, sentiment badge, confidence gauge…
│       └── pages/
│           ├── public/          Landing, Consultations, ConsultationDetail
│           └── admin/           Login, Dashboard, ConsultationManagement,
│                                 CommentsManagement, AIAnalyzer, Insights,
│                                 Reports, Settings
│
├── documentation/                architecture notes (see below)
└── README.md
```

---

## 2. Running the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 1. Generate the demonstration training dataset
python scripts/generate_training_data.py

# 2. Train the sentiment model (writes backend/model/*.joblib + metrics.json)
python scripts/train_model.py

# 3. Seed demo admin account, 3 consultations, ~47 demo comments
python scripts/seed_data.py

# 4. Start the API
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (interactive docs at `/docs`).

## 3. Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Vite's dev server proxies `/api/*` to `http://localhost:8000`, so open
`http://localhost:5173` and everything works with no extra configuration.

For a production build: `npm run build` (outputs to `frontend/dist`), then
serve `dist/` with any static file server, pointing `/api` at your backend.

---

## 4. Demo credentials

```
Email:    admin@esentiment.local
Password: admin123
```

Password is stored as a bcrypt hash, never in plaintext.

---

## 5. Demo script (matches the flow used to validate this build)

1. Open the app → **Home** → **Browse open consultations**.
2. Open **"New Small Business Compliance Policy 2026"**.
3. Submit: *"This policy will greatly help small businesses and make
   compliance easier."*
4. See the confirmation with the live AI result: **Positive, ~92%**.
5. Go to **Admin → Sign in** with the demo credentials.
6. **Dashboard** — totals and charts update to include your new comment.
7. **Comments** — find your comment, open it, see processed text, keywords,
   model version, and timestamps.
8. **AI Analyzer** — paste a negative comment ("The proposed process is too
   complicated and expensive.") → **Negative**. Paste a question ("Please
   clarify which documents are required.") → **Neutral**.
9. **Insights** — keyword frequencies, sentiment trend, and model accuracy /
   precision / recall / F1 (computed from the held-out test split, not
   hardcoded).
10. **Reports** — generate a report (overall or per-consultation) and export
    the raw comment data as CSV.

---

## 6. API endpoints

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | returns JWT + user |
| GET  | `/api/auth/me` | current user |
| GET/POST/PUT/DELETE | `/api/consultations[/{id}]` | CRUD (admin-only for write) |
| POST | `/api/comments` | citizen submission → triggers AI analysis synchronously |
| GET  | `/api/comments` | search/filter/paginate |
| GET  | `/api/comments/{id}` | full detail incl. sentiment result |
| POST | `/api/analyze` | admin ad-hoc text analysis |
| POST | `/api/analyze/batch` | CSV upload → bulk analyze |
| GET  | `/api/dashboard/stats` | totals + percentages, computed live |
| GET  | `/api/dashboard/trends` | sentiment counts per day |
| GET  | `/api/dashboard/by-consultation` | sentiment breakdown per consultation |
| GET  | `/api/dashboard/keywords` | TF-IDF-ranked corpus keywords |
| POST | `/api/reports/generate` | writes a JSON report + DB record |
| GET  | `/api/reports/export/csv` | streams a CSV of all comments |
| GET  | `/api/reports/model-metrics` | accuracy/precision/recall/F1 |

Full interactive documentation: `http://localhost:8000/docs`.

---

## 7. AI architecture

- **Pipeline**: `clean_text → tokenize → remove_stopwords → lemmatize` (see
  `backend/app/ai/preprocessing.py`), then `TfidfVectorizer` (unigrams +
  bigrams, 3000 features) feeding a `LogisticRegression` classifier with
  balanced class weights.
- **Model version**: `tfidf-logreg-v1.0` — stored alongside every sentiment
  result so future model changes are traceable.
- **Evaluation**: accuracy / precision / recall / F1 and a confusion matrix
  are computed on a stratified 80/20 train/test split of the actual training
  data every time `train_model.py` runs — never hardcoded.
- **Keyword extraction**: reuses the fitted TF-IDF vocabulary/IDF weights so
  the "important words" shown to admins are the same signal driving the
  classifier — no separate keyword model to keep in sync.
- **Swappable by design**: `analyzer.py` exposes a single `analyze_text(text)`
  function. Everything else in the backend calls only that function, so the
  TF-IDF+LogReg model can be replaced by BERT/DistilBERT/any Hugging Face
  Transformers model by rewriting `sentiment_model.py` alone.

## 8. Database schema

SQLite, 5 tables with foreign keys: `users`, `consultations`, `comments`
(FK → consultations, users), `sentiment_results` (1:1 FK → comments),
`reports` (FK → consultations, nullable for overall reports). See
`backend/app/models.py` for the SQLAlchemy definitions.

---

## 9. Testing performed

- Backend: trained and evaluated the model (99.1% accuracy / 0.991 F1 on
  held-out data); verified via `curl` that every endpoint listed above
  returns correct data, including auth, CRUD, submission → AI analysis →
  storage, dashboard aggregation, CSV batch upload, report generation, and
  CSV export.
- Verified the exact three example sentences from the problem statement
  return Positive/Negative/Neutral as expected, with confidence scores in
  the same range described in the brief.
- Frontend: `npm run build` succeeds with no TypeScript errors; verified via
  the Vite dev server that `/api/*` calls are correctly proxied to the
  backend and that login, dashboard stats, and comment submission work
  end-to-end through the browser-facing API.

## 10. Known limitations

- The sentiment model is trained on a small, synthetically generated
  demonstration dataset (~1,100 rows) — real deployment would need a much
  larger, human-labeled corpus of actual citizen feedback.
- SQLite is used for prototype simplicity; a production deployment should
  move to PostgreSQL/MySQL.
- AI analysis runs synchronously on submission; a production system with
  high comment volume should move this to a background task queue
  (Celery/RQ) so submission latency doesn't scale with model inference time.
- No rate limiting or CAPTCHA on public comment submission.
- CORS is fully open (`*`) for local prototype convenience — restrict this
  in any real deployment.

## 11. Future improvements

- Swap TF-IDF + Logistic Regression for a fine-tuned DistilBERT/IndicBERT
  model (the `ai/` module is already isolated for this).
- Add multi-language support for regional-language comments.
- Add an async job queue for batch CSV analysis on large files.
- Add role-based permissions distinguishing "analyst" (read/analyze) from
  "admin" (also manage consultations/users).
- Add audit logging for consultation edits and deletions.
