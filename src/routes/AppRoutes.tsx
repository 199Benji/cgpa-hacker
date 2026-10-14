import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from '../components/pages/WelcomeScreen';
import Dashboard from '../components/pages/Dashboard';
import ProtectedRoute from '../routes/ProtectedRoute'; 

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<WelcomeScreen />} />
      
      {/* Protected Route */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}