# AI Interview Assistant

A React-based AI-powered technical interview assistant that helps users practice technical interviews with real-time feedback and analysis.

## Features

- **AI-Powered Questions**: Generate technical interview questions using Google Gemini AI
- **Multiple Domains**: Support for JavaScript, Python, React, and more
- **Real-time Analysis**: Get instant feedback on your answers
- **Progress Tracking**: Monitor your interview performance over time
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
AI-Interview-Assistant/
├── backend/                 # Python Flask backend
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── app.py              # Main Flask application
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React context for state management
│   └── services/          # API service functions
└── public/                 # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Firebase project with Firestore enabled
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd AI-Interview-Assistant/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials and Gemini API key
   ```

5. **Run the backend:**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd AI-Interview-Assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase configuration:**
   - Create a `.env` file in the root directory
   - Add your Firebase configuration

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Firebase Setup

1. **Create a Firebase project** at https://console.firebase.google.com/
2. **Enable Firestore** in your Firebase project
3. **Generate service account credentials** for backend access
4. **Enable Authentication** with Email/Password provider

## Environment Variables

### Backend (.env)
```
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## API Endpoints

- `POST /api/interview/start` - Start a new interview
- `GET /api/interview/:id/question` - Get next question
- `POST /api/interview/:id/answer` - Submit answer
- `GET /api/interview/:id/report` - Get analysis report
- `GET /api/interview/history/:userId` - Get interview history

## Development Workflow

1. **Start the backend server** in one terminal
2. **Start the frontend development server** in another terminal
3. **Make changes** to components and see them update in real-time
4. **Test the interview flow** end-to-end

## Building for Production

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
