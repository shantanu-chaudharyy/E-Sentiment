"""
Generates a DEMONSTRATION training dataset for the E-Sentiment sentiment
classifier. These sentences are synthetically composed for prototype/
educational purposes and do NOT represent real citizen feedback collected
through any government e-consultation module.

Run:
    python generate_training_data.py
Produces:
    backend/data/training_data.csv  (columns: text,label)
"""
import csv
import random
import os

random.seed(42)

SUBJECTS = [
    "this policy", "the new compliance framework", "the proposed amendment",
    "this regulation", "the draft guideline", "the compliance process",
    "this rule", "the new registration process", "the proposed scheme",
    "this notification", "the revised procedure", "the licensing framework",
    "this circular", "the proposed reform", "the new filing requirement",
    "the amendment", "the draft policy", "this initiative",
]

POSITIVE_TEMPLATES = [
    "{s} will greatly help small businesses grow.",
    "{s} makes compliance much easier for startups.",
    "I fully support {s}, it is a step in the right direction.",
    "{s} is well drafted and addresses real industry concerns.",
    "{s} will reduce the compliance burden significantly.",
    "This is an excellent move that will benefit MSMEs.",
    "{s} brings much needed clarity and transparency.",
    "{s} simplifies the registration process considerably.",
    "Very happy to see {s}, it will encourage entrepreneurship.",
    "{s} is a positive step towards ease of doing business.",
    "{s} will save businesses a lot of time and cost.",
    "I appreciate the ministry for introducing {s}.",
    "{s} is progressive and forward looking.",
    "{s} strikes a good balance between regulation and growth.",
    "This is a welcome change, {s} is exactly what was needed.",
    "{s} will boost investor confidence in the sector.",
    "Great initiative, {s} addresses long standing industry demands.",
    "{s} improves transparency and accountability significantly.",
    "Kudos to the department for {s}, very well thought out.",
    "{s} will make life easier for compliance officers.",
]

NEGATIVE_TEMPLATES = [
    "{s} is too complicated and expensive for small businesses.",
    "I strongly oppose {s}, it adds unnecessary burden.",
    "{s} will increase compliance costs without any real benefit.",
    "This is a poorly drafted policy that ignores ground realities.",
    "{s} is confusing and difficult to implement.",
    "{s} will hurt small and medium enterprises badly.",
    "I am disappointed with {s}, it does not solve the actual problem.",
    "{s} imposes excessive paperwork on businesses.",
    "{s} is impractical and needs to be withdrawn immediately.",
    "This will create more red tape instead of reducing it.",
    "{s} is unfair to smaller companies compared to large corporations.",
    "{s} lacks clarity and will lead to harassment by officials.",
    "The timelines proposed in {s} are unreasonable.",
    "{s} will increase litigation and disputes unnecessarily.",
    "I am against {s}, the penalties proposed are too harsh.",
    "{s} does not take stakeholder feedback into account at all.",
    "This process is broken and {s} makes it even worse.",
    "{s} is a step backward for ease of doing business.",
    "The compliance cost under {s} is simply unaffordable.",
    "{s} is vague, ambiguous, and open to misuse.",
]

NEUTRAL_TEMPLATES = [
    "Please clarify which entities are covered under {s}.",
    "What is the effective date for {s}?",
    "Can you provide more details on the applicability of {s}?",
    "Please share the documents required to comply with {s}.",
    "Is there a helpline for queries related to {s}?",
    "How does {s} apply to companies registered outside India?",
    "Kindly clarify the penalty structure mentioned in {s}.",
    "Will {s} apply retrospectively or only going forward?",
    "Please provide a sample format for the forms required under {s}.",
    "What is the process to seek an exemption under {s}?",
    "Is there a transition period before {s} becomes mandatory?",
    "Can the deadline for {s} be extended by a few months?",
    "Please clarify the definition of small business under {s}.",
    "Where can we submit our comments regarding {s}?",
    "Is {s} applicable to partnership firms as well?",
    "Please confirm whether {s} replaces the earlier circular.",
    "What are the reporting requirements introduced under {s}?",
    "Kindly share the FAQ document related to {s}.",
    "Is online submission mandatory for {s} or is offline allowed?",
    "Requesting a public hearing before {s} is finalized.",
]

EXTRA_POSITIVE = [
    "Thank you for considering feedback from small business owners.",
    "This move shows the government is listening to industry needs.",
    "Great to see digitisation of the compliance process.",
    "The single window clearance idea is fantastic.",
    "Reducing the number of forms required is a very good step.",
    "Happy that the annual filing process has been simplified.",
    "The extended timeline for compliance is much appreciated.",
    "This will definitely improve our ease of doing business ranking.",
    "The self-certification option is a great relief for us.",
    "Well done, this addresses most of our concerns from last year.",
]

EXTRA_NEGATIVE = [
    "This will disproportionately affect rural and small enterprises.",
    "The compliance portal keeps crashing, this is very frustrating.",
    "No prior consultation was done before drafting this rule.",
    "The penalty amounts are disproportionate to the violation.",
    "This adds yet another layer of bureaucracy to an already slow system.",
    "Small vendors will simply not be able to afford this.",
    "The helpline never picks up calls, support is terrible.",
    "This rule contradicts an earlier notification and causes confusion.",
    "The compliance calendar is unrealistic given our resources.",
    "We were not given enough time to respond to this draft.",
]

EXTRA_NEUTRAL = [
    "When will the final notification be published on the website?",
    "Please list the documents needed for the annual return.",
    "Does this apply to one person companies as well?",
    "What is the fee structure for late filing?",
    "Please clarify if physical signatures are still required.",
    "How many days are given to respond to a deficiency notice?",
    "Is there a mobile app to track application status?",
    "Please share the contact details of the nodal officer.",
    "Can the application be withdrawn after submission?",
    "What format should supporting documents be uploaded in?",
    "Government should increase capitalization.",
    "The government should increase capitalization requirements.",
    "Capitalization requirements should be reviewed by the government.",
    "The government should consider increasing capitalization support.",
    "Businesses should be given clear guidelines on capitalization requirements.",
]


def build_rows():
    rows = []
    for tmpl in POSITIVE_TEMPLATES:
        for s in SUBJECTS:
            rows.append((tmpl.format(s=s), "Positive"))
    for tmpl in NEGATIVE_TEMPLATES:
        for s in SUBJECTS:
            rows.append((tmpl.format(s=s), "Negative"))
    for tmpl in NEUTRAL_TEMPLATES:
        for s in SUBJECTS:
            rows.append((tmpl.format(s=s), "Neutral"))
    for t in EXTRA_POSITIVE:
        rows.append((t, "Positive"))
    for t in EXTRA_NEGATIVE:
        rows.append((t, "Negative"))
    for t in EXTRA_NEUTRAL:
        rows.append((t, "Neutral"))
    random.shuffle(rows)
    return rows


def main():
    rows = build_rows()
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "training_data.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    main()
