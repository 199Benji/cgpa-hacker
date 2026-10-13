import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../lib/firebase';
import illustration from '../../assets/Learning-amico.png'; 

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user.email;

      // 2. Check the VIP List in Firestore
      const userDoc = await getDoc(doc(db, "allowed_users", userEmail as string));
      if (userDoc.exists()) {
        // SUCCESS: Email is in the database
        navigate('/dashboard', { 
          state: { 
            userName: user.displayName?.split(' ')[0] || 'Student', 
            userEmail: userEmail 
          } 
        });
      } else {
        // FAILURE: Email is NOT in the database
        setError("Access Denied. Please sign in with the email used to purchase the book on Selar.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Login failed. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative z-10">
      <div className="flex flex-col md:flex-row w-full max-w-5xl z-10 items-center gap-8 md:gap-0">
        
        {/* LEFT SIDE: Illustration */}
        <motion.div 
          className="w-full md:w-1/2 flex justify-center hidden md:flex"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={illustration} alt="Student Success" className="w-full max-w-md h-auto object-contain drop-shadow-2xl" />
        </motion.div>

        {/* RIGHT SIDE: Login Card */}
        <motion.div 
          className="w-full md:w-1/2 bg-surface p-8 md:p-12 rounded-3xl shadow-2xl border border-border/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-text-main">CGPA Hacker</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
              Welcome Back.
            </h1>
            <p className="text-text-muted text-lg">
              Sign in to access your academic dashboard.
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Access Restricted</p>
                <p className="text-xs mt-1 opacity-90">{error}</p>
                <a href="https://selar.co/your-book-link" target="_blank" className="inline-block mt-2 text-xs underline hover:text-white">
                  Buy the book to get access &rarr;
                </a>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">Verifying...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border/50"></div>
              <span className="flex-shrink-0 mx-4 text-text-muted text-xs flex items-center gap-1">
                <Lock className="w-3 h-3" /> Secure Login
              </span>
              <div className="flex-grow border-t border-border/50"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}