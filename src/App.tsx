import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import AcademicBackground from './components/common/AcademicBackground';

function App() {
  return (
    <BrowserRouter>
      <AcademicBackground />

      <AcademicBackground />
      <div className="relative z-10 min-h-screen">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;