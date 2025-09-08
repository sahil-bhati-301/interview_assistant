from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from services.interview_service import InterviewService
from services.ai_service import AIService
from utils.firebase_utils import initialize_firebase

app = Flask(__name__)
CORS(app,
     origins=[
         "https://interview-88de2.web.app",
         "http://localhost:3000",
         "http://localhost:5173",
         "http://127.0.0.1:3000",
         "http://127.0.0.1:5173"
     ],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=True
)

# Initialize Firebase
initialize_firebase()

# Initialize services
interview_service = InterviewService()
ai_service = AIService()

@app.route('/')
def home():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'API is running',
        'message': 'AI Interview Assistant Backend',
        'version': '1.0.0',
        'features': [
            'Complete interview history only (no incomplete interviews)',
            'Automatic cleanup of abandoned interviews',
            'Domain filtering system',
            'AI-powered question analysis'
        ],
        'endpoints': [
            'POST /api/interview/start',
            'GET /api/interview/<id>/question',
            'POST /api/interview/<id>/answer',
            'GET /api/interview/<id>/report',
            'GET /api/interview/history/<user_id>',
            'DELETE /api/interview/history/<user_id>',
            'POST /api/interview/cleanup',
            'GET /api/interview/incomplete/<user_id>'
        ]
    })

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
        # First check if report exists in results collection
        results_ref = interview_service.db.collection('results').document(interview_id)
        result_doc = results_ref.get()

        if result_doc.exists:
            # Return cached report
            return jsonify(result_doc.to_dict()), 200
        else:
            # Generate new report and cache it
            result = interview_service.generate_report(interview_id)

            # Cache the report in results collection
            from firebase_admin import firestore
            results_ref.set({
                'interviewId': interview_id,
                'report': result,
                'generatedAt': firestore.SERVER_TIMESTAMP
            })

            return jsonify(result), 200
    except Exception as e:
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/<interview_id>/complete', methods=['POST'])
def complete_interview(interview_id):
    """Complete interview by submitting all answers at once (lightweight)"""
    try:
        data = request.get_json()
        answers = data.get('answers', [])

        # Submit all answers (this should be fast)
        for answer_data in answers:
            question_id = answer_data.get('questionId')
            answer_text = answer_data.get('text')

            if question_id and answer_text:
                interview_service.submit_answer(interview_id, question_id, answer_text, 'text')

        # Mark interview as completed (fast operation)
        from firebase_admin import firestore
        interview_ref = interview_service.db.collection('interviews').document(interview_id)
        interview_ref.update({
            'status': 'completed',
            'completedAt': firestore.SERVER_TIMESTAMP
        })

        # Return success immediately - report generation will happen separately
        return jsonify({
            'message': 'Interview completed successfully',
            'status': 'completed',
            'interviewId': interview_id
        }), 200
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

@app.route('/api/interview/history/<user_id>', methods=['DELETE'])
def clear_interview_history(user_id):
    """Clear all interview history for a user"""
    try:
        # Get all interviews for the user
        interviews_ref = interview_service.db.collection('interviews')
        query = interviews_ref.where('userId', '==', user_id)
        results = query.stream()

        deleted_count = 0
        for doc in results:
            interview_id = doc.id

            # Delete the interview document
            doc.reference.delete()

            # Delete the corresponding result document
            results_ref = interview_service.db.collection('results').document(interview_id)
            if results_ref.get().exists:
                results_ref.delete()

            deleted_count += 1

        return jsonify({
            'message': f'Successfully deleted {deleted_count} interviews and their results',
            'deletedCount': deleted_count
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/cleanup', methods=['POST'])
def cleanup_abandoned_interviews():
    """Clean up abandoned interviews older than specified days"""
    try:
        data = request.get_json()
        days_old = data.get('daysOld', 7)  # Default to 7 days

        result = interview_service.cleanup_abandoned_interviews(days_old)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interview/incomplete/<user_id>', methods=['GET'])
def get_user_incomplete_interviews(user_id):
    """Get incomplete interviews for a user"""
    try:
        result = interview_service.get_user_incomplete_interviews(user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
