import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import MatrixBackground from './components/common/MatrixBackground';

function App() {
  return (
    <BrowserRouter>
      <div className="fixed inset-0 bg-[#020617] z-0" />
      <MatrixBackground />
      <div className="relative z-10 min-h-screen">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;