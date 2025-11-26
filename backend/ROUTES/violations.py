from flask import Blueprint, request, jsonify
from models import Violation
from app import db
from helpers import parse_date_flexible
from datetime import date

violation_bp = Blueprint("violations", __name__, url_prefix="/violations")


@violation_bp.get("")
def get_all_violations():
    records = Violation.query.order_by(Violation.id.desc()).all()
    data = []
    for r in records:
        dt = r.violation_date or date.today()
        data.append({
            "id": r.id,
            "student_name": r.student_name,
            "student_id": r.student_id,
            "course_year_section": r.course_year_section,
            "gender": r.gender,
            "violation_text": r.violation_text,
            "violation_date": dt.strftime("%Y-%m-%d"),
        })
    return jsonify(data)


@violation_bp.post("")
def add_violation():
    data = request.json or {}
    required = ["student_name", "student_id", "course_year_section", "gender", "violation_text"]

    for key in required:
        if key not in data:
            return jsonify({"message": f"Missing field: {key}"}), 400

    new_record = Violation(
        student_name=data["student_name"],
        student_id=data["student_id"],
        course_year_section=data["course_year_section"],
        gender=data["gender"],
        violation_text=data["violation_text"],
        violation_date=parse_date_flexible(data.get("violation_date")),
    )
    db.session.add(new_record)
    db.session.commit()
    return jsonify({"message": "Violation added"}), 201


@violation_bp.put("/<int:id>")
def update_violation(id):
    record = Violation.query.get(id)
    if not record:
        return jsonify({"message": "Violation not found"}), 404

    data = request.json or {}

    record.student_name = data.get("student_name", record.student_name)
    record.student_id = data.get("student_id", record.student_id)
    record.course_year_section = data.get("course_year_section", record.course_year_section)
    record.gender = data.get("gender", record.gender)
    record.violation_text = data.get("violation_text", record.violation_text)

    if "violation_date" in data:
        record.violation_date = parse_date_flexible(data.get("violation_date"))

    db.session.commit()
    return jsonify({"message": "Violation updated"})


@violation_bp.delete("/<int:id>")
def delete_violation(id):
    record = Violation.query.get(id)
    if not record:
        return jsonify({"message": "Violation not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Violation deleted"})
