import google.generativeai as genai
import os
import json
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
print(f"DEBUG: GEMINI_API_KEY loaded: {bool(os.getenv('GEMINI_API_KEY'))}")

class AIService:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    def generate_question(self, domain: str, difficulty: str, question_type: str = "technical") -> Dict[str, Any]:
        """Generate a technical interview question using Gemini AI"""
        prompt = f"""Generate a {difficulty} level {domain} technical interview question.
Question type: {question_type}
The question should test understanding of core concepts and problem-solving skills.

Format the response as JSON with the following structure:
{{
  "question": "The actual question text",
  "domain": "{domain}",
  "difficulty": "{difficulty}",
  "type": "{question_type}",
  "tags": ["array", "of", "relevant", "tags"]
}}"""

        try:
            response = self.model.generate_content(prompt)
            # Parse the JSON response
            result = json.loads(response.text.strip())

            # Add a unique ID
            result['id'] = f"{domain}_{difficulty}_{hash(result['question']) % 10000}"

            return result
        except Exception as e:
            # Fallback question if AI fails
            return {
                'id': f"{domain}_{difficulty}_fallback",
                'question': f"What are the key concepts in {domain} that a {difficulty} developer should know?",
                'domain': domain,
                'difficulty': difficulty,
                'type': question_type,
                'tags': [domain, difficulty]
            }

    def analyze_answer(self, question: str, user_answer: str, domain: str, difficulty: str) -> Dict[str, Any]:
        """Analyze a user's answer using Gemini AI"""
        prompt = f"""Analyze the following {domain} technical interview answer:

Question: {question}
User Answer: {user_answer}

Provide a comprehensive analysis including:
1. Correctness (0-100%)
2. Depth of understanding (0-100%)
3. Key concepts identified
4. Missing concepts
5. Suggestions for improvement
6. Strengths in the answer
7. Overall score (0-100)

Format the response as JSON with the following structure:
{{
  "correctness": 0-100,
  "depth": 0-100,
  "conceptsIdentified": ["array", "of", "concepts"],
  "missingConcepts": ["array", "of", "missing", "concepts"],
  "suggestions": "improvement suggestions",
  "strengths": "identified strengths",
  "overallScore": 0-100
}}"""

        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            return result
        except Exception as e:
            # Fallback analysis if AI fails - analyze based on answer content
            user_answer_lower = user_answer.lower().strip()

            # Check for poor answers
            poor_indicators = ['idk', 'i don\'t know', 'no idea', 'don\'t know', 'not sure', 'no', 'none', 'nothing']
            if any(indicator in user_answer_lower for indicator in poor_indicators) or len(user_answer.strip()) < 5:
                return {
                    'correctness': 0,
                    'depth': 0,
                    'conceptsIdentified': [],
                    'missingConcepts': ['basic understanding of the topic'],
                    'suggestions': 'You need to study the fundamentals of this topic.',
                    'strengths': 'Attempted to answer the question.',
                    'overallScore': 5
                }

            # Generic fallback for other cases
            return {
                'correctness': 30,
                'depth': 20,
                'conceptsIdentified': ['basic attempt'],
                'missingConcepts': ['detailed explanation', 'specific examples'],
                'suggestions': 'Try to provide more specific examples and technical details.',
                'strengths': 'Shows willingness to answer.',
                'overallScore': 25
            }

    def generate_report(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a comprehensive interview report using AI analysis"""
        questions_answers = interview_data.get('questions_answers', [])
        domain = interview_data.get('domain', 'general')
        difficulty = interview_data.get('difficulty', 'intermediate')

        # Prepare the interview data for AI analysis
        qa_text = ""
        for i, qa in enumerate(questions_answers, 1):
            qa_text += f"\nQuestion {i}: {qa.get('questionText', 'N/A')}\n"
            qa_text += f"User Answer: {qa.get('text', 'N/A')}\n"

        prompt = f"""Analyze this complete {domain} technical interview session for a {difficulty} level candidate.

Interview Data:
{qa_text}

Provide a comprehensive analysis in the following JSON format:
{{
  "overallScore": 0-100,
  "performanceLevel": "Excellent/Good/Needs Improvement",
  "totalQuestions": {len(questions_answers)},
  "domain": "{domain}",
  "difficulty": "{difficulty}",
  "strengths": ["array of key strengths identified"],
  "weaknesses": ["array of areas needing improvement"],
  "questionAnalysis": [
    {{
      "questionNumber": 1,
      "score": 0-100,
      "feedback": "detailed feedback for this question"
    }}
  ],
  "recommendations": ["array of specific recommendations"],
  "conceptMastery": {{
    "wellUnderstood": ["concepts they excel at"],
    "needsWork": ["concepts requiring more study"]
  }}
}}"""

        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            return result
        except Exception as e:
            print(f"AI report generation failed: {e}")
            # Fallback to basic analysis
            total_questions = len(questions_answers)
            total_score = sum(qa.get('analysis', {}).get('overallScore', 0) for qa in questions_answers)
            average_score = total_score / total_questions if total_questions > 0 else 0

            if average_score >= 80:
                performance_level = "Excellent"
            elif average_score >= 60:
                performance_level = "Good"
            else:
                performance_level = "Needs Improvement"

            return {
                'overallScore': round(average_score, 1),
                'performanceLevel': performance_level,
                'totalQuestions': total_questions,
                'domain': domain,
                'difficulty': difficulty,
                'strengths': ['Shows basic understanding'],
                'weaknesses': ['Could provide more detailed explanations'],
                'questionAnalysis': [],
                'recommendations': ['Practice more coding problems', 'Review fundamental concepts'],
                'conceptMastery': {
                    'wellUnderstood': [],
                    'needsWork': []
                }
            }