import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Firebase not initialized, so initialize it
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # For development, you can use the default credentials
            firebase_admin.initialize_app()

def get_firestore_client():
    """Get Firestore client"""
    return firestore.client()

def get_user_profile(user_id):
    """Get user profile from Firestore"""
    db = get_firestore_client()
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    return user_doc.to_dict() if user_doc.exists else None

def create_user_profile(user_id, user_data):
    """Create user profile in Firestore"""
    db = get_firestore_client()
    user_ref = db.collection('users').document(user_id)
    user_ref.set({
        'firstName': user_data.get('firstName', ''),
        'lastName': user_data.get('lastName', ''),
        'email': user_data.get('email', ''),
        'createdAt': firestore.SERVER_TIMESTAMP,
        'lastLogin': firestore.SERVER_TIMESTAMP,
        'preferences': {
            'defaultDomain': 'javascript',
            'defaultDifficulty': 'intermediate',
            'voiceInputEnabled': False,
            'textToSpeechEnabled': False
        },
        'statistics': {
            'totalInterviews': 0,
            'averageScore': 0,
            'domainsAttempted': []
        }
    })

def update_user_statistics(user_id, interview_data):
    """Update user statistics after interview completion"""
    db = get_firestore_client()
    user_ref = db.collection('users').document(user_id)

    # Get current statistics
    user_doc = user_ref.get()
    if user_doc.exists:
        current_stats = user_doc.to_dict().get('statistics', {})
        total_interviews = current_stats.get('totalInterviews', 0) + 1
        domains_attempted = current_stats.get('domains_attempted', [])

        if interview_data.get('domain') not in domains_attempted:
            domains_attempted.append(interview_data.get('domain'))

        user_ref.update({
            'statistics': {
                'totalInterviews': total_interviews,
                'domainsAttempted': domains_attempted
            }
        })