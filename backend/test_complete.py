#!/usr/bin/env python3
"""
Test the complete interview endpoint
"""

import requests
import json

def test_complete_interview():
    # First, start an interview
    start_url = 'http://localhost:5000/api/interview/start'
    start_data = {
        'userId': 'test123',
        'domain': 'javascript',
        'difficulty': 'intermediate',
        'questionCount': 3
    }

    try:
        print("[TEST] Starting interview...")
        start_response = requests.post(start_url, json=start_data)
        print(f"Start response status: {start_response.status_code}")

        if start_response.status_code == 200:
            start_result = start_response.json()
            interview_id = start_result.get('interviewId')
            print(f"Interview ID: {interview_id}")

            # Get questions
            questions_url = f'http://localhost:5000/api/interview/{interview_id}/questions'
            questions_response = requests.get(questions_url)
            print(f"Questions response status: {questions_response.status_code}")

            if questions_response.status_code == 200:
                questions_data = questions_response.json()
                questions = questions_data.get('questions', [])
                print(f"Got {len(questions)} questions")

                # Prepare answers
                answers = []
                for i, q in enumerate(questions):
                    answers.append({
                        'questionId': q['id'],
                        'text': f'This is a test answer for question {i+1}'
                    })

                # Complete interview
                complete_url = f'http://localhost:5000/api/interview/{interview_id}/complete'
                complete_data = {'answers': answers}

                print("[TEST] Completing interview...")
                complete_response = requests.post(complete_url, json=complete_data)
                print(f"Complete response status: {complete_response.status_code}")

                if complete_response.status_code == 200:
                    result = complete_response.json()
                    print("[SUCCESS] Interview completed!")
                    print(f"Report generated: {'report' in result}")
                else:
                    print(f"[ERROR] Complete failed: {complete_response.text}")
            else:
                print(f"[ERROR] Questions failed: {questions_response.text}")
        else:
            print(f"[ERROR] Start failed: {start_response.text}")

    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to server. Is Flask running?")
    except Exception as e:
        print(f"[ERROR] Exception: {e}")

if __name__ == '__main__':
    test_complete_interview()