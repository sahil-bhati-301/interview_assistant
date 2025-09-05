#!/usr/bin/env python3
"""
Setup script for environment configuration
"""

import os
import shutil

def setup_environment():
    """Set up the environment configuration"""

    print("🔧 AI Interview Assistant - Environment Setup")
    print("=" * 50)

    # Check if .env already exists
    if os.path.exists('.env'):
        print("⚠️  .env file already exists!")
        overwrite = input("Do you want to overwrite it? (y/N): ").lower().strip()
        if overwrite != 'y':
            print("Setup cancelled.")
            return

    # Copy Firebase credentials
    firebase_credentials = input("Enter path to Firebase credentials JSON file: ").strip()
    if firebase_credentials and os.path.exists(firebase_credentials):
        # Copy to backend directory
        shutil.copy(firebase_credentials, 'firebase-credentials.json')
        print("✅ Firebase credentials copied")
    else:
        print("⚠️  Firebase credentials not found. You'll need to set FIREBASE_CREDENTIALS_PATH manually")

    # Get Gemini API key
    gemini_key = input("Enter your Gemini API key: ").strip()

    # Create .env file
    env_content = f"""# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Gemini AI Configuration
GEMINI_API_KEY={gemini_key}

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Application Configuration
APP_NAME=AI Interview Assistant
APP_VERSION=1.0.0
"""

    with open('.env', 'w') as f:
        f.write(env_content)

    print("✅ .env file created successfully!")
    print("\n📋 Next steps:")
    print("1. Run: python app.py")
    print("2. Test: python test_server.py")
    print("3. Start frontend: cd ../ && npm run dev")

if __name__ == '__main__':
    setup_environment()