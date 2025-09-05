#!/usr/bin/env python3
"""
Simple test script to verify Flask server can start
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    print("[SUCCESS] Flask app imported successfully")

    # Test basic functionality
    with app.test_client() as client:
        response = client.get('/')
        if response.status_code == 200:
            print("[SUCCESS] Root endpoint working")
            print(f"Response: {response.get_json()}")
        else:
            print(f"[ERROR] Root endpoint failed: {response.status_code}")

except ImportError as e:
    print(f"[ERROR] Import error: {e}")
    print("Check if all required packages are installed:")
    print("pip install -r requirements.txt")

except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()

print("\n[INFO] Troubleshooting steps:")
print("1. Install dependencies: pip install -r requirements.txt")
print("2. Check .env file exists with Firebase credentials")
print("3. Run: python app.py")
print("4. Test: curl http://localhost:5000")