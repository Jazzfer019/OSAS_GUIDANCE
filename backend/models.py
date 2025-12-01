
from app import db
from datetime import date, datetime
from extension import db  # Use the db instance from extension.py

# -----------------------------
# Student Table
# -----------------------------
class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    student_number = db.Column(db.String(20), unique=True, nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    course = db.Column(db.String(50))


# -----------------------------
# Admin Table
# -----------------------------
class Admin(db.Model):
    __tablename__ = 'admin_tbl'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=True, default='default.png')


# -----------------------------
# Violations Table
# -----------------------------
class Violation(db.Model):
    __tablename__ = "violations"

    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(150), nullable=False)
    student_id = db.Column(db.Integer, nullable=False)
    course_year_section = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    violation_text = db.Column(db.Text, nullable=False)
    violation_date = db.Column(db.Date, nullable=False, default=date.today)

    # ML prediction fields
    predicted_violation = db.Column(db.String(150), nullable=True)
    predicted_section = db.Column(db.String(100), nullable=True)
    predictive_text = db.Column(db.Text, nullable=True)  # Optional: store top-3 predictive text
    standard_text = db.Column(db.Text, nullable=True)    # Optional: store standard dataset text


# -----------------------------
# Uploaded Files Table
# -----------------------------
class UploadedFile(db.Model):
    __tablename__ = "uploaded_files"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    file_type = db.Column(
        db.Enum("good_moral", "rules", "other", name="file_type_enum"),
        nullable=False,
        default="other"
    )
    filename_stored = db.Column(db.String(255), nullable=False)
    filename_original = db.Column(db.String(255), nullable=False)
    mimetype = db.Column(db.String(100), nullable=False)
    size_bytes = db.Column(db.BigInteger, nullable=False)
    path = db.Column(db.String(512), nullable=False)
    uploaded_by = db.Column(db.String(100), nullable=True, default=None)
    uploaded_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
