import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, AlertCircle, BookOpen } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Semester } from '../../lib/cgpaEngine';
import { GRADE_POINTS, calculateOverallCGPA, getDegreeClass } from '../../lib/cgpaEngine';
import LoadingScreen from '../common/LoadingScreen';

// Recharts Imports
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const COLORS = {
  'A': '#10b981', // Emerald
  'B': '#3b82f6', // Blue
  'C': '#f59e0b', // Amber
  'D': '#f97316', // Orange
  'E': '#ef4444', // Red
  'F': '#dc2626', // Dark Red
};

export default function Analytics() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userEmail = user?.email || 'unknown';
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    const userDocRef = doc(db, 'users', userEmail);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSemesters(docSnap.data().semesters || []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userEmail]);

  // 1. Calculate Grade Distribution for Pie Chart
  const gradeCounts: Record<string, number> = {};
  let totalCourses = 0;

  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      gradeCounts[course.grade] = (gradeCounts[course.grade] || 0) + 1;
      totalCourses++;
    });
  });

  const pieData = Object.keys(gradeCounts).map(grade => ({
    name: `Grade ${grade}`,
    value: gradeCounts[grade],
    color: COLORS[grade as keyof typeof COLORS] || '#94a3b8'
  }));

  // 2. Calculate Semester GPA Trend for Bar Chart
  const trendData = semesters.map(sem => {
    const points = sem.courses.reduce((acc, c) => acc + (GRADE_POINTS[c.grade] || 0) * c.credit, 0);
    const credits = sem.courses.reduce((acc, c) => acc + c.credit, 0);
    return {
      name: sem.name.length > 15 ? sem.name.substring(0, 15) + '...' : sem.name,
      gpa: credits > 0 ? parseFloat((points / credits).toFixed(2)) : 0,
      credits: credits
    };
  });

  // 3. Find Best and Worst Semesters
  let bestSem = { name: 'N/A', gpa: 0 };
  let worstSem = { name: 'N/A', gpa: 5.0 };

  trendData.forEach(sem => {
    if (sem.gpa > bestSem.gpa) bestSem = sem;
    if (sem.gpa < worstSem.gpa && sem.credits > 0) worstSem = sem;
  });

  const { cgpa } = calculateOverallCGPA(semesters);
  const degreeClass = getDegreeClass(parseFloat(cgpa));

  if (loading) return <LoadingScreen message="Crunching the numbers..." />;

  if (totalCourses === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Data Yet</h2>
          <p className="text-gray-400 mb-6">Add some courses to your semesters to see your analytics.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-primary text-white px-6 py-2 rounded-lg">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Academic Analytics
          </h2>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <p className="text-xs text-gray-400 uppercase font-bold">Best Semester</p>
            </div>
            <p className="text-xl font-bold text-white truncate">{bestSem.name}</p>
            <p className="text-2xl font-black text-yellow-500">{bestSem.gpa.toFixed(2)} GPA</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-xs text-gray-400 uppercase font-bold">Needs Improvement</p>
            </div>
            <p className="text-xl font-bold text-white truncate">{worstSem.name}</p>
            <p className="text-2xl font-black text-red-500">{worstSem.gpa.toFixed(2)} GPA</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface/80 backdrop-blur-md p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <p className="text-xs text-gray-400 uppercase font-bold">Total Courses</p>
            </div>
            <p className="text-4xl font-black text-white">{totalCourses}</p>
            <p className="text-sm text-gray-400">Across {semesters.length} Semesters</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Grade Distribution Pie Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface/80 backdrop-blur-md p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-bold text-white mb-6">Grade Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
                </ResponsiveContainer>
            </div>
          </motion.div>

          {/* GPA Trend Bar Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-surface/80 backdrop-blur-md p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-bold text-white mb-6">Semester GPA Trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  />
                  <Bar dataKey="gpa" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Overall CGPA Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 p-6 rounded-2xl text-center">
          <p className="text-sm text-gray-300 uppercase tracking-wider font-semibold mb-2">Current Overall Standing</p>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-5xl font-black ${degreeClass.color}`}>{cgpa}</span>
            <span className="text-xl text-gray-400">/ 5.00</span>
          </div>
          <p className={`text-lg font-bold mt-2 ${degreeClass.color}`}>{degreeClass.class}</p>
        </motion.div>

      </div>
    </div>
  );
}