import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxBjX7O6nDbYpmyO35Zi44wg2olbemax8",
  authDomain: "cgpa-hacker.firebaseapp.com",
  projectId: "cgpa-hacker",
  storageBucket: "cgpa-hacker.firebasestorage.app",
  messagingSenderId: "1061108649530",
  appId: "1:1061108649530:web:7fa4aa6389cc3ba9dfaf03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);