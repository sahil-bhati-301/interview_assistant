import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmIYGLFKEtGHKaeSXstUMEhxuF5K0i0CE", // Replace with your API key
  authDomain: "interview-88de2.firebaseapp.com",
  projectId: "interview-88de2",
  storageBucket: "interview-88de2.firebasestorage.app",
  messagingSenderId: "257732636743",
  appId: "1:257732636743:web:6736dd21807600c3940162"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;