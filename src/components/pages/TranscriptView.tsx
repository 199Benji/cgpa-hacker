import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, FileText, CheckSquare, Square, Loader2 } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Semester } from '../../lib/cgpaEngine';
import { GRADE_POINTS, calculateOverallCGPA, getDegreeClass } from '../../lib/cgpaEngine';
import LoadingScreen from '../common/LoadingScreen';

// --- SUB-COMPONENT: The Document Layout ---
function TranscriptDocument({ userName, visibleSemesters, cgpa, degreeClass }: { 
  userName: string; 
  visibleSemesters: Semester[]; 
  cgpa: string; 
  degreeClass: { class: string } 
}) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: 'white', padding: '40px' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>GRADELOGIC</h1>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Official Academic Record</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '14px', flex: '1 1 200px' }}>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ color: '#666', fontSize: '10px', display: 'block' }}>Student Name</span>
            <span style={{ fontWeight: 'bold' }}>{userName}</span>
          </div>
          <div>
            <span style={{ color: '#666', fontSize: '10px', display: 'block' }}>Date Issued</span>
            <span style={{ fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Semesters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {visibleSemesters.map(sem => {
           const semPoints = sem.courses.reduce((acc, c) => acc + (GRADE_POINTS[c.grade] || 0) * c.credit, 0);
           const semCredits = sem.courses.reduce((acc, c) => acc + c.credit, 0);
           const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : "0.00";

           return (
             <div key={sem.id}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px', flexWrap: 'wrap', gap: '10px' }}>
                 <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{sem.name}</h2>
                 <div style={{ textAlign: 'right' }}>
                   <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>Semester GPA</span>
                   <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{semGPA}</span>
                 </div>
               </div>
               
               <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '400px' }}>
                   <thead>
                     <tr style={{ backgroundColor: '#f8f9fa' }}>
                       <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Code</th>
                       <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Course Title</th>
                       <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '60px' }}>Unit</th>
                       <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '60px' }}>Grade</th>
                       <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', width: '60px' }}>Point</th>
                     </tr>
                   </thead>
                   <tbody>
                     {sem.courses.map(course => (
                       <tr key={course.id}>
                         <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{course.code}</td>
                         <td style={{ border: '1px solid #ddd', padding: '8px' }}>{course.title || '-'}</td>
                         <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{course.credit}</td>
                         <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{course.grade}</td>
                         <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{(GRADE_POINTS[course.grade] || 0) * course.credit}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           );
        })}
      </div>

      {/* Footer */}
      {visibleSemesters.length > 0 && (
        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Cumulative Grade Point Average</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '32px', fontWeight: '900' }}>{cgpa}</span>
              <span style={{ fontSize: '14px', color: '#666' }}>/ 5.00</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px', color: degreeClass.class.includes('First') ? '#059669' : '#000' }}>
              {degreeClass.class}
            </p>
          </div>
          <div style={{ fontSize: '10px', color: '#999', textAlign: 'right' }}>
            Generated by GradeLogic • Secure Document
          </div>
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function TranscriptView() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userEmail = user?.email || 'unknown';
  const userName = user?.displayName || 'Student';
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemIds, setSelectedSemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userEmail) return;
    const userDocRef = doc(db, 'users', userEmail);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().semesters || [];
        setSemesters(data);
        setSelectedSemIds(data.map((s: Semester) => s.id));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userEmail]);

  const toggleSemester = (id: string) => {
    setSelectedSemIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedSemIds(semesters.map(s => s.id));
  const deselectAll = () => setSelectedSemIds([]);

  const visibleSemesters = semesters.filter(s => selectedSemIds.includes(s.id));
  const { cgpa } = calculateOverallCGPA(visibleSemesters);
  const degreeClass = getDegreeClass(parseFloat(cgpa));

  const generatePDF = async () => {
    if (!printRef.current || visibleSemesters.length === 0) {
      alert("Could not find document to print.");
      return;
    }
    
    // 1. Show Overlay Loading (Do not unmount the page!)
    setIsGenerating(true);
    
    // Wait for the overlay to render and DOM to settle
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2, 
        backgroundColor: '#ffffff', 
        useCORS: true, 
        logging: false,
        windowWidth: printRef.current.scrollWidth,
        windowHeight: printRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`GradeLogic_Transcript_${userName}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF. Please check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!printRef.current || visibleSemesters.length === 0) {
      alert("Could not find document to print.");
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        windowWidth: printRef.current.scrollWidth,
        windowHeight: printRef.current.scrollHeight
      });
      const link = document.createElement('a');
      link.download = `GradeLogic_Transcript_${userName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Image Generation failed:", err);
      alert("Failed to generate Image.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Only show full loading screen for initial data fetch
  if (loading) {
    return <LoadingScreen message="Loading Transcript..." />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-32 relative">
      
      {/* OVERLAY LOADING SCREEN (Fixes the bug!) */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-bold tracking-wide">Generating Document...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we prepare your file.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-lg font-bold text-white">Transcript Generator</h2>
        </div>

        {/* Selection Panel */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Select Semesters</h3>
            <div className="flex gap-3 text-xs">
              <button onClick={selectAll} className="text-blue-400 hover:text-blue-300 font-medium">All</button>
              <button onClick={deselectAll} className="text-red-400 hover:text-red-300 font-medium">None</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {semesters.map(sem => {
              const isSelected = selectedSemIds.includes(sem.id);
              return (
                <div 
                  key={sem.id} 
                  onClick={() => toggleSemester(sem.id)}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all select-none ${
                    isSelected ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-sm font-medium truncate">{sem.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIVE PREVIEW SECTION */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Live Preview</h3>
          <div className="bg-gray-200 p-4 md:p-8 rounded-2xl shadow-inner border border-white/10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="bg-white shadow-2xl mx-auto w-full max-w-[800px] min-h-[400px]">
              <TranscriptDocument 
                userName={userName} 
                visibleSemesters={visibleSemesters} 
                cgpa={cgpa} 
                degreeClass={degreeClass} 
              />
            </div>
          </div>
        </div>

        {/* Action Buttons (Sticky Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a]/90 backdrop-blur-md border-t border-white/10 flex gap-3 z-50 md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
          <button 
            onClick={generateImage} 
            disabled={isGenerating || visibleSemesters.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
          >
            <Image className="w-5 h-5" /> <span className="text-sm">Save Image</span>
          </button>
          <button 
            onClick={generatePDF} 
            disabled={isGenerating || visibleSemesters.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
          >
            <FileText className="w-5 h-5" /> <span className="text-sm">Save PDF</span>
          </button>
        </div>

        {/* Positioned safely off-screen without breaking html2canvas */}
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px', overflow: 'hidden' }}>
          <div ref={printRef}>
            <TranscriptDocument 
              userName={userName} 
              visibleSemesters={visibleSemesters} 
              cgpa={cgpa} 
              degreeClass={degreeClass} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}