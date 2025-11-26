from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

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


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
