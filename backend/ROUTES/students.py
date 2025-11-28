from flask import Blueprint, request, jsonify
from extension import db
from models import Student
import hashlib
from flask_cors import cross_origin
import traceback

# ===========================
# Blueprint
# ===========================
student_bp = Blueprint("students", __name__, url_prefix="/students")

# ===========================
# Helper Functions
# ===========================
def hash_password(password):
    """Hash a password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest() if password else None

def verify_password(stored_password, provided_password):
    """Verify a password against the stored hash."""
    return stored_password == hashlib.sha256(provided_password.encode()).hexdigest()

# ===========================
# REGISTER STUDENT
# ===========================
@student_bp.route("/register", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def register_student():
    if request.method == "OPTIONS":
        return jsonify({"msg": "CORS OK"}), 200
    try:
        data = request.get_json() or {}
        student_number = data.get("student_number")
        student_name = data.get("student_name")
        email = data.get("email")
        password = data.get("password")

        if not all([student_number, student_name, email, password]):
            return jsonify({"message": "Missing required fields"}), 400

        # Ensure numeric student number
        try:
            student_number = int(student_number)
        except:
            return jsonify({"message": "Student number must be numeric"}), 400

        # Check for duplicates
        if Student.query.filter_by(student_number=student_number).first():
            return jsonify({"message": "Student number already exists"}), 409
        if Student.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists"}), 409

        hashed_pw = hash_password(password)
        new_student = Student(
            student_number=student_number,
            student_name=student_name,
            email=email,
            password=hashed_pw
        )
        db.session.add(new_student)
        db.session.commit()

        return jsonify({"message": "Registration successful"}), 201

    except Exception:
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error"}), 500

# ===========================
# LOGIN STUDENT
# ===========================
@student_bp.route("/login", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def login_student():
    if request.method == "OPTIONS":
        return jsonify({"msg": "CORS OK"}), 200
    try:
        data = request.get_json() or {}
        student_number = data.get("student_number")
        password = data.get("password")

        if not student_number or not password:
            return jsonify({"message": "Missing credentials"}), 400

        try:
            student_number = int(student_number)
        except:
            return jsonify({"message": "Student number must be numeric"}), 400

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
            }
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"message": "Internal Server Error"}), 500

# ===========================
# GET STUDENT BY QUERY
# ===========================
@student_bp.route("/student", methods=["GET"])
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def get_student():
    """
    GET /students/student?query=<student_id_or_name>
    Returns only student_id and student_name if found.
    If not found, returns student=None (200 OK). No warnings, no extra fields.
    """
    try:
        query = request.args.get("query", "").strip()
        if not query:
            return jsonify({"student": None}), 200  # silent if empty

        # Search by ID if numeric, else by name
        if query.isdigit():
            student = Student.query.filter_by(id=int(query)).first()
        else:
            student = Student.query.filter(Student.student_name.ilike(f"%{query}%")).first()

        # Only return id and name if found
        return jsonify({
            "student": {
                "student_id": student.id,
                "student_name": student.student_name
            } if student else None
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"student": None}), 200  # silent on error


