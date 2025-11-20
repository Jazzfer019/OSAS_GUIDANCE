from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import hashlib

app = Flask(__name__)
CORS(app)

# MySQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/cvsu_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ------------------
# Models
# ------------------

# Student model
class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    student_number = db.Column(db.String(20), unique=True, nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# Admin model
class Admin(db.Model):
    __tablename__ = 'admin_tbl'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

# Initialize tables
with app.app_context():
    db.create_all()

# ------------------
# Helper function to verify password
# ------------------
def verify_password(stored_password, input_password):
    """
    Verify if the input password matches the stored password.
    Supports plain-text and SHA-256 hashed passwords.
    """
    # If stored password length is 64, assume SHA-256 hash
    if len(stored_password) == 64 and all(c in "0123456789abcdef" for c in stored_password.lower()):
        return hashlib.sha256(input_password.encode()).hexdigest() == stored_password
    # Otherwise, plain-text comparison
    return stored_password == input_password

# ------------------
# Routes
# ------------------

# Student login
@app.route('/login', methods=['POST'])
def student_login():
    data = request.json
    student_number = data.get('student_number')
    password = data.get('password')

    if not student_number or not password:
        return jsonify({'message': 'All fields are required'}), 400

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
    }), 200

# Admin login
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin or not verify_password(admin.password, password):
        return jsonify({'message': 'Invalid admin credentials'}), 401

    return jsonify({
        'message': 'Admin login successful',
        'admin': {
            'id': admin.id,
            'email': admin.email
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
