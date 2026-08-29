# 🇮🇳 E-Sentiment

## AI-Powered E-Consultation Sentiment Analysis Platform

<p align="center">
  <strong>Transforming public feedback into actionable insights with AI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI-Sentiment%20Analysis-0A7EA4?style=for-the-badge" alt="AI Sentiment Analysis">
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge" alt="React TypeScript">
  <img src="https://img.shields.io/badge/ML-TF--IDF%20%2B%20Logistic%20Regression-orange?style=for-the-badge" alt="Machine Learning">
</p>

---

## 📌 Overview

**E-Sentiment** is an AI-powered e-consultation management platform designed to help government departments efficiently understand and analyze public feedback.

Government consultations can generate large volumes of citizen responses that are difficult and time-consuming to review manually. E-Sentiment addresses this challenge by using machine learning to automatically analyze feedback and convert unstructured comments into meaningful sentiment insights.

The platform classifies public feedback into:

- 🟢 **Positive**
- 🟡 **Neutral**
- 🔴 **Negative**

E-Sentiment combines **consultation management, AI sentiment analysis, dashboards, bulk processing, insights, and reporting** into a unified administrative platform.

---

## ✨ Key Features

### 📊 Analytics Dashboard

- Total comments overview
- Positive, Negative, and Neutral sentiment counts
- Average AI confidence
- Active consultations
- Sentiment distribution
- Sentiment trends over time
- Database-driven statistics

### 📝 Consultation Management

- Create consultations
- Edit consultations
- Delete consultations
- Manage consultation status
- Configure consultation windows
- Track comment counts
- Organize consultations by department

### 💬 Comment Management

- View analyzed citizen comments
- Search comments
- Filter by sentiment
- Filter by consultation
- Filter by date
- View sentiment confidence
- Review individual comments

### 🤖 AI Sentiment Analyzer

- Analyze individual text inputs
- Classify feedback as Positive, Neutral, or Negative
- Display prediction confidence
- Display class probabilities
- Show processed text
- Extract important keywords

### 📂 Batch CSV Analysis

- Upload multiple comments through CSV
- Automatically analyze uploaded feedback
- Automatically create consultations when required
- Store analyzed results in the database

### 📈 Insights & Reports

- Sentiment distribution
- Sentiment trends
- Consultation-level analysis
- Overall sentiment analysis
- Generate reports
- Export analysis results

### 🔐 Authentication

- Administrator login
- JWT-based authentication
- Protected API endpoints
- Password hashing

---

# 🧠 AI & Machine Learning

E-Sentiment currently uses a lightweight and explainable machine-learning pipeline based on **TF-IDF and Logistic Regression**.

```text
Citizen Feedback
       │
       ▼
Text Preprocessing
       │
       ▼
TF-IDF Vectorization
       │
       ▼
Logistic Regression
       │
       ▼
Sentiment Prediction
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
Positive Neutral Negative
 │      │      │
 └──────┼──────┘
        ▼
Confidence + Probabilities
        │
        ▼
Dashboard & Insights
```

### Model Configuration

| Component | Configuration |
|---|---|
| Algorithm | Logistic Regression |
| Feature Extraction | TF-IDF |
| N-gram Range | Unigrams + Bigrams |
| Maximum Features | 3,000 |
| Class Weight | Balanced |
| Maximum Iterations | 1,000 |
| Model Version | `tfidf-logreg-v1.0` |

### Why TF-IDF + Logistic Regression?

The current model was selected because it provides:

- ⚡ Fast inference
- 🪶 Lightweight deployment
- 🔍 Easy interpretability
- 📊 Probability-based confidence scores
- 💻 Low computational requirements
- 🚀 Suitability for a prototype environment

The architecture is designed so that the underlying model can later be replaced with advanced transformer-based NLP models.

---

# 📊 Model Performance

The current demonstration dataset contains **1,110 labeled samples**.

| Sentiment | Samples |
|---|---:|
| 🟢 Positive | 370 |
| 🟡 Neutral | 370 |
| 🔴 Negative | 370 |
| **Total** | **1,110** |

The dataset is balanced across all three sentiment classes.

### Evaluation Results

| Metric | Score |
|---|---:|
| **Accuracy** | **99.10%** |
| **Precision** | **99.12%** |
| **Recall** | **99.10%** |
| **F1 Score** | **99.10%** |

### Dataset Split

```text
Training samples : 888
Testing samples  : 222
```

> **Note:** These results are based on the current demonstration dataset and should not be interpreted as production-world accuracy on unseen real-world government consultation data.

---

# 🏗️ System Architecture

```text
                         E-SENTIMENT
                              │
                ┌─────────────┴─────────────┐
                │                           │
             FRONTEND                    BACKEND
                │                           │
        React + TypeScript              FastAPI
                │                           │
                └─────────────┬─────────────┘
                              │
                         REST APIs
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
          AI Engine       Database       Authentication
              │               │               │
        ┌─────┴─────┐       SQLite           JWT
        │           │
      TF-IDF    Logistic
                 Regression
```

---

# 🔄 Application Workflow

```text
                Citizen / User
                      │
                      ▼
              Submit Feedback
                      │
                      ▼
             E-Consultation
                  Platform
                      │
                      ▼
              Text Processing
                      │
                      ▼
               AI Analysis
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Positive      Neutral       Negative
        │             │             │
        └─────────────┼─────────────┘
                      ▼
              Store in Database
                      │
                      ▼
             Analytics Dashboard
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Insights       Reports      Decision
                                  Support
```

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- HTML5
- CSS3

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

## Machine Learning

- Scikit-learn
- TF-IDF Vectorizer
- Logistic Regression
- Pandas
- NumPy
- Joblib

## Database

- SQLite
- SQLAlchemy ORM

## Authentication

- OAuth2 Password Bearer
- JWT
- Passlib
- bcrypt

---

# 📂 Project Structure

```text
e-sentiment/
│
├── backend/
│   │
│   ├── app/
│   │   ├── ai/
│   │   │   ├── analyzer.py
│   │   │   ├── keyword_extractor.py
│   │   │   ├── preprocessing.py
│   │   │   └── sentiment_model.py
│   │   │
│   │   ├── routers/
│   │   │   ├── analyze.py
│   │   │   ├── auth.py
│   │   │   ├── comments.py
│   │   │   ├── consultations.py
│   │   │   ├── dashboard.py
│   │   │   └── reports.py
│   │   │
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── data/
│   │   └── training_data.csv
│   │
│   ├── model/
│   │   ├── classifier.joblib
│   │   ├── vectorizer.joblib
│   │   ├── meta.json
│   │   └── metrics.json
│   │
│   ├── scripts/
│   │   ├── generate_training_data.py
│   │   ├── seed_data.py
│   │   └── train_model.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── documentation/
│
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have installed:

- Python 3.9+
- Node.js
- npm
- Git

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/e-sentiment.git
cd e-sentiment
```

---

## 2️⃣ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

---

# 🤖 Train the Model

The training dataset is located at:

```text
backend/data/training_data.csv
```

To train the model:

```bash
cd backend
source venv/bin/activate
python scripts/train_model.py
```

The trained model is saved to:

```text
backend/model/
```

Generated files include:

```text
classifier.joblib
vectorizer.joblib
meta.json
metrics.json
```

---

# 🔌 API

The FastAPI backend provides REST APIs for:

```text
Authentication
    │
    ├── Login
    └── Current User
     
Consultations
    │
    ├── Create
    ├── List
    ├── Update
    └── Delete
     
Comments
    │
    ├── List
    ├── Filter
    └── Batch Upload
     
AI Analysis
    │
    └── Sentiment Prediction
     
Dashboard
    │
    └── Sentiment Statistics
     
Reports
    │
    └── Report Generation
```

Interactive API documentation is available through FastAPI Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# 💡 Example AI Analysis

### Input

```text
This policy will make compliance easier for businesses.
```

### Example Output

```text
Sentiment   : Positive
Confidence  : 73%
```

### Class Probabilities

```text
Negative    : 19%
Neutral     : 9%
Positive    : 73%
```

The analyzer can also provide:

- Processed text
- Extracted keywords
- Class probabilities
- Model version

---

# 📂 Bulk CSV Analysis

Administrators can upload multiple citizen comments through a CSV file.

### Expected Format

```csv
comment,consultation,date
"This policy will help small businesses","Small Business Policy","2026-08-29"
"The process is too complicated","Ease of Doing Business","2026-08-29"
"Please clarify the required documents","Compliance Consultation","2026-08-29"
```

### Processing Pipeline

```text
CSV Upload
    │
    ▼
Validation
    │
    ▼
Text Preprocessing
    │
    ▼
AI Sentiment Analysis
    │
    ▼
Database Storage
    │
    ▼
Dashboard & Insights
```

---

# 📊 Dashboard & Insights

The administrator dashboard provides a centralized view of public feedback.

It includes:

- Total comments
- Positive comments
- Negative comments
- Neutral comments
- Average AI confidence
- Total consultations
- Active consultations
- Sentiment distribution
- Sentiment over time

This allows administrators to quickly understand the overall public response to consultations.

---

# 🔐 Security

The application includes:

- JWT-based authentication
- Password hashing
- Protected API routes
- OAuth2 password bearer authentication
- Environment-based configuration

> Never commit passwords, API keys, JWT secrets, `.env` files, or other sensitive credentials to GitHub.

---

# 🚀 Deployment

E-Sentiment can be deployed as a full-stack cloud application.

Recommended production architecture:

```text
                 Public Users
                      │
                      ▼
              Frontend Hosting
                      │
                      ▼
                 FastAPI API
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
         ML Model           PostgreSQL
       TF-IDF + LR           Database
```

For production deployment, the local SQLite database can be replaced with PostgreSQL and environment-specific configuration can be used for API and database connections.

---

# 🔮 Future Roadmap

## 🧠 AI & NLP

- 🌐 Multilingual sentiment analysis
- 🇮🇳 Hindi and regional-language support
- 🧠 BERT / DistilBERT integration
- 🎯 Aspect-based sentiment analysis
- 🏷️ Automatic topic classification
- 🔍 Explainable AI enhancements

## ☁️ Platform

- Cloud deployment
- PostgreSQL production database
- Responsive mobile interface
- Real-time notifications
- Automated email alerts
- Advanced role-based access control

## 📈 Analytics

- Advanced consultation analytics
- Predictive sentiment trends
- Geographic sentiment analysis
- Topic and keyword trends
- Advanced automated reporting

---

# 🎯 Vision

> **Make public feedback easier to understand, measure, and act upon.**

E-Sentiment aims to bridge the gap between large-scale public participation and data-driven decision-making by transforming unstructured consultation feedback into structured and actionable insights.

---

# 👨‍💻 Project

## E-Sentiment

**AI-Powered E-Consultation Sentiment Analysis Platform**

Built as a technology prototype for intelligent analysis of public consultation feedback.

---

## 📄 License

This project is intended for educational, research, and prototype purposes.
