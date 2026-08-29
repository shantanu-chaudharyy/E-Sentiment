"""
Seeds the database with:
  - 1 demo admin account
  - 3 consultations
  - ~45 demonstration comments (synthetic, NOT real citizen feedback)

Every seeded comment is passed through the real, trained sentiment engine
(app.ai.analyzer.analyze_text) — sentiment labels/confidence are NOT
hardcoded, they are produced by the model just like a live submission
would be.

Run AFTER training the model:
    python scripts/train_model.py
    python scripts/seed_data.py
"""
import os
import sys
import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import SessionLocal, engine, Base  # noqa: E402
from app import models, auth  # noqa: E402
from app.ai.analyzer import analyze_text, ModelNotTrainedError  # noqa: E402

Base.metadata.create_all(bind=engine)

NOW = datetime.datetime.utcnow()

CONSULTATIONS = [
    {
        "title": "New Small Business Compliance Policy 2026",
        "description": (
            "Draft policy proposing a simplified annual compliance and filing "
            "framework for registered small businesses and startups."
        ),
        "department": "Ministry of Corporate Affairs",
        "start_date": NOW - datetime.timedelta(days=20),
        "end_date": NOW + datetime.timedelta(days=25),
        "status": "Active",
    },
    {
        "title": "Corporate Social Responsibility (CSR) Reporting Amendment",
        "description": (
            "Proposed amendment to CSR reporting timelines and disclosure "
            "requirements for companies under the Companies Act."
        ),
        "department": "Ministry of Corporate Affairs",
        "start_date": NOW - datetime.timedelta(days=35),
        "end_date": NOW - datetime.timedelta(days=5),
        "status": "Closed",
    },
    {
        "title": "Ease of Doing Business — Single Window Clearance Draft",
        "description": (
            "Consultation on introducing a unified single-window clearance "
            "portal for company registration and statutory approvals."
        ),
        "department": "Ministry of Corporate Affairs",
        "start_date": NOW - datetime.timedelta(days=10),
        "end_date": NOW + datetime.timedelta(days=40),
        "status": "Active",
    },
]

# (comment_text, consultation_index, days_ago, submitter_name)
COMMENTS = [
    ("This policy will make the compliance process much easier for small businesses.", 0, 18, "Rohan Mehta"),
    ("Great step, this will reduce paperwork significantly for startups.", 0, 17, "Anita Sharma"),
    ("I fully support this initiative, it simplifies annual filing considerably.", 0, 17, "Karan Verma"),
    ("The proposed process is too complicated and expensive for very small firms.", 0, 16, "Suresh Nair"),
    ("This will hurt small vendors who cannot afford additional compliance staff.", 0, 15, "Deepa Iyer"),
    ("Please clarify which organizations are covered by this policy.", 0, 15, "Farhan Ali"),
    ("Please clarify the turnover threshold used to define a small business.", 0, 14, "Priya Desai"),
    ("What is the effective date for this new compliance framework?", 0, 14, "Vikram Singh"),
    ("Excellent move, this will encourage more entrepreneurs to register formally.", 0, 13, "Neha Kapoor"),
    ("The penalty structure proposed here is far too harsh for first time offenders.", 0, 13, "Arjun Rao"),
    ("This is a welcome change and addresses concerns raised last year.", 0, 12, "Sanjay Gupta"),
    ("Is there a transition period before this becomes mandatory?", 0, 12, "Meera Pillai"),
    ("The compliance portal needs to be more stable, it crashes often.", 0, 11, "Rahul Joshi"),
    ("This adds unnecessary burden without solving the actual filing delays.", 0, 10, "Kavita Menon"),
    ("Thank you for simplifying the annual return format, much appreciated.", 0, 9, "Amit Trivedi"),
    ("Can the deadline be extended by a couple of months for MSMEs?", 0, 9, "Sneha Reddy"),
    ("This policy is progressive and forward looking, well done.", 0, 8, "Manoj Kumar"),
    ("Very happy with the self-certification option introduced here.", 0, 7, "Divya Nair"),
    ("The timelines given are unrealistic for companies with limited staff.", 0, 6, "Ashok Pillai"),
    ("Please share a sample format for the new compliance form.", 0, 5, "Ritu Bansal"),
    ("This will greatly help small businesses and make compliance easier.", 0, 2, "Demo Citizen"),

    ("The extended CSR reporting timeline gives companies much needed breathing room.", 1, 32, "Nikhil Chawla"),
    ("Disclosure requirements are now much clearer than the previous circular.", 1, 30, "Pooja Agarwal"),
    ("This is confusing, the new format contradicts the earlier notification.", 1, 29, "Vivek Malhotra"),
    ("Please clarify if this applies to unlisted companies as well.", 1, 28, "Anjali Bose"),
    ("Good move to allow digital submission of CSR reports.", 1, 27, "Rajesh Khanna"),
    ("The reporting burden on mid-size companies has increased unfairly.", 1, 25, "Swati Rane"),
    ("What is the penalty for late submission of the CSR report?", 1, 24, "Imran Sheikh"),
    ("We appreciate the simplified annexure format introduced this year.", 1, 22, "Geeta Krishnan"),
    ("This amendment lacks clarity on the audit requirement for CSR spend.", 1, 20, "Tarun Bhatia"),
    ("Kindly provide the FAQ document related to CSR disclosure norms.", 1, 18, "Lakshmi Narayan"),
    ("Very disappointed, this does not address our concerns from last year at all.", 1, 15, "Vinay Kumar"),
    ("The new format improves transparency and is easy to understand.", 1, 12, "Shalini Rao"),
    ("Is physical signature still required or is digital signature enough?", 1, 10, "Harish Chandra"),
    ("This will increase compliance costs without any real additional benefit.", 1, 8, "Nandini Iyer"),
    ("Good initiative overall, thanks for considering industry feedback.", 1, 6, "Ramesh Babu"),

    ("The single window clearance idea is fantastic and long overdue.", 2, 9, "Aditi Sen"),
    ("This will save businesses a lot of time during company registration.", 2, 8, "Gaurav Malhotra"),
    ("How does this apply to companies registered outside India?", 2, 8, "Fatima Khan"),
    ("The portal keeps timing out, this needs urgent technical fixes.", 2, 7, "Yash Thakur"),
    ("Please clarify the documents required to apply through the new portal.", 2, 7, "Ayesha Siddiqui"),
    ("Great initiative, this addresses long standing industry demands for a single portal.", 2, 6, "Manish Tandon"),
    ("This adds another layer of process instead of truly simplifying anything.", 2, 5, "Preeti Chauhan"),
    ("Is there a helpline number for queries related to this new system?", 2, 4, "Alok Nath"),
    ("This will boost investor confidence and improve our ease of doing business ranking.", 2, 3, "Ritika Jain"),
    ("Requesting a public hearing before this is finalized, we need more consultation.", 2, 2, "Sameer Qureshi"),
    ("Can the application be withdrawn after submission through this portal?", 2, 1, "Komal Vora"),
]


def seed_admin(db):
    existing = db.query(models.User).filter(models.User.email == "admin@esentiment.local").first()
    if existing:
        print("Demo admin already exists, skipping.")
        return existing
    admin = models.User(
        name="E-Sentiment Admin",
        email="admin@esentiment.local",
        password_hash=auth.hash_password("admin123"),
        role="admin",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("Created demo admin: admin@esentiment.local / admin123")
    return admin


def seed_consultations(db):
    created = []
    for c in CONSULTATIONS:
        existing = db.query(models.Consultation).filter(models.Consultation.title == c["title"]).first()
        if existing:
            created.append(existing)
            continue
        consultation = models.Consultation(**c)
        db.add(consultation)
        db.commit()
        db.refresh(consultation)
        created.append(consultation)
    print(f"Consultations ready: {len(created)}")
    return created


def seed_comments(db, consultations):
    count_created = 0
    for text, c_idx, days_ago, name in COMMENTS:
        consultation = consultations[c_idx]
        existing = db.query(models.Comment).filter(
            models.Comment.comment_text == text,
            models.Comment.consultation_id == consultation.id,
        ).first()
        if existing:
            continue

        submitted_at = NOW - datetime.timedelta(days=days_ago)
        comment = models.Comment(
            consultation_id=consultation.id,
            comment_text=text,
            submitted_at=submitted_at,
            submitter_name=name,
            status="pending",
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)

        result = analyze_text(text)
        sr = models.SentimentResult(
            comment_id=comment.id,
            sentiment=result["sentiment"],
            confidence=result["confidence"],
            processed_text=result["processed_text"],
            keywords=",".join(result["keywords"]),
            model_version=result["model_version"],
            analyzed_at=submitted_at,
        )
        db.add(sr)
        comment.status = "analyzed"
        db.commit()
        count_created += 1

    print(f"Seeded {count_created} new comments (analyzed via the trained AI model).")


def main():
    db = SessionLocal()
    try:
        seed_admin(db)
        consultations = seed_consultations(db)
        try:
            seed_comments(db, consultations)
        except ModelNotTrainedError:
            print("ERROR: Train the model first -> python scripts/train_model.py")
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
