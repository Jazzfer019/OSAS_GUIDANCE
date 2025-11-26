from flask import Blueprint, request, jsonify
from models import Student
from app import db
import hashlib
from helpers import verify_password

student_bp = Blueprint("students", __name__)


@student_bp.post("/login")
def login_student():
    data = request.json or {}
    student_number = data.get("student_number")
    password = data.get("password")

    student = Student.query.filter_by(student_number=student_number).first()
    if not student or not verify_password(student.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "student": {
            "id": student.id,
            "student_number": student.student_number,
            "student_name": student.student_name,
            "email": student.email,
        },
    })


@student_bp.post("/register")
def register_student():
    data = request.json or {}

    if Student.query.filter_by(student_number=data["student_number"]).first():
        return jsonify({"message": "Student number exists"}), 409

    if Student.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email exists"}), 409

    hashed_pw = hashlib.sha256(data["password"].encode()).hexdigest()

    new_stud = Student(
        student_number=data["student_number"],
        student_name=data["student_name"],
        email=data["email"],
        password=hashed_pw,
    )
    db.session.add(new_stud)
    db.session.commit()
    return jsonify({"message": "Registration successful"}), 201


@student_bp.get("/student")
def get_student():
    query = request.args.get("query", "").strip()

    if query.isdigit():
        student = Student.query.filter_by(id=int(query)).first()
    else:
        student = Student.query.filter(Student.student_name.ilike(f"%{query}%")).first()

    if not student:
        return jsonify(None)

    return jsonify({
        "student_id": student.id,
        "student_name": student.student_name,
        "gender": "",
        "course_year_section": "",
    })
