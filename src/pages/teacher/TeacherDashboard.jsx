import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    ClipboardList,
    Users,
    Activity,
    Loader2,
    Zap,
    Star,
    Target,
    MessageSquare,
    ArrowRight,
    Layers,
    Clock,
    ShieldCheck,
    Award,
    ChevronRight,
    Sparkles,
    TrendingUp,
    AlertCircle,
    Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import {
    getStudents,
    getSchool,
    getSyllabus,
} from '../../lib/services';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const { userData, schoolId } = useAuth();
    const { activeClassId, activeClass, myClasses: contextClasses } = useClass();
    const navigate = useNavigate();

    // Core Stats
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        pendingUpdates: 0,
        pendingTests: 0
    });

    // UI State
    const [recentActivity, setRecentActivity] = useState([]);
    const [schoolName, setSchoolName] = useState('');
    const [loading, setLoading] = useState(true);
    const [classProgress, setClassProgress] = useState({});

    useEffect(() => {
        if (schoolId && userData?.uid) {
            loadDashboardData();
        }
    }, [schoolId, userData?.uid, activeClassId, contextClasses]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const school = await getSchool(schoolId);
            setSchoolName(school?.name || 'Your School');

            // Determine which classes to show on dashboard stats
            const workingClasses = activeClassId
                ? contextClasses.filter(c => c.id === activeClassId)
                : contextClasses;

            if (workingClasses.length === 0) {
                setStats({ totalClasses: 0, totalStudents: 0, pendingUpdates: 0, pendingTests: 0 });
                setRecentActivity([]);
                setLoading(false);
                return;
            }

            const classDataPromises = workingClasses.map(async (cls) => {
                const [students, syllabusList, weeklyUpdates, tests] = await Promise.all([
                    getStudents(schoolId, cls.id),
                    getSyllabus(schoolId, cls.id),
                    getDocs(query(collection(db, 'weeklyUpdates'), where('schoolId', '==', schoolId), where('classId', '==', cls.id), limit(5))),
                    getDocs(query(collection(db, 'tests'), where('schoolId', '==', schoolId), where('classId', '==', cls.id), limit(5)))
                ]);

                const totalChapters = syllabusList.reduce((acc, curr) => acc + (curr.chapters?.length || 0), 0);
                const uniqueChaptersCompleted = new Set(weeklyUpdates.docs.map(d => d.data().chapterCompleted)).size;
                const progress = totalChapters > 0 ? Math.round((uniqueChaptersCompleted / totalChapters) * 100) : 0;

                return { classId: cls.id, students, progress, testsSnap: tests };
            });

            const classResults = await Promise.all(classDataPromises);

            let totalStudentsCount = 0;
            let progressMap = {};
            let allTests = [];
            classResults.forEach(res => {
                totalStudentsCount += res.students.length;
                progressMap[res.classId] = res.progress;
                allTests.push(...res.testsSnap.docs.map(d => ({ ...d.data(), id: d.id })));
            });

            setStats({
                totalClasses: contextClasses.length,
                totalStudents: totalStudentsCount,
                pendingUpdates: workingClasses.length,
                pendingTests: allTests.length
            });
            setClassProgress(progressMap);

            // Fetch Recent Activity (limit to working classes for scope)
            const q = query(
                collection(db, 'weeklyUpdates'),
                where('schoolId', '==', schoolId),
                where('classId', 'in', workingClasses.map(c => c.id).slice(0, 10)),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const activitySnap = await getDocs(q);
            setRecentActivity(activitySnap.docs.map(doc => ({
                id: doc.id,
                title: `Weekly Update: ${doc.data().subject}`,
                timestamp: doc.data().createdAt?.toDate() || new Date(),
                type: 'update'
            })));

        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Collating Academic Intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Massive Hero Section */}
            <div className="relative overflow-hidden bg-white p-12 md:p-20 rounded-[60px] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="px-5 py-2 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-primary-400" /> {schoolName}
                        </div>
                        <span className="text-xs font-bold text-gray-400 italic">“Supporting, Simplifying, and Amplifying your work.”</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4 italic">Hello, Teacher {userData?.name}</h1>

                    {contextClasses.length === 0 ? (
                        <div className="flex items-center gap-4 p-6 bg-red-50 border border-red-200 rounded-[32px] max-w-2xl mb-8">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                            <div>
                                <p className="text-lg font-black text-red-900 uppercase tracking-tight">Access Restricted: No Classes Assigned</p>
                                <p className="text-sm font-medium text-red-700">You are not currently linked to any classes. Please contact your School Administrator to assign your teaching workload.</p>
                            </div>
                        </div>
                    ) : !activeClassId && (
                        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-3xl max-w-fit mb-8 animate-pulse">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                            <div>
                                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Focus Context Required</p>
                                <p className="text-xs font-medium text-amber-700">Select a class in the top bar to see specific performance metrics.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mt-10">
                        <QuickStat icon={Users} label={activeClassId ? "Students in Class" : "Total Students"} value={stats.totalStudents} color="indigo" />
                        <QuickStat icon={Layers} label="Assigned Classes" value={stats.totalClasses} color="primary" />
                        <QuickStat icon={Zap} label="Recent Events" value={stats.pendingTests} color="orange" />
                        <QuickStat icon={Award} label="Class Health" value={activeClassId ? "Good" : "N/A"} color="green" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Tactical Focus */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* WIDGET 1: Daily Command */}
                    <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-12 group hover:ring-8 ring-primary-50 transition-all cursor-pointer overflow-hidden relative" onClick={() => navigate('/teacher/hub')}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 group-hover:text-primary-600 transition-colors">
                                <Sparkles className="w-6 h-6 text-primary-600" /> Co-Teacher Hub
                            </h3>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                            Generate lesson plans, question banks, or parent notes for <b>{activeClass?.name || 'any class'}</b> using academic AI.
                        </p>
                        <div className="mt-8 text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
                            Enter AI Hub <ChevronRight className="w-3 h-3" />
                        </div>
                    </div>

                    {/* WIDGET 2: Class Intelligence */}
                    <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-12 group hover:ring-8 ring-indigo-50 transition-all cursor-pointer" onClick={() => navigate('/teacher/syllabus')}>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 group-hover:text-indigo-600 transition-colors">
                                <Activity className="w-6 h-6 text-indigo-600" /> Syllabus Tracker
                            </h3>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex items-end gap-2 h-24 mb-6">
                            {[45, 78, 62, 85, 91, 55].map((v, i) => (
                                <div key={i} className="flex-1 bg-indigo-50 group-hover:bg-indigo-500 rounded-lg transition-all" style={{ height: `${v}%` }}></div>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-widest">Completion Index: <span className="text-indigo-600">{activeClassId ? `${classProgress[activeClassId] || 0}%` : 'View All'}</span></p>
                    </div>

                    {/* WIDGET 3: Human Spotlight */}
                    <div className="bg-gray-900 rounded-[44px] p-12 text-white group hover:ring-8 ring-gray-100 transition-all cursor-pointer" onClick={() => navigate('/teacher/students')}>
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary-400" /> Student 360
                            </h3>
                            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="space-y-6">
                            <p className="text-xs text-gray-400 font-medium leading-relaxed">Active student rosters for your context.</p>
                            <div className="flex flex-col gap-3">
                                {contextClasses.slice(0, 3).map(c => (
                                    <div key={c.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors">
                                        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-black text-[10px]">{c.grade || c.name.replace('Class ', '')}</div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold truncate">Section {c.section}</p>
                                            <p className="text-[9px] text-gray-500 font-medium">{c.subject}</p>
                                        </div>
                                    </div>
                                ))}
                                {contextClasses.length > 3 && (
                                    <p className="text-[10px] text-gray-400 font-bold px-2">+{contextClasses.length - 3} more classes...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Strategic Progress */}
                <div className="lg:col-span-8 space-y-10">
                    {/* SECTION: Syllabus & Assessments Cluster */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-10 group hover:border-primary-200 transition-all cursor-pointer" onClick={() => navigate('/teacher/syllabus')}>
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Curriculum Map
                                </h4>
                                <Target className="w-5 h-5 text-primary-500" />
                            </div>
                            <div className="space-y-8">
                                {activeClassId ? (
                                    <div>
                                        <div className="flex justify-between mb-3 px-1">
                                            <p className="text-sm font-black text-gray-800 tracking-tight">{activeClass?.name}</p>
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{classProgress[activeClassId] || 0}% Completion</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-gradient-to-r from-primary-600 to-indigo-600" style={{ width: `${classProgress[activeClassId] || 0}%` }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Multi-class overview not selected</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-10 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => navigate('/teacher/tests')}>
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> Assessment Status
                                </h4>
                                <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100 flex items-center justify-center min-h-[140px]">
                                <p className="text-xs font-black text-indigo-700 uppercase tracking-widest text-center leading-relaxed">
                                    {activeClassId ? "Ready to publish scores" : "Select Class to log scores"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Update Promo */}
                    <div className="bg-indigo-600 rounded-[54px] p-14 text-white relative overflow-hidden group shadow-2xl flex flex-col md:flex-row items-center gap-12 cursor-pointer" onClick={() => navigate('/teacher/notes')}>
                        <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-all duration-1000"></div>
                        <div className="w-24 h-24 bg-white/10 rounded-[40px] flex items-center justify-center border border-white/20 backdrop-blur-xl flex-shrink-0">
                            <MessageSquare className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left relative z-10">
                            <h4 className="text-3xl font-black tracking-tight mb-3">Parent Visibility</h4>
                            <p className="text-indigo-100 font-medium leading-relaxed max-w-md">
                                Keep families delighted. Dispatch a weekly progress report for <b>{activeClass?.name || 'Class'}</b> in seconds.
                            </p>
                        </div>
                        <button className="px-10 py-6 bg-white text-indigo-600 rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-gray-50 transition-all active:scale-95 group/btn flex items-center gap-2">
                            Send Update <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Vertical Sidebar: Operation Log */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-10 h-full">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Award className="w-6 h-6 text-primary-600" /> Activity Proof
                            </h3>
                        </div>
                        <div className="space-y-8">
                            {recentActivity.length > 0 ? recentActivity.map((act) => (
                                <div key={act.id} className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-gray-800 truncate uppercase tracking-tight">{act.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{act.timestamp.toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-20">
                                    <Clock className="w-10 h-10 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed px-4">No recent signals recorded for this context.</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate('/teacher/performance')} className="w-full mt-10 py-5 bg-gray-50 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                            Performance Audit <ChevronRight className="w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickStat = ({ icon: Icon, label, value, color }) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600 border-primary-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        green: 'bg-green-50 text-green-600 border-green-100',
    };
    return (
        <div className="p-6 rounded-[32px] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]} border shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tighter italic">{value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate">{label}</p>
        </div>
    );
};

export default TeacherDashboard;
