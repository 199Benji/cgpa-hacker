import { motion } from 'framer-motion';
import logoImg from '/favicon.png'; 

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Initializing Dashboard..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white relative z-50 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center z-10"
      >
        <div className="bg-white/10 p-2 rounded-2xl mb-6 border border-white/20 shadow-lg shadow-primary/10">
          <img 
            src={logoImg} 
            alt="GradeLogic Logo" 
            className="w-16 h-16 object-contain" 
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 tracking-wider text-text-main">GRADELOGIC</h2>
        <p className="text-text-muted text-sm mb-8">{message}</p>
        
        {/* Professional Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-border rounded-full"></div>
          <div className="absolute inset-0 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </motion.div>
    </div>
  );
}