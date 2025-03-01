# python
import uuid
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Survey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    unique_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    questions = db.relationship('Question', backref='survey', cascade="all, delete-orphan", lazy=True)
    responses = db.relationship('Response', backref='survey', cascade="all, delete-orphan", lazy=True)


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('survey.id'), nullable=False)
    question_text = db.Column(db.String(200), nullable=False)
    question_type = db.Column(db.String(20), nullable=False)
    options = db.Column(db.Text)

class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('survey.id'), nullable=False)
    answers = db.Column(db.Text, nullable=False)
