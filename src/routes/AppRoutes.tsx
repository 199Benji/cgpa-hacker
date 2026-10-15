import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from '../components/pages/WelcomeScreen';
import Dashboard from '../components/pages/Dashboard';
import ProtectedRoute from '../routes/ProtectedRoute'; 
import TranscriptView from '../components/pages/TranscriptView';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<WelcomeScreen />} />
      
      {/* Protected Route: Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Protected Route: Transcript */}
      <Route 
        path="/transcript" 
        element={
          <ProtectedRoute>
            <TranscriptView />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}