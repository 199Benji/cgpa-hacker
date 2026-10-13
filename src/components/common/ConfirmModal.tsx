import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Save, LogOut, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary' | 'success'; // 'danger' is default
  icon?: React.ReactNode;
  confirmText?: string;
}

export default function ConfirmModal({ 
  isOpen, title, message, onConfirm, onCancel, 
  variant = 'danger', 
  icon = <AlertTriangle className="w-6 h-6" />, 
  confirmText = 'Confirm' 
}: ConfirmModalProps) {
  
  // Determine colors based on variant
  const iconBg = variant === 'danger' ? 'bg-danger/10 text-danger' : 
                 variant === 'primary' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success';
  
  const btnColor = variant === 'danger' ? 'bg-danger hover:bg-red-600' : 
                   variant === 'primary' ? 'bg-primary hover:bg-primary-hover' : 'bg-success hover:bg-emerald-600';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 text-text-muted hover:text-text-main">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className={`${iconBg} p-3 rounded-full mb-4`}>
                {icon}
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">{title}</h3>
              <p className="text-text-muted text-sm mb-6">{message}</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-lg border border-border text-text-main hover:bg-background transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className={`flex-1 py-2.5 rounded-lg text-white transition-colors font-medium ${btnColor}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}