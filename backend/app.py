from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from services.interview_service import InterviewService
from services.ai_service import AIService
from utils.firebase_utils import initialize_firebase

app = Flask(__name__)
CORS(app)

# Initialize Firebase
initialize_firebase()

# Initialize services
interview_service = InterviewService()
ai_service = AIService()

@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    """Start a new interview session"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        domain = data.get('domain', 'javascript')
        difficulty = data.get('difficulty', 'intermediate')
        question_count = data.get('questionCount', 5)

        result = interview_service.start_interview(user_id, domain, difficulty, question_count)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/question', methods=['GET'])
def get_question(interview_id):
    """Get the next question for an interview"""
    try:
        result = interview_service.get_next_question(interview_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/answer', methods=['POST'])
def submit_answer(interview_id):
    """Submit an answer for a question"""
    try:
        data = request.get_json()
        question_id = data.get('questionId')
        answer = data.get('answer')
        answer_type = data.get('answerType', 'text')

        result = interview_service.submit_answer(interview_id, question_id, answer, answer_type)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/report', methods=['GET'])
def get_report(interview_id):
    """Get the analysis report for an interview"""
    try:
        result = interview_service.generate_report(interview_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/history/<user_id>', methods=['GET'])
def get_interview_history(user_id):
    """Get interview history for a user"""
    try:
        result = interview_service.get_interview_history(user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)