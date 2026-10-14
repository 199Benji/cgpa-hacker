import { useEffect, useState, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import LoadingScreen from './../components/common/LoadingScreen';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the user's login state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen message="Verifying access..." />;
  }

  // If no user is logged in, 
  if (!user) {
    return <Navigate to="/" replace />;
  }

  
  return children;
}