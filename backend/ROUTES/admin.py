import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from models import Admin
from helpers import verify_password
from app import db

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/admin")

# -------------------------
# ADMIN LOGIN
# -------------------------
@admin_bp.post("/login")
def admin_login():
    data = request.json or {}
    admin = Admin.query.filter_by(email=data.get("email")).first()

    if not admin or not verify_password(admin.password, data.get("password")):
        return jsonify({"message": "Invalid credentials"}), 401

    profile_url = (
        f"{request.host_url}uploads/{admin.profile_pic}"
        if admin.profile_pic else f"{request.host_url}uploads/default.png"
    )

    return jsonify({
        "message": "Admin login successful",
        "admin": {
            "id": admin.id,
            "email": admin.email,
            "profile_pic": profile_url
        }
    })


# -------------------------
# UPLOAD ADMIN PROFILE PIC
# -------------------------
@admin_bp.post("/upload_profile")
def upload_profile_pic():
    admin_id = request.form.get('id')
    file = request.files.get('profile_pic')

    if not admin_id or not file:
        return jsonify({"message": "Missing admin ID or profile_pic file"}), 400

    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"message": "Admin not found"}), 404

    upload_path = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_path, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
        return jsonify({"message": "Invalid file type"}), 400

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file.save(os.path.join(upload_path, unique_filename))

    admin.profile_pic = unique_filename
    db.session.commit()

    return jsonify({
        "message": "Profile picture updated",
        "profile_pic": f"{request.host_url}uploads/{unique_filename}"
    })


# -------------------------
# SERVE UPLOADED IMAGES
# -------------------------
@admin_bp.get("/uploads/<filename>")
def serve_uploads(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)


# -------------------------
# GET ADMIN INFO
# -------------------------
@admin_bp.get("/me")
def get_admin_info():
    admin_id = request.args.get('id')
    if not admin_id:
        return jsonify({"message": "Admin ID missing"}), 400

    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"message": "Admin not found"}), 404

    profile_url = (
        f"{request.host_url}uploads/{admin.profile_pic}"
        if admin.profile_pic else f"{request.host_url}uploads/default.png"
    )

    return jsonify({
        "id": admin.id,
        "email": admin.email,
        "name": getattr(admin, 'name', 'Admin'),
        "profile_pic": profile_url
    })
