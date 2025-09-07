from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from services.interview_service import InterviewService
from question_bank import get_questions
from utils.firebase_utils import initialize_firebase
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=[
    "https://interview-88de2.web.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
])

# Initialize Firebase
initialize_firebase()

# Initialize services (without AI for now)
interview_service = InterviewService()

@app.route('/')
def home():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'API is running (Simple Mode)',
        'message': 'AI Interview Assistant Backend',
        'version': '1.0.0-simple',
        'endpoints': [
            'POST /api/interview/start',
            'GET /api/interview/<id>/questions',
            'POST /api/interview/<id>/complete',
            'GET /api/interview/<id>/report'
        ]
    })

@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    """Start a new interview session"""
    try:
        data = request.get_json()
        user_id = data.get('userId', 'test')
        domain = data.get('domain', 'javascript')
        difficulty = data.get('difficulty', 'intermediate')
        question_count = data.get('questionCount', 5)

        # Get questions from question bank
        questions = get_questions(domain, difficulty, question_count)

        # Format questions for response
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                'id': q['id'],
                'text': q['question'],
                'domain': domain,
                'difficulty': difficulty,
                'type': q['type']
            })

        # Create interview document in Firestore
        interview_id = str(uuid.uuid4())
        interview_data = {
            'userId': user_id,
            'domain': domain,
            'difficulty': difficulty,
            'startedAt': datetime.utcnow(),
            'status': 'in-progress',
            'questions': formatted_questions,
            'answers': [],
            'currentQuestionIndex': 0,
            'totalQuestions': len(formatted_questions)
        }

        # Save to Firestore
        interview_service.db.collection('interviews').document(interview_id).set(interview_data)

        return jsonify({
            'interviewId': interview_id,
            'message': 'Interview started successfully',
            'totalQuestions': len(formatted_questions),
            'currentQuestion': formatted_questions[0] if formatted_questions else None
        }), 200
    except Exception as e:
        print(f"Error starting interview: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/questions', methods=['GET'])
def get_interview_questions(interview_id):
    """Get all questions for an interview"""
    try:
        # Get interview data from Firestore
        interview_ref = interview_service.db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()

        if not interview_doc.exists:
            return jsonify({'error': 'Interview not found'}), 404

        interview_data = interview_doc.to_dict()
        questions = interview_data.get('questions', [])

        return jsonify({
            'questions': questions,
            'totalQuestions': len(questions)
        }), 200
    except Exception as e:
        print(f"Error getting questions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/complete', methods=['POST'])
def complete_interview(interview_id):
    """Complete interview by submitting all answers at once"""
    try:
        data = request.get_json()
        answers = data.get('answers', [])

        # Submit all answers
        for answer_data in answers:
            question_id = answer_data.get('questionId')
            answer_text = answer_data.get('text')

            if question_id and answer_text:
                interview_service.submit_answer(interview_id, question_id, answer_text, 'text')

        # Mark interview as completed
        interview_ref = interview_service.db.collection('interviews').document(interview_id)
        interview_ref.update({
            'status': 'completed',
            'completedAt': datetime.utcnow()
        })

        # Generate simple report (without AI)
        total_questions = len(answers)
        completed_answers = len([a for a in answers if a.get('text', '').strip()])

        report = {
            'overallScore': round((completed_answers / total_questions) * 100, 1) if total_questions > 0 else 0,
            'performanceLevel': 'Completed' if completed_answers == total_questions else 'Partial',
            'totalQuestions': total_questions,
            'domain': 'javascript',  # Would get from interview data
            'difficulty': 'intermediate',
            'strengths': ['Completed interview', 'Provided answers'],
            'weaknesses': ['AI analysis not available'],
            'recommendations': ['Set up Gemini API for full analysis'],
            'questionAnalysis': [],
            'conceptMastery': {
                'wellUnderstood': [],
                'needsWork': []
            }
        }

        # Update interview with report
        interview_ref.update({
            'report': report
        })

        return jsonify({
            'message': 'Interview completed successfully',
            'report': report
        }), 200
    except Exception as e:
        print(f"Error completing interview: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/report', methods=['GET'])
def get_report(interview_id):
    """Get the analysis report for an interview"""
    try:
        interview_ref = interview_service.db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()

        if not interview_doc.exists:
            return jsonify({'error': 'Interview not found'}), 404

        interview_data = interview_doc.to_dict()
        report = interview_data.get('report')

        if not report:
            return jsonify({'error': 'Report not found'}), 404

        return jsonify(report), 200
    except Exception as e:
        print(f"Error getting report: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[STARTING] AI Interview Assistant (Simple Mode)")
    print("[INFO] This mode works without Gemini API for testing")
    print("[INFO] To enable AI analysis, run setup_env.py and use app.py")
    app.run(debug=True, port=5000)