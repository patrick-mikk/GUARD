from flask import Blueprint, jsonify, request, abort
from models import db, Survey, Question, Response

api = Blueprint('api', __name__)

@api.route('/surveys', methods=['GET'])
def get_surveys():
    """Retrieve application surveys in JSON form."""
    surveys = Survey.query.all()
    data = []
    for s in surveys:
        data.append({
            "id": s.id,
            "unique_id": s.unique_id,
            "title": s.title,
            "description": s.description
        })
    return jsonify(data)

@api.route('/surveys/<string:unique_id>', methods=['GET'])
def get_survey(unique_id):
    """Retrieve a specific survey by unique_id."""
    survey = Survey.query.filter_by(unique_id=unique_id).first()
    if not survey:
        abort(404, description="Survey not found")

    # Build a dict with survey data and questions
    survey_data = {
        "id": survey.id,
        "unique_id": survey.unique_id,
        "title": survey.title,
        "description": survey.description,
        "questions": []
    }
    for q in survey.questions:
        survey_data["questions"].append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options
        })
    return jsonify(survey_data)

@api.route('/surveys', methods=['POST'])
def create_survey():
    """Create a new survey from JSON data."""
    json_data = request.get_json()
    if not json_data:
        abort(400, description="No JSON data provided")

    new_survey = Survey(
        title=json_data.get("title"),
        description=json_data.get("description")
    )
    db.session.add(new_survey)
    db.session.commit()

    # If survey has questions, create them
    questions = json_data.get("questions", [])
    for question_data in questions:
        q = Question(
            survey_id=new_survey.id,
            question_text=question_data.get("question_text", ""),
            question_type=question_data.get("question_type", "short"),
            options=question_data.get("options", "")
        )
        db.session.add(q)
    db.session.commit()

    return jsonify({"message": "Survey created", "unique_id": new_survey.unique_id}), 201

@api.route('/surveys/<string:unique_id>/responses', methods=['POST'])
def submit_response(unique_id):
    """Submit a response for a given survey via JSON."""
    survey = Survey.query.filter_by(unique_id=unique_id).first()
    if not survey:
        abort(404, description="Survey not found")

    data = request.get_json()
    if not data:
        abort(400, description="No JSON data provided")

    new_response = Response(
        survey_id=survey.id,
        answers=data.get("answers", "{}")  # Expect a dict with question_id: answer
    )
    db.session.add(new_response)
    db.session.commit()

    return jsonify({"message": "Response submitted"}), 201

@api.route('/surveys/<string:unique_id>/responses', methods=['GET'])
def get_responses(unique_id):
    """Return application responses for a given survey."""
    survey = Survey.query.filter_by(unique_id=unique_id).first()
    if not survey:
        abort(404, description="Survey not found")

    results = []
    for r in survey.responses:
        results.append({
            "response_id": r.id,
            "answers": r.answers  # stored as JSON string
        })
    return jsonify(results)
