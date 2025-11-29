from flask import Blueprint, request, jsonify
from app import db
from models import Violation
from helpers import parse_date_flexible
from datetime import date
import joblib
import os
import string
import numpy as np

violation_bp = Blueprint("violations", __name__, url_prefix="/violations")

# ---------------- ML MODEL ----------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))
violation_to_section = joblib.load(os.path.join(BASE_DIR, "violation_to_section.pkl"))

# Load Standard Text
try:
    violation_to_standard_text = joblib.load(os.path.join(BASE_DIR, "violation_to_standard_text.pkl"))
except:
    violation_to_standard_text = {}

# ---------------- Preprocessing ----------------
def preprocess(text):
    return text.lower().translate(str.maketrans('', '', string.punctuation))

# ---------------- GET ALL ----------------
@violation_bp.get("")
def get_all_violations():
    records = Violation.query.order_by(Violation.id.desc()).all()
    data = []

    for r in records:
        dt = r.violation_date or date.today()

        # Standard Text (optional)
        standard_text = violation_to_standard_text.get(r.predicted_violation, "No standard text available")

        data.append({
            "id": r.id,
            "student_name": r.student_name,
            "student_id": r.student_id,
            "course_year_section": r.course_year_section,
            "gender": r.gender,
            "violation_text": r.violation_text,
            "violation_date": dt.strftime("%Y-%m-%d"),
            "predicted_violation": r.predicted_violation or "—",
            "predicted_section": r.predicted_section or "—",
            "standard_text": standard_text
        })

    return jsonify(data)

# ---------------- POST ----------------
@violation_bp.post("")
def add_violation():
    data = request.json or {}
    required = ["student_name", "student_id", "course_year_section", "gender", "violation_text", "violation_date"]

    for key in required:
        if key not in data or not data[key]:
            return jsonify({"message": f"Missing field: {key}"}), 400

    # ML Prediction
    text_proc = preprocess(data["violation_text"])
    vectorized = vectorizer.transform([text_proc])

    predicted_violation = model.predict(vectorized)[0]
    predicted_section = violation_to_section.get(predicted_violation, "Unknown")

    # TOP 3 PREDICTIVE LIST
    try:
        probs = model.predict_proba(vectorized)[0]
        classes = model.classes_
        top_idx = np.argsort(probs)[::-1][:3]

        predictive_text = [
            f"{classes[i]} ({probs[i]*100:.1f}%)"
            for i in top_idx
        ]
    except:
        predictive_text = [predicted_violation]

    # Standard Text
    standard_text = violation_to_standard_text.get(predicted_violation, "No standard text available")

    new_record = Violation(
        student_name=data["student_name"],
        student_id=int(data["student_id"]),
        course_year_section=data["course_year_section"],
        gender=data["gender"],
        violation_text=data["violation_text"],
        violation_date=parse_date_flexible(data["violation_date"]),
        predicted_violation=predicted_violation,
        predicted_section=predicted_section
    )

    db.session.add(new_record)
    db.session.commit()

    return jsonify({
        "message": "Violation added successfully",
        "predicted_violation": predicted_violation,
        "predicted_section": predicted_section,
        "predictive_text": predictive_text,
        "standard_text": standard_text
    }), 201

# ---------------- PUT ----------------
@violation_bp.put("/<int:id>")
def update_violation(id):
    record = Violation.query.get(id)
    if not record:
        return jsonify({"message": "Violation not found"}), 404

    data = request.json or {}

    # Update basic fields
    record.student_name = data.get("student_name", record.student_name)
    record.student_id = int(data.get("student_id", record.student_id))
    record.course_year_section = data.get("course_year_section", record.course_year_section)
    record.gender = data.get("gender", record.gender)
    record.violation_text = data.get("violation_text", record.violation_text)

    if "violation_date" in data:
        record.violation_date = parse_date_flexible(data["violation_date"])

    # Re-Predict ML model if violation text changed
    if "violation_text" in data:
        text_proc = preprocess(record.violation_text)
        vectorized = vectorizer.transform([text_proc])

        record.predicted_violation = model.predict(vectorized)[0]
        record.predicted_section = violation_to_section.get(record.predicted_violation, "Unknown")

    db.session.commit()
    return jsonify({"message": "Violation updated successfully"})

# ---------------- DELETE ----------------
@violation_bp.delete("/<int:id>")
def delete_violation(id):
    record = Violation.query.get(id)
    if not record:
        return jsonify({"message": "Violation not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Violation deleted successfully"})
