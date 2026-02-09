import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentByParentUid, getWeeklyUpdates, getSyllabus } from '../../lib/services';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import {
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    BookOpen,
    Calendar,
    MessageSquare,
    Target,
    Zap,
    Loader2
} from 'lucide-react';

const ParentDashboard = () => {
    const { user, userData } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [results, setResults] = useState([]);
    const [syllabus, setSyllabus] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        overallProgress: 0,
        weakAreas: [],
        upcomingTests: []
    });

    useEffect(() => {
        if (userData?.uid) {
            loadMyChildren();
        }
    }, [userData]);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentData(selectedStudent.id);
        }
    }, [selectedStudent]);

    const loadMyChildren = async () => {
        const kids = await getStudentByParentUid(userData.uid);
        setStudents(kids);
        if (kids.length > 0) setSelectedStudent(kids[0]);
    };

    const loadStudentData = async (studentId) => {
        setLoading(true);
        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            // 1. Fetch Sync
            const [updatesSnap, resultsSnap, syllabusList] = await Promise.all([
                getDocs(query(collection(db, 'weeklyUpdates'), where("classId", "==", student.classId), orderBy("createdAt", "desc"), limit(10))),
                getDocs(query(collection(db, 'results'), where("studentId", "==", studentId))),
                getSyllabus(student.schoolId, student.classId)
            ]);

            const updatesData = updatesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setUpdates(updatesData);
            setSyllabus(syllabusList);

            // 2. Process Results & Weak Topics
            const processedResults = await Promise.all(resultsSnap.docs.map(async (resDoc) => {
                const res = resDoc.data();
                const { getDoc, doc } = await import('firebase/firestore');
                const testDoc = await getDoc(doc(db, 'tests', res.testId));
                return { ...res, id: resDoc.id, test: testDoc.exists() ? testDoc.data() : {} };
            }));
            setResults(processedResults);

            // 3. Calculate Overall Progress
            // Simple logic: total chapters in syllabus vs unique chapters completed in updates
            const totalChapters = syllabusList.reduce((acc, curr) => acc + curr.chapters.length, 0);
            const completedChapters = new Set(updatesData.map(u => u.chapterCompleted)).size;
            const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

            // 4. Extract All Weak Topics
            const weakSet = new Set();
            processedResults.forEach(r => r.weakTopics?.forEach(topic => weakSet.add(topic)));

            setStats({
                overallProgress: progress,
                weakAreas: Array.from(weakSet).slice(0, 5),
                upcomingTests: [] // Can be fetched from tests collection where date > today
            });

        } catch (error) {
            console.error("Parent Dashboard Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && students.length > 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-primary-50 p-6 rounded-full text-primary-600 mb-6">
                    <Users className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to AcademiVis</h2>
                <p className="text-gray-500 mt-2 max-w-sm">No students are linked to your account yet. Please contact the school office to link your account: <b className="text-primary-600">{user?.email}</b></p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
            {/* Student Switcher & Profile */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/20">
                        {selectedStudent?.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedStudent?.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {students.length > 1 ? (
                                <select
                                    className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border-none focus:ring-0 cursor-pointer"
                                    value={selectedStudent?.id}
                                    onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value))}
                                >
                                    {students.map(s => <option key={s.id} value={s.id}>Switch Student: {s.name}</option>)}
                                </select>
                            ) : (
                                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Academic Status Overview</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-50">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                        <Calendar className="w-4 h-4 text-primary-500" /> Exams
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all">
                        <MessageSquare className="w-4 h-4" /> Message Teacher
                    </button>
                </div>
            </div>

            {/* Top Grid - Progress and Health */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Progress Ring Card */}
                <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-32 h-32 text-primary-600" />
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Syllabus Completion</h3>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-50" />
                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-primary-600 transition-all duration-1000" strokeDasharray={502.4} strokeDashoffset={502.4 - (502.4 * stats.overallProgress) / 100} />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-black text-gray-900">{stats.overallProgress}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Full Term</span>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-gray-500 font-medium max-w-[200px]">
                        Targeting 100% completion by <span className="text-primary-600 font-bold">March 2026</span>
                    </p>
                </div>

                {/* Subject Breakdown & Weak Areas */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-red-500" /> Understanding Gaps
                            </h3>
                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase tracking-wider">Priority Attention</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {stats.weakAreas.length > 0 ? stats.weakAreas.map((area, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-red-50/50 rounded-2xl border border-red-50 group hover:border-red-200 transition-all">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-red-900">{area}</span>
                                </div>
                            )) : (
                                <div className="w-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-50 rounded-2xl">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                                    <p className="text-sm">No significant understanding gaps identified.</p>
                                </div>
                            )}
                        </div>

                        <p className="mt-6 text-xs text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                            <b>Note to Parents:</b> These topics are identified based on recent classroom assessments. Focus on these during revision.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-primary-600 p-6 rounded-3xl text-white shadow-lg shadow-primary-600/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-white/10 rounded-xl"><Calendar className="w-5 h-5" /></div>
                                <span className="text-[10px] font-bold uppercase border border-white/20 px-2 py-0.5 rounded">Upcoming</span>
                            </div>
                            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Next Assessment</h4>
                            <p className="text-xl font-bold">Mathematics - Calculus</p>
                            <p className="text-xs mt-4 font-medium opacity-70">Scheduled for Feb 25, 2026</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-lg shadow-gray-900/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-white/10 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                                <span className="text-[10px] font-bold uppercase border border-white/20 px-2 py-0.5 rounded">Curriculum</span>
                            </div>
                            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Active Chapter</h4>
                            <p className="text-xl font-bold">Physics: Quantum Mechanics</p>
                            <p className="text-xs mt-4 font-medium opacity-70">7 of 12 sub-topics completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline View - Teacher Updates */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                        Classroom Feed & Teacher Notes
                    </h3>
                    <button className="text-sm font-bold text-primary-600 hover:underline px-4 py-2 bg-primary-50 rounded-xl transition-all">View All History</button>
                </div>

                <div className="p-8">
                    <div className="space-y-10 relative">
                        {/* Timeline Connector Line */}
                        <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-gray-100 md:left-[24px]" />

                        {updates.length > 0 ? updates.map((update, idx) => {
                            const studentStatus = update.studentStatuses?.[selectedStudent?.id];
                            return (
                                <div key={update.id} className="relative pl-12 md:pl-16 group">
                                    {/* Timeline Node */}
                                    <div className={`absolute left-0 top-1 w-10 md:w-12 h-10 md:h-12 rounded-2xl flex items-center justify-center z-10 border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <MessageSquare className="w-4 md:w-5 h-4 md:h-5" />
                                    </div>

                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-transparent hover:border-primary-100 hover:bg-white transition-all">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">{update.subject} Update</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Completed: {update.chapterCompleted}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {studentStatus && (
                                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm ${studentStatus === 'Needs Attention' ? 'bg-red-500 text-white' :
                                                            studentStatus === 'Good' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                                        }`}>{studentStatus}</span>
                                                )}
                                                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-full uppercase">
                                                    {update.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed font-medium italic">"{update.note}"</p>

                                        <div className="mt-6 flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Homework: {update.homeworkPercent}%</div>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <div>Teacher: {update.teacherId.substring(0, 8)}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-50 rounded-[32px]">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No updates posted yet for this class.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
