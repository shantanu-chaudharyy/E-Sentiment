

# E-Sentiment — AI-Powered Sentiment Analysis for E-Consultation Comments

**Smart India Hackathon — SIH25035**
**Problem Statement:** Sentiment analysis of comments received through E-consultation module
**Ministry:** Ministry of Corporate Affairs

E-Sentiment is a full-stack AI-powered platform that automatically analyzes citizen comments submitted through government e-consultation processes.

A citizen submits a comment on a published consultation → the comment is stored in SQLite → it is analyzed by a trained TF-IDF + Logistic Regression model → the predicted sentiment (**Positive / Negative / Neutral**) and confidence score are stored → administrators can monitor, search, filter, analyze, and export the results through a live dashboard.

E-Sentiment is an end-to-end full-stack AI platform featuring a responsive React frontend, FastAPI backend API, SQLite relational database, and trained machine-learning NLP pipeline.

---

## 🌐 Live Demo

### Frontend

**E-Sentiment Web Application**

https://e-sentiment-frontend.onrender.com/

### Backend API

**FastAPI Backend & Interactive API Documentation**

https://e-sentiment.onrender.com/docs

The backend provides interactive Swagger API documentation where all available API endpoints can be explored and tested.

---

## 🔐 Demo Admin Credentials

```text
Email:    admin@esentiment.local
Password: admin123
````

 Use these credentials to access the admin dashboard and explore the analytics features.

---

 ## 🚀 Key Features

 ### Citizen Portal

 - Browse published consultations
- View consultation details
- Submit comments and feedback
- Automatic AI sentiment analysis
- Positive / Negative / Neutral classification
- Confidence score for every prediction
- Real-time submission and analysis through the backend API

 ### Admin Dashboard

 - Secure JWT authentication
- Live dashboard statistics
- Total comments and consultation statistics
- Sentiment distribution
- Sentiment trends
- Consultation-wise sentiment analysis
- Search and filter comments
- View complete comment analysis
- AI-powered text analyzer
- Batch CSV sentiment analysis
- Keyword extraction
- Model performance metrics
- Generate reports
- Export comment data as CSV

---

 ## 🤖 AI Architecture

 The sentiment analysis pipeline is built using traditional and explainable machine-learning techniques.

```
Citizen Comment
       ↓
Text Cleaning
       ↓
Tokenization
       ↓
Stopword Removal
       ↓
Lemmatization
       ↓
TF-IDF Vectorization
       ↓
Logistic Regression
       ↓
Sentiment + Confidence Score
       ↓
SQLite Database
       ↓
Admin Dashboard
```

 ### Model Configuration

 - **Model:** TF-IDF + Logistic Regression
- **TF-IDF Features:** Up to 3,000
- **N-grams:** Unigrams + Bigrams
- **Classifier:** Logistic Regression
- **Class Weighting:** Balanced
- **Model Version:** `tfidf-logreg-v1.0`

 The complete AI pipeline is exposed through a single entry point:

```
analyze_text(text)
```

 This makes the AI layer modular and replaceable. The current TF-IDF + Logistic Regression model can later be replaced with BERT, DistilBERT, IndicBERT, or another Hugging Face Transformer model without changing the rest of the application.

---

 ## 📊 Model Evaluation

 The model is evaluated using a stratified 80/20 train-test split.

 Current prototype evaluation:

```
Accuracy : 99.1%
F1 Score : 0.991
```

 The system also calculates:

 - Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix

 These metrics are generated during model training and are not hardcoded into the dashboard.

 > **Evaluation Summary:** The NLP sentiment classifier is evaluated on a stratified test set split to measure generalization accuracy, precision, recall, and F1 score across positive, negative, and neutral public policy feedback.

---

 ## 🧠 Keyword Extraction

 E-Sentiment also provides keyword extraction using the fitted TF-IDF vocabulary and IDF weights.

 This allows administrators to identify important words and phrases appearing across citizen feedback.

 The same TF-IDF representation used by the sentiment classifier is reused for keyword extraction, ensuring that the keywords shown to administrators are based on the same statistical representation used by the classifier.

---

 ## 🏗️ System Architecture

```
                         ┌─────────────────────┐
                         │     Citizen/User     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + TypeScript   │
                         │     Frontend         │
                         └──────────┬──────────┘
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend   │
                         ├─────────────────────┤
                         │ Authentication      │
                         │ Consultations       │
                         │ Comments            │
                         │ AI Analysis         │
                         │ Dashboard           │
                         │ Reports             │
                         └────────┬──────┬──────┘
                                  │      │
                    ┌─────────────┘      └──────────────┐
                    ▼                                   ▼
          ┌──────────────────┐                 ┌─────────────────┐
          │   AI / ML Layer  │                 │ SQLite Database │
          ├──────────────────┤                 ├─────────────────┤
          │ Preprocessing    │                 │ Users           │
          │ TF-IDF           │                 │ Consultations   │
          │ Logistic Reg.    │                 │ Comments        │
          │ Keywords         │                 │ Sentiments      │
          └──────────────────┘                 │ Reports         │
                                               └─────────────────┘
```

---

 ## 📁 Project Structure

```
e-sentiment/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   │
│   │   ├── ai/
│   │   │   ├── preprocessing.py
│   │   │   ├── sentiment_model.py
│   │   │   ├── keyword_extractor.py
│   │   │   └── analyzer.py
│   │   │
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── consultations.py
│   │       ├── comments.py
│   │       ├── analyze.py
│   │       ├── dashboard.py
│   │       └── reports.py
│   │
│   ├── scripts/
│   │   ├── generate_training_data.py
│   │   ├── train_model.py
│   │   └── seed_data.py
│   │
│   ├── data/
│   ├── model/
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── api/
│       │   └── client.ts
│       ├── context/
│       ├── components/
│       └── pages/
│           ├── public/
│           └── admin/
│
├── documentation/
└── README.md
```

---

 ## 🔌 API Endpoints

 | Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/consultations` | List consultations |
| POST | `/api/consultations` | Create consultation |
| PUT | `/api/consultations/{id}` | Update consultation |
| DELETE | `/api/consultations/{id}` | Delete consultation |
| POST | `/api/comments` | Submit comment and analyze sentiment |
| GET | `/api/comments` | Search, filter and paginate comments |
| GET | `/api/comments/{id}` | Get complete comment details |
| POST | `/api/analyze` | Analyze text using AI |
| POST | `/api/analyze/batch` | Bulk analyze CSV comments |
| GET | `/api/dashboard/stats` | Get live dashboard statistics |
| GET | `/api/dashboard/trends` | Get sentiment trends |
| GET | `/api/dashboard/by-consultation` | Sentiment breakdown by consultation |
| GET | `/api/dashboard/keywords` | Get important corpus keywords |
| POST | `/api/reports/generate` | Generate analytical report |
| GET | `/api/reports/export/csv` | Export comments as CSV |
| GET | `/api/reports/model-metrics` | Get model metrics |

 ### Interactive API Documentation

 https://e-sentiment.onrender.com/docs

---

 ## 🧪 Demo Flow

 ### 1\. Open the Application

 Visit:

 https://e-sentiment-frontend.onrender.com/

 Go to:

```
Home → Browse Open Consultations
```

 Open:

```
New Small Business Compliance Policy 2026
```

 Submit:

```
This policy will greatly help small businesses and make compliance easier.
```

 The comment is sent to the backend and automatically analyzed by the trained sentiment model.

 Expected result:

```
Sentiment: Positive
Confidence: High
```

---

 ### 2\. Open the Admin Dashboard

 Sign in using:

```
Email: admin@esentiment.local
Password: admin123
```

 The dashboard retrieves live information from the database.

 It displays:

 - Total comments
- Sentiment distribution
- Consultation statistics
- Sentiment trends
- Consultation-wise sentiment breakdown

---

 ### 3\. View Comment Details

 Navigate to the Comments section and find the submitted comment.

 Administrators can view:

 - Original comment
- Processed text
- Sentiment
- Confidence score
- Extracted keywords
- Model version
- Timestamp

---

 ### 4\. Test the AI Analyzer

 Use the AI Analyzer to test custom comments.

 Example negative comment:

```
The proposed process is too complicated and expensive.
```

 Expected:

```
Negative
```

 Example neutral comment:

```
Please clarify which documents are required.
```

 Expected:

```
Neutral
```

---

 ### 5\. Explore Insights

 The Insights section provides:

 - Keyword frequencies
- Sentiment trends
- Sentiment distribution
- Accuracy
- Precision
- Recall
- F1 Score

---

 ### 6\. Generate Reports

 The Reports section allows administrators to:

 - Generate overall reports
- Generate consultation-specific reports
- Export comment data
- Download CSV reports

---

 ## 💾 Database

 The prototype uses SQLite for simplicity and portability.

 The database contains five primary tables:

```
users
   │
   ├── consultations
   │
   └── comments
           │
           └── sentiment_results

reports
```

 ### Database Tables

 - `users`
- `consultations`
- `comments`
- `sentiment_results`
- `reports`

 Foreign-key relationships connect users, consultations, comments, sentiment results, and reports.

---

 ## 🔐 Authentication & Security

 The prototype implements:

 - JWT authentication
- bcrypt password hashing
- Protected admin endpoints
- Role-aware access structure
- Passwords stored as secure hashes
- Authenticated administrative operations

 For production deployment, additional security hardening should be implemented.

---

 ## 🛠️ Technology Stack

 ### Frontend

 - React
- TypeScript
- Vite
- Tailwind CSS
- Axios

 ### Backend

 - Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- bcrypt

 ### AI / NLP

 - scikit-learn
- TF-IDF
- Logistic Regression
- NLP preprocessing
- TF-IDF keyword extraction

 ### Database

 - SQLite

 ### Deployment

 - Render

---

 ## 💻 Running Locally

 ### Backend

```
cd backend

python3 -m venv venv
source venv/bin/activate
```

 For Windows:

```
venv\Scripts\activate
```

 Install dependencies:

```
pip install -r requirements.txt
```

 Generate the demonstration training dataset:

```
python scripts/generate_training_data.py
```

 Train the model:

```
python scripts/train_model.py
```

 Seed demo data:

```
python scripts/seed_data.py
```

 Start the backend:

```
uvicorn app.main:app --reload --port 8000
```

 Backend:

```
http://localhost:8000
```

 Interactive API documentation:

```
http://localhost:8000/docs
```

---

 ## 🎨 Running the Frontend Locally

```
cd frontend
npm install
npm run dev
```

 Open:

```
http://localhost:5173
```

 The Vite development server proxies `/api/*` requests to the local FastAPI backend.

 For a production build:

```
npm run build
```

 The production frontend is generated in:

```
frontend/dist
```

---

 ## 🧪 Testing

 ### Backend

 The following workflows have been tested:

 - Authentication
- Consultation CRUD
- Comment submission
- Automatic sentiment analysis
- Database persistence
- Dashboard aggregation
- CSV batch analysis
- Report generation
- CSV export
- Model metrics
- API responses

 ### Frontend

 The following have been verified:

 - Production build
- TypeScript compilation
- API integration
- Admin login
- Dashboard statistics
- Consultation browsing
- Comment submission
- End-to-end AI result display

---

 ## ⚠️ Known Limitations

 This project is a working prototype designed for demonstration and hackathon purposes.

 ### Training Dataset

 The current model is trained on approximately 1,100 synthetically generated examples.

 A production implementation should use a significantly larger and diverse human-labeled dataset containing real citizen feedback.

 ### Database

 SQLite is used for prototype simplicity.

 A production deployment should use a scalable database such as PostgreSQL or MySQL.

 ### Synchronous AI Processing

 AI analysis currently runs synchronously during comment submission.

 For high-volume deployments, AI processing should be moved to an asynchronous job queue such as Celery or RQ.

 ### Public Submission Protection

 The prototype currently does not include:

 - Rate limiting
- CAPTCHA
- Advanced spam protection
- Advanced abuse prevention

 ### CORS

 CORS is permissive for prototype/development convenience.

 Production deployment should restrict allowed origins to trusted frontend domains.

---

 ## 🔮 Future Improvements

 - Replace TF-IDF + Logistic Regression with DistilBERT or IndicBERT
- Add multilingual and regional-language support
- Support Hindi and other Indian languages
- Add asynchronous AI processing
- Add scalable batch processing
- Migrate from SQLite to PostgreSQL
- Add advanced role-based access control
- Introduce Analyst and Admin roles
- Add audit logging
- Add spam and toxicity detection
- Add duplicate comment detection
- Add topic classification
- Add emotion classification
- Add advanced consultation-level insights
- Add real-time analytics
- Add model monitoring
- Add continuous model retraining

---

 ## 🎯 Why E-Sentiment?

 Government e-consultation platforms can receive large volumes of citizen feedback. Manually reviewing and categorizing every comment can be time-consuming and difficult to scale.

 E-Sentiment provides an AI-assisted workflow that helps administrators:

```
Collect
   ↓
Analyze
   ↓
Classify
   ↓
Understand
   ↓
Report
```

 The platform enables administrators to quickly understand overall public sentiment, identify important discussion topics, monitor sentiment trends, and inspect individual citizen responses.

 The modular architecture also allows the current ML model to evolve into a more advanced multilingual Transformer-based solution as real-world labeled data becomes available.

---

 ## 🏆 Smart India Hackathon

 This project was developed for:

```
Smart India Hackathon
Problem Statement: SIH25035

Sentiment analysis of comments received through
E-consultation module

Ministry of Corporate Affairs
```

 The solution demonstrates an end-to-end implementation:

```
Citizen Feedback
       ↓
Web Application
       ↓
REST API
       ↓
NLP / Machine Learning
       ↓
Database
       ↓
Analytics Dashboard
       ↓
Reports & Export
```

---

 ## 🌐 Live Links

 ### Frontend

 https://e-sentiment-frontend.onrender.com/

 ### Backend API Documentation

 https://e-sentiment.onrender.com/docs

---

 ## 📌 Project Status

 **Working Full-Stack Prototype — Smart India Hackathon SIH25035**

 The deployed application demonstrates the complete citizen-to-administration workflow using a live frontend, FastAPI backend, SQLite database, and trained sentiment-analysis model.

 **Built with React, TypeScript, FastAPI, Python, SQLite, scikit-learn, TF-IDF and Logistic Regression.**

```

```
