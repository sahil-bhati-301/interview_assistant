from typing import Dict, Any, List
import uuid
from datetime import datetime
from utils.firebase_utils import get_firestore_client
from services.ai_service import AIService

class InterviewService:
    def __init__(self):
        self.db = get_firestore_client()
        self.ai_service = AIService()

    def start_interview(self, user_id: str, domain: str, difficulty: str, question_count: int) -> Dict[str, Any]:
        """Start a new interview session"""
        interview_id = str(uuid.uuid4())

        # Generate questions for the interview
        questions = []
        for i in range(question_count):
            question = self.ai_service.generate_question(domain, difficulty)
            questions.append({
                'id': question['id'],
                'text': question['question'],
                'domain': question['domain'],
                'difficulty': question['difficulty'],
                'type': question['type'],
                'tags': question['tags']
            })

        # Create interview document
        interview_data = {
            'userId': user_id,
            'domain': domain,
            'difficulty': difficulty,
            'startedAt': datetime.utcnow(),
            'status': 'in-progress',
            'questions': questions,
            'answers': [],
            'currentQuestionIndex': 0,
            'totalQuestions': question_count
        }

        self.db.collection('interviews').document(interview_id).set(interview_data)

        return {
            'interviewId': interview_id,
            'message': 'Interview started successfully',
            'totalQuestions': question_count,
            'currentQuestion': questions[0] if questions else None
        }

    def get_next_question(self, interview_id: str) -> Dict[str, Any]:
        """Get the next question for an interview"""
        interview_ref = self.db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()

        if not interview_doc.exists:
            raise ValueError("Interview not found")

        interview_data = interview_doc.to_dict()
        current_index = interview_data.get('currentQuestionIndex', 0)
        questions = interview_data.get('questions', [])

        if current_index >= len(questions):
            return {
                'message': 'Interview completed',
                'completed': True
            }

        question = questions[current_index]

        return {
            'question': question,
            'questionNumber': current_index + 1,
            'totalQuestions': len(questions),
            'completed': False
        }

    def submit_answer(self, interview_id: str, question_id: str, answer: str, answer_type: str = 'text') -> Dict[str, Any]:
        """Submit an answer for a question"""
        interview_ref = self.db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()

        if not interview_doc.exists:
            raise ValueError("Interview not found")

        interview_data = interview_doc.to_dict()
        questions = interview_data.get('questions', [])
        answers = interview_data.get('answers', [])
        current_index = interview_data.get('currentQuestionIndex', 0)

        # Find the current question
        if current_index >= len(questions):
            raise ValueError("No more questions to answer")

        current_question = questions[current_index]

        # Analyze the answer using AI
        analysis = self.ai_service.analyze_answer(
            current_question['text'],
            answer,
            interview_data.get('domain', 'general'),
            interview_data.get('difficulty', 'intermediate')
        )

        # Add answer to the list
        answer_data = {
            'questionId': question_id,
            'text': answer,
            'answerType': answer_type,
            'submittedAt': datetime.utcnow(),
            'analysis': analysis
        }

        answers.append(answer_data)

        # Update interview document
        update_data = {
            'answers': answers,
            'currentQuestionIndex': current_index + 1
        }

        # Check if interview is completed
        if current_index + 1 >= len(questions):
            update_data['status'] = 'completed'
            update_data['completedAt'] = datetime.utcnow()

        interview_ref.update(update_data)

        return {
            'message': 'Answer submitted successfully',
            'analysis': analysis,
            'nextQuestionAvailable': current_index + 1 < len(questions)
        }

    def generate_report(self, interview_id: str) -> Dict[str, Any]:
        """Generate a comprehensive report for the interview"""
        interview_ref = self.db.collection('interviews').document(interview_id)
        interview_doc = interview_ref.get()

        if not interview_doc.exists:
            raise ValueError("Interview not found")

        interview_data = interview_doc.to_dict()

        if interview_data.get('status') != 'completed':
            raise ValueError("Interview not completed yet")

        # Prepare data for AI report generation
        report_data = {
            'domain': interview_data.get('domain'),
            'difficulty': interview_data.get('difficulty'),
            'questions_answers': interview_data.get('answers', []),
            'completedAt': interview_data.get('completedAt')
        }

        # Generate AI-powered report
        report = self.ai_service.generate_report(report_data)

        # Update interview with report
        interview_ref.update({
            'report': report
        })

        return report

    def get_interview_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get interview history for a user"""
        interviews_ref = self.db.collection('interviews')
        query = interviews_ref.where('userId', '==', user_id).order_by('startedAt', direction='descending')
        results = query.stream()

        history = []
        for doc in results:
            interview_data = doc.to_dict()
            history.append({
                'id': doc.id,
                'domain': interview_data.get('domain'),
                'difficulty': interview_data.get('difficulty'),
                'startedAt': interview_data.get('startedAt'),
                'status': interview_data.get('status'),
                'totalQuestions': interview_data.get('totalQuestions', 0),
                'completedAt': interview_data.get('completedAt'),
                'report': interview_data.get('report')
            })

        return history