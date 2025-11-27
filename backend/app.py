from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load configuration
    app.config.from_object("config.Config")

    # Initialize database
    db.init_app(app)

    with app.app_context():
        from models import Student, Admin, Violation
        db.create_all()


    # --------------------------------
    # 👉 IMPORT ROUTES HERE
    # --------------------------------
    from routes.students import student_bp
    from routes.violations import violation_bp
    from routes.admin import admin_bp
    from routes.statistics import stats_bp
    from routes.news import news_bp

    # --------------------------------
    # 👉 REGISTER BLUEPRINTS HERE
    # --------------------------------
    app.register_blueprint(student_bp)
    app.register_blueprint(violation_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(news_bp)

    return app


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
