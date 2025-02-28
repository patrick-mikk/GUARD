from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    """Application factory for the GUARD backend (API only)."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)

    # Register our API blueprint
    from api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    # Create database tables if they don't exist yet
    with app.app_context():
        db.create_all()

    return app

# If you run "python app.py" directly, it starts the Flask dev server
if __name__ == '__main__':
    flask_app = create_app()
    flask_app.run(debug=True)
