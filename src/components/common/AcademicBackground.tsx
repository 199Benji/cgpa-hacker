export default function AcademicBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]">
      
      {/* 1. Very Subtle Grid (Keeps it academic/structured) */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* 2. Floating Geometric Shapes (The "Mad" Beauty) */}
      
      {/* Large Hollow Circle (Top Left) */}
      <div 
        className="absolute top-[10%] left-[5%] w-32 h-32 md:w-64 md:h-64 border border-white/10 rounded-full"
        style={{ animation: 'float 18s ease-in-out infinite' }}
      />

      {/* Medium Dashed Circle (Bottom Right) */}
      <div 
        className="absolute bottom-[15%] right-[10%] w-24 h-24 md:w-48 md:h-48 border border-dashed border-primary/20 rounded-full"
        style={{ animation: 'floatReverse 22s ease-in-out infinite' }}
      />

      {/* Small Solid Square (Top Right) */}
      <div 
        className="absolute top-[20%] right-[15%] w-4 h-4 md:w-6 md:h-6 border border-blue-500/30 rounded-sm rotate-45"
        style={{ animation: 'spinSlow 30s linear infinite' }}
      />

      {/* Tiny Floating Dots */}
      <div 
        className="absolute top-[40%] left-[20%] w-2 h-2 bg-primary/40 rounded-full"
        style={{ animation: 'float 12s ease-in-out infinite' }}
      />
      <div 
        className="absolute bottom-[30%] right-[30%] w-3 h-3 bg-purple-500/30 rounded-full"
        style={{ animation: 'floatReverse 15s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-[60%] left-[60%] w-1.5 h-1.5 bg-blue-400/40 rounded-full"
        style={{ animation: 'float 20s ease-in-out infinite' }}
      />

      {/* Thin Connecting Line (Abstract) */}
      <div 
        className="absolute top-[30%] left-[30%] w-32 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12"
        style={{ animation: 'pulseLine 8s ease-in-out infinite' }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(15px); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(30px) translateX(-15px); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseLine {
          0%, 100% { opacity: 0.3; width: 100px; }
          50% { opacity: 0.8; width: 150px; }
        }
      `}</style>
    </div>
  );
}