from flask import Flask, render_template, request, redirect, session
from flask_bcrypt import Bcrypt
import mysql.connector

app = Flask(__name__)
app.secret_key = "yoursecretkey"
bcrypt = Bcrypt(app)

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="myapp"
)
cursor = db.cursor()

# --------------------------
# MAIN LANDING PAGE
# --------------------------
@app.route('/')
def home():
    return render_template("index.html")


# --------------------------
# ADMIN LOGIN
# --------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user[2], password):
            session['user'] = username
            return redirect('/dashboard')
        else:
            return "Invalid Credentials"

    return render_template('login.html')


@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect('/login')
    return f"Welcome {session['user']}!"


# --------------------------
# STUDENT LANDING PAGE
# --------------------------
@app.route('/student')
def student_portal():
    return render_template("student_index.html")


# --------------------------
# STUDENT REGISTER
# --------------------------
@app.route('/student-register', methods=['GET', 'POST'])
def student_register():
    if request.method == 'POST':
        username = request.form['username']
        password = bcrypt.generate_password_hash(
            request.form['password']
        ).decode('utf-8')

        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, password)
        )
        db.commit()

        return "Student registered successfully!"
    return render_template('student_register.html')


# --------------------------
# STUDENT LOGIN
# --------------------------
@app.route('/student-login', methods=['GET', 'POST'])
def student_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor.execute(
            "SELECT * FROM users WHERE username=%s", (username,)
        )
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user[2], password):
            session['student'] = username
            return "Student Logged In!"
        else:
            return "Invalid student credentials."

    return render_template('student_login.html')


# --------------------------
# RUN THE APP
# --------------------------
if __name__ == "__main__":
    app.run(debug=True)
