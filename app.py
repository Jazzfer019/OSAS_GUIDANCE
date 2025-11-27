from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, date
import hashlib
import feedparser
from dateutil import parser  # flexible date parsing
import os
import uuid

# ==========================
# FLASK APP CONFIG
# ==========================
app = Flask(__name__)
CORS(app)

# ==========================
# DATABASE CONFIG
# ==========================
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/cvsu_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ==========================
# UPLOADS CONFIG
# ==========================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ==========================
# MODELS
# ==========================
class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    student_number = db.Column(db.String(20), unique=True, nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Admin(db.Model):
    __tablename__ = 'admin_tbl'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=True)

class Violation(db.Model):
    __tablename__ = "violations"
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(150), nullable=False)
    student_id = db.Column(db.Integer, nullable=False)
    course_year_section = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    violation_text = db.Column(db.Text, nullable=False)
    violation_date = db.Column(db.Date, nullable=False, default=date.today)

with app.app_context():
    db.create_all()

# ==========================
# HELPERS
# ==========================
def verify_password(stored_password, input_password):
    """Check if stored password matches input (supports SHA256 hashed)."""
    if len(stored_password) == 64 and all(c in "0123456789abcdef" for c in stored_password.lower()):
        return hashlib.sha256(input_password.encode()).hexdigest() == stored_password
    return stored_password == input_password

def parse_date_flexible(date_str):
    """Parse any common date string to date object. Defaults to today on failure."""
    if not date_str:
        return date.today()
    try:
        return parser.parse(date_str).date()
    except Exception:
        return date.today()

# ==========================
# VIOLATION ROUTES
# ==========================
@app.route("/violations", methods=["GET"])
def get_all_violations():
    records = Violation.query.order_by(Violation.id.desc()).all()
    data = []
    for r in records:
        violation_date = r.violation_date or date.today()
        data.append({
            "id": r.id,
            "student_name": r.student_name,
            "student_id": r.student_id,
            "course_year_section": r.course_year_section,
            "gender": r.gender,
            "violation_text": r.violation_text,
            "violation_date": violation_date.strftime("%Y-%m-%d"),
        })
    return jsonify(data), 200

@app.route("/violations", methods=["POST"])
def add_violation():
    data = request.json or {}
    required = ["student_name", "student_id", "course_year_section", "gender", "violation_text"]
    for key in required:
        if key not in data or not data[key]:
            return jsonify({"message": f"Missing field: {key}"}), 400

    violation_date = parse_date_flexible(data.get("violation_date"))

    new_rec = Violation(
        student_name=data["student_name"],
        student_id=data["student_id"],
        course_year_section=data["course_year_section"],
        gender=data["gender"],
        violation_text=data["violation_text"],
        violation_date=violation_date,
    )
    db.session.add(new_rec)
    db.session.commit()
    return jsonify({"message": "Violation record submitted successfully"}), 201

@app.route("/violations/<int:v_id>", methods=["PUT"])
def update_violation(v_id):
    record = Violation.query.get(v_id)
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
    return jsonify({"message": "Violation updated successfully"}), 200

#------------#Delete Violation------------------------------------------

@app.route("/violations/<int:v_id>", methods=["DELETE"])
def delete_violation(v_id):
    record = Violation.query.get(v_id)
    if not record:
        return jsonify({"message": "Violation not found"}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Violation deleted"}), 200



# ==========================
# STUDENT ROUTES
# ==========================
@app.route('/login', methods=['POST'])
def student_login():
    data = request.json or {}
    student_number = data.get('student_number')
    password = data.get('password')
    if not student_number or not password:
        return jsonify({"message": "Missing student_number or password"}), 400

    student = Student.query.filter_by(student_number=student_number).first()
    if not student or not verify_password(student.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    return jsonify({
        'message': 'Student login successful',
        'student': {
            'id': student.id,
            'student_number': student.student_number,
            'student_name': student.student_name,
            'email': student.email
        }
    })

@app.route('/register', methods=['POST'])
def student_register():
    data = request.json or {}
    if not all(k in data for k in ['student_number', 'student_name', 'email', 'password']):
        return jsonify({"message": "Missing registration fields"}), 400

    if Student.query.filter_by(student_number=data['student_number']).first():
        return jsonify({'message': 'Student number exists'}), 409
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email exists'}), 409

    hashed_password = hashlib.sha256(data['password'].encode()).hexdigest()
    new_student = Student(
        student_number=data['student_number'],
        student_name=data['student_name'],
        email=data['email'],
        password=hashed_password
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify({'message': 'Registration successful'}), 201

# ==========================
# STUDENT SEARCH ROUTE
# ==========================
@app.route("/student", methods=["GET"])
def get_student():
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify(None), 200

    if query.isdigit():
        student = Student.query.filter_by(id=int(query)).first()
    else:
        student = Student.query.filter(Student.student_name.ilike(f"%{query}%")).first()

    if student:
        return jsonify({
            "student_id": student.id,
            "student_name": student.student_name,
            "gender": "",
            "course_year_section": "",
        }), 200
    return jsonify(None), 200

# ==========================
# ADMIN ROUTES
# ==========================
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin or not verify_password(admin.password, password):
        return jsonify({'message': 'Invalid admin credentials'}), 401

    profile_url = (
        f"{request.host_url}uploads/{admin.profile_pic}" 
        if admin.profile_pic else f"{request.host_url}uploads/default.png"
    )
    return jsonify({
        'message': 'Admin login successful',
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'profile_pic': profile_url
        }
    })

@app.route('/admin/upload_profile', methods=['POST'])
def upload_profile_pic():
    admin_id = request.form.get('id')
    file = request.files.get('profile_pic')

    if not admin_id or not file:
        return jsonify({"message": "Missing admin ID or profile_pic file"}), 400

    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"message": "Admin not found"}), 404

    # Ensure uploads folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Validate file type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
        return jsonify({"message": "Invalid file type"}), 400

    # Save file
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)

    # Update DB
    admin.profile_pic = unique_filename
    db.session.commit()

    profile_url = f"{request.host_url}uploads/{unique_filename}"
    return jsonify({"message": "Profile picture updated", "profile_pic": profile_url}), 200

# ==========================
# Serve uploaded files
# ==========================
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/admin/me', methods=['GET'])
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

# ==========================
# MONTHLY STATISTICS
# ==========================
@app.route("/statistics/monthly", methods=["GET"])
def monthly_stats():
    result = {m: 0 for m in ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}
    violations = Violation.query.all()
    for v in violations:
        dt = v.violation_date or date.today()
        result[dt.strftime("%b")] += 1
    output = [{"month": m, "cases": c} for m, c in result.items()]
    return jsonify(output), 200

# ==========================
# NEWS ROUTE
# ==========================
@app.route("/api/news", methods=["GET"])
def get_news():
    feed = feedparser.parse("https://news.google.com/rss?hl=en-PH&gl=PH&ceid=PH:en")
    articles = []
    for entry in feed.entries[:10]:
        articles.append({
            "title": entry.title,
            "link": entry.link,
            "source": entry.source.title if hasattr(entry,"source") else "Unknown"
        })
    return jsonify({"status": "ok", "articles": articles}), 200

# ==========================
# RUN SERVER
# ==========================
if __name__ == "__main__":
    # Ensure default.png exists in uploads folder
    default_path = os.path.join(app.config['UPLOAD_FOLDER'], "default.png")
    if not os.path.exists(default_path):
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (150, 150), color = 'gray')
        d = ImageDraw.Draw(img)
        d.text((45,65), "Admin", fill=(255,255,255))
        img.save(default_path)
    app.run(debug=True)
