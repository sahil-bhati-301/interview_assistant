#!/usr/bin/env python3
"""
Test Firebase connection
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from utils.firebase_utils import initialize_firebase, get_firestore_client
    print("[SUCCESS] Firebase utils imported")

    initialize_firebase()
    print("[SUCCESS] Firebase initialized")

    db = get_firestore_client()
    print("[SUCCESS] Firestore client created")

    # Test a simple operation
    test_ref = db.collection('test').document('test')
    test_ref.set({'message': 'Firebase connection test', 'timestamp': 'now'})
    print("[SUCCESS] Test document written to Firestore")

    # Clean up
    test_ref.delete()
    print("[SUCCESS] Test document deleted")

    print("\n✅ Firebase is working correctly!")

except Exception as e:
    print(f"[ERROR] Firebase test failed: {e}")
    import traceback
    traceback.print_exc()

    print("\n🔧 Troubleshooting:")
    print("1. Check if firebase-credentials.json exists")
    print("2. Verify the credentials file has correct format")
    print("3. Make sure Firebase project is active")
    print("4. Check internet connection")