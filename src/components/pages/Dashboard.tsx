import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, LogOut, ChevronDown, ChevronUp, GraduationCap, BookOpen, Loader2 } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { Semester, Course } from '../../lib/cgpaEngine';
import { GRADE_POINTS, calculateOverallCGPA, getDegreeClass } from '../../lib/cgpaEngine';
import ConfirmModal from '../common/ConfirmModal';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // We get the user directly from Firebase Auth (more secure than router state)
  const user = auth.currentUser;
  const userEmail = user?.email || 'unknown';
  const userName = user?.displayName?.split(' ')[0] || 'Student';

  // --- STATE ---
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);
  const [newSemName, setNewSemName] = useState('');
  const [isAddingSem, setIsAddingSem] = useState(false);
  
  // Modal States
  const [deleteSemesterId, setDeleteSemesterId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<{ semId: string; courseId: string } | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  // Course Form States
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCredit, setCourseCredit] = useState('');
  const [courseGrade, setCourseGrade] = useState('');

  // --- 1. LOAD DATA FROM CLOUD ON STARTUP ---
  useEffect(() => {
    if (!userEmail) return;

    // "Listen" to the user's document in the 'users' collection
    const userDocRef = doc(db, 'users', userEmail);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        // Data exists in cloud, load it
        setSemesters(docSnap.data().semesters || []);
      } else {
        // First time user, start empty
        setSemesters([]);
      }
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [userEmail]);

  // --- 2. SAVE DATA TO CLOUD HELPER ---
  const saveToCloud = async (newSemesters: Semester[]) => {
    if (!userEmail) return;
    try {
      const userDocRef = doc(db, 'users', userEmail);
      // Save the array to the 'semesters' field
      await setDoc(userDocRef, { semesters: newSemesters, email: userEmail }, { merge: true });
    } catch (error) {
      console.error("Error saving to cloud:", error);
      alert("Failed to save to cloud. Check console.");
    }
  };

  // --- CALCULATIONS ---
  const { cgpa, totalCredits } = calculateOverallCGPA(semesters);
  const degreeClass = getDegreeClass(parseFloat(cgpa));

  // --- HANDLERS ---
  const handleAddSemester = async () => {
    if (newSemName.trim()) {
      const newSem: Semester = { id: Date.now().toString(), name: newSemName.trim(), courses: [] };
      const updated = [...semesters, newSem];
      
      setSemesters(updated); // Update UI immediately
      await saveToCloud(updated); // Save to Cloud
      
      setNewSemName('');
      setIsAddingSem(false);
      setActiveSemesterId(newSem.id);
    }
  };

  const confirmDeleteSemester = async () => {
    if (deleteSemesterId) {
      const updated = semesters.filter(s => s.id !== deleteSemesterId);
      setSemesters(updated);
      await saveToCloud(updated);
      setDeleteSemesterId(null);
    }
  };

  const handleAddCourse = async (semId: string) => {
    if (courseCode && courseCredit && courseGrade) {
      const newCourse: Course = {
        id: Date.now().toString(),
        code: courseCode.toUpperCase(),
        title: courseTitle,
        credit: parseInt(courseCredit),
        grade: courseGrade.toUpperCase(),
      };
      
      const updated = semesters.map(sem => 
        sem.id === semId ? { ...sem, courses: [...sem.courses, newCourse] } : sem
      );
      
      setSemesters(updated);
      await saveToCloud(updated);
      
      setCourseCode(''); setCourseTitle(''); setCourseCredit(''); setCourseGrade('');
    }
  };

  const confirmDeleteCourse = async () => {
    if (courseToDelete) {
      const updated = semesters.map(sem => 
        sem.id === courseToDelete.semId 
          ? { ...sem, courses: sem.courses.filter(c => c.id !== courseToDelete.courseId) } 
          : sem
      );
      setSemesters(updated);
      await saveToCloud(updated);
      setCourseToDelete(null);
    }
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-main">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Syncing with Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-main p-4 md:p-8 relative z-10">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-row justify-between items-center w-full mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">
              Hello, <span className="text-primary">{userName}</span> 
            </h1>
            <p className="text-text-muted text-xs md:text-sm mt-0.5 truncate">
              Signed in as {userEmail} • <span className="text-success">Cloud Synced</span>
            </p>
          </div>
          <button 
            onClick={() => setShowExitModal(true)} 
            className="ml-4 text-text-muted hover:text-danger flex items-center gap-2 text-sm bg-surface/50 px-3 py-2 rounded-lg border border-border/50 hover:border-danger/50 transition-all whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Exit</span>
          </button>
        </header>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Overall CGPA</p>
            <div className="flex items-end gap-3">
              <h2 className={`text-5xl font-bold ${degreeClass.color}`}>{cgpa}</h2>
              <span className="text-text-muted mb-2 text-sm">/ 5.00</span>
            </div>
            <p className={`text-sm font-semibold mt-2 ${degreeClass.color}`}>{degreeClass.class}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-lg">
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Total Credits Earned</p>
            <h2 className="text-4xl font-bold text-text-main">{totalCredits}</h2>
            <p className="text-text-muted text-xs mt-2">Across {semesters.length} Semesters</p>
          </motion.div>
        </div>

        {/* Semesters Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Academic Timeline
            </h2>
            <button 
              onClick={() => setIsAddingSem(!isAddingSem)}
              className="flex-1 md:flex-none bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Semester
            </button>
          </div>

          {/* Add Semester Input */}
          <AnimatePresence>
            {isAddingSem && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-surface border border-primary/30 p-4 rounded-xl flex flex-col md:flex-row gap-3 mb-4 shadow-lg">
                  <input 
                    type="text" value={newSemName} onChange={(e) => setNewSemName(e.target.value)} 
                    placeholder="e.g. 100 Level First Semester"
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus
                  />
                  <button onClick={handleAddSemester} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover">Save to Cloud</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Semester List */}
          {semesters.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border/30 rounded-2xl text-text-muted bg-surface/30">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No semesters added yet. Click "Add Semester" to begin.</p>
            </div>
          ) : (
            semesters.map((sem) => (
              <SemesterCard 
                key={sem.id} semester={sem} isOpen={activeSemesterId === sem.id}
                onToggle={() => setActiveSemesterId(activeSemesterId === sem.id ? null : sem.id)}
                onDeleteSemester={() => setDeleteSemesterId(sem.id)}
                onDeleteCourse={(courseId) => setCourseToDelete({ semId: sem.id, courseId })}
                onAddCourse={handleAddCourse}
                courseCode={courseCode} setCourseCode={setCourseCode}
                courseTitle={courseTitle} setCourseTitle={setCourseTitle}
                courseCredit={courseCredit} setCourseCredit={setCourseCredit}
                courseGrade={courseGrade} setCourseGrade={setCourseGrade}
              />
            ))
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <ConfirmModal 
        isOpen={!!deleteSemesterId}
        title="Delete Semester?"
        message="This will permanently remove this semester from the cloud."
        onConfirm={confirmDeleteSemester}
        onCancel={() => setDeleteSemesterId(null)}
        variant="danger"
        icon={<Trash2 className="w-6 h-6" />}
        confirmText="Delete"
      />

      <ConfirmModal 
        isOpen={!!courseToDelete}
        title="Delete Course?"
        message="Are you sure you want to remove this course?"
        onConfirm={confirmDeleteCourse}
        onCancel={() => setCourseToDelete(null)}
        variant="danger"
        icon={<Trash2 className="w-6 h-6" />}
        confirmText="Delete"
      />
      
      <ConfirmModal 
        isOpen={showExitModal}
        title="Exit Application?"
        message="You will be returned to the login screen."
        onConfirm={() => { auth.signOut(); navigate('/'); }}
        onCancel={() => setShowExitModal(false)}
        variant="primary"
        icon={<LogOut className="w-6 h-6" />}
        confirmText="Exit"
      />
    </div>
  );
}

// --- SUB-COMPONENT: Semester Card (Same as before) ---
interface SemesterCardProps {
  semester: Semester; isOpen: boolean; onToggle: () => void; onDeleteSemester: () => void;
  onDeleteCourse: (courseId: string) => void; onAddCourse: (semId: string) => void;
  courseCode: string; setCourseCode: (v: string) => void; courseTitle: string; setCourseTitle: (v: string) => void;
  courseCredit: string; setCourseCredit: (v: string) => void; courseGrade: string; setCourseGrade: (v: string) => void;
}

function SemesterCard({ semester, isOpen, onToggle, onDeleteSemester, onDeleteCourse, onAddCourse, courseCode, setCourseCode, courseTitle, setCourseTitle, courseCredit, setCourseCredit, courseGrade, setCourseGrade }: SemesterCardProps) {
  const semPoints = semester.courses.reduce((acc, c) => acc + (GRADE_POINTS[c.grade] || 0) * c.credit, 0);
  const semCredits = semester.courses.reduce((acc, c) => acc + c.credit, 0);
  const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : "0.00";

  const handleAdd = (e: React.FormEvent) => { e.preventDefault(); onAddCourse(semester.id); };

  return (
    <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border overflow-hidden shadow-lg">
      <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-surface-hover transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-lg text-text-main">{semester.name}</h3>
            <p className="text-xs text-text-muted">{semester.courses.length} Courses • {semCredits} Units</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Semester GPA</p>
            <p className="text-xl font-bold text-primary">{semGPA}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDeleteSemester(); }} className="text-text-muted hover:text-danger p-2 hover:bg-danger/10 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-border bg-background/30">
            <div className="p-5 space-y-4">
              <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-12 gap-3 bg-surface p-4 rounded-xl border border-border">
                <input type="text" placeholder="Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="col-span-2 md:col-span-3 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                <input type="text" placeholder="Title (Optional)" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="col-span-2 md:col-span-4 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="number" placeholder="Units" value={courseCredit} onChange={e => setCourseCredit(e.target.value)} className="col-span-1 md:col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required min="1" />
                <select value={courseGrade} onChange={e => setCourseGrade(e.target.value)} className="col-span-1 md:col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Grade</option>
                  {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <button type="submit" className="col-span-2 md:col-span-1 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-2">
                {semester.courses.length === 0 ? (
                  <p className="text-center text-text-muted text-sm py-4">No courses in this semester yet.</p>
                ) : (
                  semester.courses.map(course => (
                    <div key={course.id} className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border/50 group">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-8 h-8 flex items-center justify-center rounded text-sm
                          ${course.grade === 'A' ? 'bg-success/20 text-success' : course.grade === 'F' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'}`}>
                          {course.grade}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-text-main">{course.code}</p>
                          <p className="text-xs text-text-muted">{course.title || 'Untitled'} • {course.credit} Units</p>
                        </div>
                      </div>
                      <button onClick={() => onDeleteCourse(course.id)} className="text-text-muted hover:text-danger opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}