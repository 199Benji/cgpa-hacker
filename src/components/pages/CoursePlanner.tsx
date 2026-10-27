import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Scale, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import LoadingScreen from '../common/LoadingScreen';

interface PlannedCourse {
  id: string;
  code: string;
  title: string;
  units: number;
}

export default function CoursePlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState<PlannedCourse[]>([]);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [units, setUnits] = useState('');

  // Simulate a quick load for the UI
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate Total Units
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);

  // Determine Load Status
  const getLoadStatus = () => {
    if (totalUnits === 0) return { label: 'No Courses Added', color: 'text-gray-400', bg: 'bg-gray-500', width: '0%', icon: null };
    if (totalUnits <= 15) return { label: 'Light Load', color: 'text-emerald-400', bg: 'bg-emerald-500', width: '30%', icon: <CheckCircle className="w-5 h-5" /> };
    if (totalUnits <= 21) return { label: 'Moderate Load (Recommended)', color: 'text-blue-400', bg: 'bg-blue-500', width: '60%', icon: <CheckCircle className="w-5 h-5" /> };
    if (totalUnits <= 24) return { label: 'Heavy Load', color: 'text-orange-400', bg: 'bg-orange-500', width: '85%', icon: <AlertTriangle className="w-5 h-5" /> };
    return { label: 'Extreme Burnout Risk!', color: 'text-red-500', bg: 'bg-red-600', width: '100%', icon: <Zap className="w-5 h-5" /> };
  };

  const status = getLoadStatus();

  const addCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && units) {
      const newCourse: PlannedCourse = {
        id: Date.now().toString(),
        code: code.toUpperCase(),
        title: title,
        units: parseInt(units)
      };
      setCourses([...courses, newCourse]);
      setCode(''); setTitle(''); setUnits('');
    }
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  if (loading) return <LoadingScreen message="Loading Planner..." />;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-24">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Course Load Planner
          </h2>
        </div>

        {/* THE SMART LOAD METER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface/80 backdrop-blur-md border border-border p-6 rounded-2xl mb-8 shadow-xl"
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Total Planned Units</p>
              <h3 className="text-4xl font-black text-white">{totalUnits} <span className="text-lg text-gray-500 font-normal">Units</span></h3>
            </div>
            <div className={`flex items-center gap-2 font-bold ${status.color}`}>
              {status.icon}
              <span className="text-sm md:text-base">{status.label}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: status.width }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${status.bg} rounded-full`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
            <span>0</span>
            <span>15 (Light)</span>
            <span>21 (Moderate)</span>
            <span>24 (Heavy)</span>
            <span>30+</span>
          </div>
        </motion.div>

        {/* Add Course Form */}
        <motion.form 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          onSubmit={addCourse} 
          className="grid grid-cols-12 gap-3 bg-surface p-4 rounded-xl border border-border mb-6"
        >
          <input 
            type="text" placeholder="Code (e.g. MTH101)" value={code} onChange={e => setCode(e.target.value)} 
            className="col-span-12 md:col-span-3 bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required 
          />
          <input 
            type="text" placeholder="Course Title" value={title} onChange={e => setTitle(e.target.value)} 
            className="col-span-12 md:col-span-6 bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
          />
          <input 
            type="number" placeholder="Units" value={units} onChange={e => setUnits(e.target.value)} 
            className="col-span-6 md:col-span-2 bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required min="1" max="10"
          />
          <button type="submit" className="col-span-6 md:col-span-1 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </motion.form>

        {/* Planned Courses List */}
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border/30 rounded-2xl text-gray-500">
              <Scale className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Add courses above to plan your next semester.</p>
            </div>
          ) : (
            <AnimatePresence>
              {courses.map(course => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border/50 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary font-bold w-10 h-10 flex items-center justify-center rounded-lg text-sm">
                      {course.units}
                    </div>
                    <div>
                      <p className="font-bold text-white">{course.code}</p>
                      <p className="text-xs text-gray-400">{course.title || 'Untitled Course'}</p>
                    </div>
                  </div>
                  <button onClick={() => removeCourse(course.id)} className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}