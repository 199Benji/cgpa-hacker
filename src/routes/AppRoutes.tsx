import { Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from '../components/pages/WelcomeScreen';
import Dashboard from '../components/pages/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      
      {/* Protected Route: The Main App (We will add security logic here later) */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Catch-all: Redirect to home if URL is unknown */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;