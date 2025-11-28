import os
from flask import Flask
from flask_cors import CORS
from extension import db  # Import the single SQLAlchemy instance

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["DEBUG"] = True


    # Load configuration
    app.config.from_object("config.Config")

    # Create uploads folder if it doesn't exist
    upload_folder = "upload"
    os.makedirs(upload_folder, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_folder

    # Initialize DB with the app
    db.init_app(app)

    # Create tables
    with app.app_context():
        from models import Student, Admin, Violation, UploadedFile
        db.create_all()

    # ----------------------------
    # Import Blueprints
    # ----------------------------
    from routes.students import student_bp
    from routes.violations import violation_bp
    from routes.admin import admin_bp
    from routes.statistics import stats_bp
    from routes.news import news_bp
    from routes.upload_routes import upload_bp

    # ----------------------------
    # Register Blueprints
    # ----------------------------
    app.register_blueprint(student_bp,url_prefix="/students")
    app.register_blueprint(violation_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(upload_bp)

    return app


# ==========================
# RUN SERVER
# ==========================
if __name__ == "__main__":
    app = create_app()

    # Ensure default.png exists in uploads folder
    default_path = os.path.join(app.config['UPLOAD_FOLDER'], "default.png")
    if not os.path.exists(default_path):
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (150, 150), color="gray")
        d = ImageDraw.Draw(img)
        d.text((45, 65), "Admin", fill=(255, 255, 255))
        img.save(default_path)

    # Print all routes for debugging
    print("\n=== REGISTERED ROUTES ===")
    print(app.url_map)
    print("========================\n")

    

    app.run(debug=True)
