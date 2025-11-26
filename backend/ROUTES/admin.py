from flask import Blueprint, request, jsonify
from models import Admin
from helpers import verify_password

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.post("/login")
def admin_login():
    data = request.json or {}
    admin = Admin.query.filter_by(email=data.get("email")).first()

    if not admin or not verify_password(admin.password, data.get("password")):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Admin login successful", "admin": {"id": admin.id, "email": admin.email}})
