import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import MatrixRain from '../../cgpa-hacker/src/components/common/MatrixBackground';

function App() {
  return (
    <BrowserRouter>
      {/* This is the background */}
      <div className="fixed inset-0 bg-[#020617] z-0" /> 
      <MatrixRain /> 
      
      {/* This is your app content */}
      <div className="relative z-10 min-h-screen">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;