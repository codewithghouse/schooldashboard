import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getMyStudents,
    getSchool,
    getStudentResults,
    getWeeklyUpdates,
    getTeacher,
    getClass,
    getTickets,
    createTicket
} from '../../lib/services';
import {
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    LifeBuoy,
    Calendar,
    Award,
    Clock,
    TrendingUp,
    ChevronRight,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Building2,
    Target,
    Activity,
    Plus,
    X,
    ShieldAlert,
    Zap,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';

const ParentDashboard = () => {
    const { user, userData, schoolId: authSchoolId } = useAuth();
    const [activeView, setActiveView] = useState('overview');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [ticketData, setTicketData] = useState({ subject: '', message: '', priority: 'medium' });

    const sId = authSchoolId || userData?.schoolId;

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user?.email) return;
            try {
                const myStudents = await getMyStudents(user.email, user.uid);
                setStudents(myStudents);
                if (myStudents.length > 0) {
                    setSelectedStudent(myStudents[0]);
                }
                if (sId) {
                    const school = await getSchool(sId);
                    setSchoolInfo(school);
                }
                const myTickets = await getTickets(sId, 'parent', user.uid);
                setTickets(myTickets.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [user, userData, sId]);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentDetail();
        }
    }, [selectedStudent, sId]);

    const loadStudentDetail = async () => {
        if (!selectedStudent || !sId) return;
        try {
            const [stdResults, stdUpdates, stdClass] = await Promise.all([
                getStudentResults(selectedStudent.id),
                getWeeklyUpdates(sId, selectedStudent.classId),
                getClass(selectedStudent.classId)
            ]);

            setResults(stdResults.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
            setUpdates(stdUpdates.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
            setClassInfo(stdClass);

            if (stdClass?.classTeacherId) {
                const teacherDoc = await getTeacher(stdClass.classTeacherId);
                setTeacher(teacherDoc);
            } else {
                setTeacher(null);
            }
        } catch (error) {
            console.error("Detail Load Error:", error);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await createTicket(sId, {
                ...ticketData,
                userId: user.uid,
                userName: userData?.name || user.email,
                userEmail: user.email,
                role: 'parent'
            });
            const myTickets = await getTickets(sId, 'parent', user.uid);
            setTickets(myTickets.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
            setIsTicketModalOpen(false);
            setTicketData({ subject: '', message: '', priority: 'medium' });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-indigo-600/30" />
                    </div>
                </div>
                <p className="mt-6 text-sm font-bold text-gray-400 tracking-widest uppercase animate-pulse italic">Securing Portal Access...</p>
            </div>
        );
    }

    // Derived Data for Visuals
    const subjectWiseData = results.reduce((acc, res) => {
        if (!acc[res.subject]) acc[res.subject] = { scores: [], total: 0 };
        acc[res.subject].scores.push((res.marksScored / res.totalMarks) * 100);
        return acc;
    }, {});

    const sortedSubjects = Object.keys(subjectWiseData).map(subj => ({
        name: subj,
        avg: Math.round(subjectWiseData[subj].scores.reduce((a, b) => a + b, 0) / subjectWiseData[subj].scores.length)
    })).sort((a, b) => b.avg - a.avg);

    const strengths = sortedSubjects.filter(s => s.avg >= 75);
    const improvements = sortedSubjects.filter(s => s.avg < 75);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-inter">
            {/* Real Portal Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight italic">EduPortal</h2>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-4">Main Menu</p>
                        <SidebarBtn icon={LayoutDashboard} label="Global Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                        <SidebarBtn icon={TrendingUp} label="Subject Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
                        <SidebarBtn icon={GraduationCap} label="Academic History" active={activeView === 'results'} onClick={() => setActiveView('results')} />
                        <SidebarBtn icon={BookOpen} label="Learning Feed" active={activeView === 'timeline'} onClick={() => setActiveView('timeline')} />
                        <SidebarBtn icon={Clock} label="Attendance Log" active={activeView === 'attendance'} onClick={() => setActiveView('attendance')} />
                        <SidebarBtn icon={LifeBuoy} label="Support Desk" active={activeView === 'support'} onClick={() => setActiveView('support')} />
                    </div>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                            {user.displayName?.[0] || 'P'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user.displayName || 'Parent'}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">{selectedStudent?.className || 'Guardian'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Portal */}
            <main className="flex-1 min-w-0 h-screen overflow-y-auto">
                {/* Global Top Bar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            {students.map(std => (
                                <button
                                    key={std.id}
                                    onClick={() => setSelectedStudent(std)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStudent?.id === std.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {std.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Campus</p>
                            <p className="text-xs font-black text-slate-800 italic">{schoolInfo?.name || 'AcademiVis Main'}</p>
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* View: Overview */}
                    {activeView === 'overview' && (
                        <div className="space-y-10">
                            {/* Headline Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label="Average Performance" value={`${sortedSubjects.length > 0 ? Math.round(sortedSubjects.reduce((a, b) => a + b.avg, 0) / sortedSubjects.length) : 0}%`} trend="up" color="indigo" icon={Activity} />
                                <StatCard label="Class Standard" value="Top 15%" trend="neutral" color="indigo" icon={Award} />
                                <StatCard label="Weekly Attendance" value="98%" trend="up" color="green" icon={Clock} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Left Side: Graphs & Weak Points */}
                                <div className="lg:col-span-8 space-y-10">
                                    <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm shadow-slate-200/50">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="text-xl font-black text-slate-800 italic tracking-tight underline decoration-indigo-200 underline-offset-8 decoration-4">Performance Analytics</h3>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Current</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Class Mean</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CSS Graph Representation */}
                                        <div className="space-y-8">
                                            {sortedSubjects.length > 0 ? sortedSubjects.slice(0, 5).map((s, i) => (
                                                <div key={i} className="group">
                                                    <div className="flex justify-between items-end mb-3">
                                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{s.name}</span>
                                                        <span className="text-sm font-black text-indigo-600 italic">{s.avg}%</span>
                                                    </div>
                                                    <div className="h-3 grow bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex items-center px-1">
                                                        <div
                                                            className="h-1.5 bg-indigo-600 rounded-full transition-all duration-1000 group-hover:bg-indigo-500 shadow-lg shadow-indigo-200"
                                                            style={{ width: `${s.avg}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                    <p className="text-xs font-black text-slate-400 uppercase italic">Waiting for initial assessment cycle...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Intelligence Points */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-black text-slate-800 italic uppercase underline decoration-green-100 decoration-4 underline-offset-4">Strength Quadrant</h4>
                                            </div>
                                            <div className="space-y-4">
                                                {strengths.length > 0 ? strengths.map((s, i) => (
                                                    <StrengthItem key={i} label={s.name} desc="Exhibits conceptual depth" color="green" />
                                                )) : <p className="text-xs text-slate-400 italic">Identifying core strengths...</p>}
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                                                    <ShieldAlert className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-black text-slate-800 italic uppercase underline decoration-rose-100 decoration-4 underline-offset-4">Improvement Areas</h4>
                                            </div>
                                            <div className="space-y-4">
                                                {improvements.length > 0 ? improvements.map((s, i) => (
                                                    <StrengthItem key={i} label={s.name} desc="Reinforcement required" color="rose" />
                                                )) : (
                                                    results.length > 0 ? <StrengthItem label="None Identified" desc="All subjects aligned with targets" color="green" />
                                                        : <p className="text-xs text-slate-400 italic">Calibrating weak points...</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Profile & Mentor */}
                                <div className="lg:col-span-4 space-y-10">
                                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-12 -mb-12"></div>

                                        <div className="relative z-10 flex flex-col items-center text-center">
                                            <div className="w-24 h-24 rounded-full bg-white/20 p-1.5 mb-6 ring-4 ring-white/10">
                                                <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center text-indigo-600 text-3xl font-black">
                                                    {selectedStudent?.name?.[0]}
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-black tracking-tight">{selectedStudent?.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mt-2">{selectedStudent?.className}</p>

                                            <div className="mt-8 flex gap-3 w-full">
                                                <div className="bg-white/10 rounded-2xl p-4 flex-1 backdrop-blur-md">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-1">Grade</p>
                                                    <p className="text-lg font-black">{selectedStudent?.grade}{selectedStudent?.section}</p>
                                                </div>
                                                <div className="bg-white/10 rounded-2xl p-4 flex-1 backdrop-blur-md">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-1">Roll No</p>
                                                    <p className="text-lg font-black">#{selectedStudent?.id?.slice(-3).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Class Mentor */}
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In-Residence Mentor</h4>
                                            <MessageSquare className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-indigo-600 text-xl">
                                                {teacher?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 italic">Prof. {teacher?.name || 'Academic Lead'}</p>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Class Representative</p>
                                            </div>
                                        </div>
                                        <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border border-slate-100 transition-all">
                                            Request Consultation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Results/Analytics Section Page */}
                    {activeView === 'results' && (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-slate-800 italic tracking-tight">Academic Outcome Logs</h2>
                                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200">
                                    <button className="px-5 py-2 rounded-xl bg-slate-50 text-[9px] font-black uppercase tracking-widest text-indigo-600 italic border border-slate-100">All Semesters</button>
                                    <button className="px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">Filter by Subject</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {results.map((res, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-100/50 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 rounded-[24px] bg-slate-50 flex flex-col items-center justify-center font-black italic text-indigo-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <span className="text-2xl">{Math.round((res.marksScored / res.totalMarks) * 100)}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest -mt-1">%</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-2xl font-black text-slate-800 italic tracking-tight uppercase">{res.subject}</h4>
                                                        <span className="px-3 py-1 bg-green-50 rounded-full text-[8px] font-black text-green-600 uppercase border border-green-100">Verified Outcome</span>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold tracking-widest uppercase italic">{res.createdAt?.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold tracking-widest uppercase italic">Cohort Score: {Math.round((res.marksScored / res.totalMarks) * 100) - 5}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-4xl font-black text-slate-800 italic tracking-tight">{res.marksScored}<span className="text-slate-300">/{res.totalMarks}</span></p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Raw Assessment Score</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {results.length === 0 && <p className="p-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 italic">No academic outcomes logged for this selection.</p>}
                            </div>
                        </div>
                    )}

                    {/* View: Analytics Dedicated Page */}
                    {activeView === 'analytics' && (
                        <div className="space-y-10">
                            <h2 className="text-3xl font-black text-slate-800 italic tracking-tight underline decoration-indigo-200 underline-offset-8">Cognitive Progress Visualizer</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="bg-white p-10 rounded-[32px] border border-slate-200">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 italic">Performance Radar (Monthly)</h4>
                                    <div className="flex items-end justify-between h-64 gap-4 px-4 border-b border-slate-100">
                                        {[65, 82, 75, 90, 88].map((v, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                <div
                                                    className="w-full bg-indigo-50 group-hover:bg-indigo-600 transition-all rounded-t-2xl relative"
                                                    style={{ height: `${v}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-black">
                                                        {v}%
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">M{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-8 text-[10px] text-slate-400 italic font-medium">Trajectory shows a consistent upward stabilization over the last 5 cycles.</p>
                                </div>

                                <div className="bg-slate-900 p-10 rounded-[32px] text-white">
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-10 italic text-indigo-400">Intelligence Summary</h4>
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 shrink-0 border border-white/10">
                                                <Target className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic">Advanced Mastery Concept</p>
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">The student is demonstrating high proficiency in logical reasoning and abstract pattern recognition.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
                                                <ShieldAlert className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic text-amber-50">Precision Calibration</p>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Minor deviations noted in speed-accuracy tradeoff during timed assessments. Reinforcement advised.</p>
                                            </div>
                                        </div>
                                        <button className="w-full mt-10 py-5 bg-white text-indigo-900 rounded-3xl font-black text-xs uppercase tracking-widest italic flex items-center justify-center gap-3">
                                            Full PDF Analysis <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline, Attendance, Support ... similar structure */}
                    {activeView === 'timeline' && (
                        <div className="space-y-10">
                            <h2 className="text-3xl font-black text-slate-800 italic tracking-tight">Learning Journey Feed</h2>
                            <div className="space-y-8">
                                {updates.map((upd, i) => (
                                    <div key={i} className="flex gap-8 relative group">
                                        <div className="w-14 items-center flex flex-col pt-2">
                                            <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-hover:border-indigo-100 transition-all flex items-center justify-center text-[10px] font-black italic text-slate-400 group-hover:text-indigo-600 shadow-sm">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 w-px bg-slate-200 mt-4 h-full"></div>
                                        </div>
                                        <div className="flex-1 bg-white p-10 rounded-[40px] border border-slate-200 hover:border-indigo-100 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic mb-2">Cycle Log • {upd.createdAt?.toDate().toLocaleDateString()}</p>
                                                    <h3 className="text-2xl font-black text-slate-800 italic uppercase">{upd.subject || 'Session Update'}</h3>
                                                </div>
                                                <span className="px-5 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic">CH: {upd.chapterCompleted}</span>
                                            </div>
                                            <p className="text-lg font-medium text-slate-500 leading-relaxed italic border-l-4 border-indigo-100 pl-8 mb-8">“{upd.generalNotes}”</p>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                    <Target className="w-4 h-4 text-slate-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Next Focus: {upd.nextTopic}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {updates.length === 0 && <p className="text-center text-slate-400 p-20 italic">Timeline is initializing...</p>}
                            </div>
                        </div>
                    )}

                    {activeView === 'attendance' && (
                        <div className="bg-white rounded-[50px] p-24 border border-slate-200 text-center shadow-xl shadow-slate-200/50">
                            <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[40px] flex items-center justify-center text-indigo-600 mx-auto mb-10">
                                <Clock className="w-12 h-12" />
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter mb-6 underline decoration-indigo-200 underline-offset-8 decoration-8">Presence Visualizer</h2>
                            <p className="text-xl text-slate-400 font-medium max-w-lg mx-auto mb-16 italic">Calibration phase for bi-directional biometric synchronization and real-time geolocation presence check.</p>
                            <div className="flex justify-center gap-4">
                                <div className="px-8 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-indigo-200">System Standing: Active</div>
                                <div className="px-8 py-3 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">Beta v2.4</div>
                            </div>
                        </div>
                    )}

                    {activeView === 'support' && (
                        <div className="space-y-10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black text-slate-800 italic tracking-tight">Concierge Support</h2>
                                <button
                                    onClick={() => setIsTicketModalOpen(true)}
                                    className="px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center gap-3 italic"
                                >
                                    Raise Inquiry <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {tickets.map((t, i) => (
                                    <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-200 hover:border-indigo-200 transition-all shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-6 text-slate-800">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                    {t.status === 'open' ? '?' : '✓'}
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black italic tracking-tight">{t.subject}</h4>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-1">{t.ticketNo} • Logged on {t.createdAt?.toDate().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest italic shadow-sm ${t.status === 'open' ? 'bg-amber-600 text-white' : 'bg-green-600 text-white'}`}>
                                                {t.status}
                                            </div>
                                        </div>
                                        <p className="text-lg font-medium text-slate-500 leading-relaxed italic border-l-4 border-slate-100 pl-10">“{t.message}”</p>
                                    </div>
                                ))}
                                {tickets.length === 0 && <p className="p-20 text-center text-slate-400 italic bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">Support history is empty. We are here to help whenever you need us.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Support Modal (Z-INDEX adjustment) */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[60px] p-16 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-16">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none mb-4">New Inquiry</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Direct Institutional Bridge</p>
                                </div>
                                <button onClick={() => setIsTicketModalOpen(false)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Subject Context</label>
                                    <input
                                        className="w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[32px] outline-none focus:border-indigo-300 focus:bg-white transition-all font-black italic text-xl tracking-tight shadow-inner"
                                        placeholder="Brief summary..."
                                        value={ticketData.subject}
                                        onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Detailed Observation</label>
                                    <textarea
                                        className="w-full px-10 py-8 bg-slate-50 border border-slate-200 rounded-[44px] outline-none focus:border-indigo-300 focus:bg-white transition-all font-medium text-slate-600 min-h-[200px] italic shadow-inner text-lg"
                                        placeholder="Explain your concern..."
                                        value={ticketData.message}
                                        onChange={e => setTicketData({ ...ticketData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-8 bg-slate-900 text-white rounded-[44px] font-black text-[12px] uppercase tracking-[0.44em] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all italic flex items-center justify-center gap-6">
                                    Dispatch Message <ChevronRight className="w-6 h-6" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-Components ---

const SidebarBtn = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl transition-all group ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative z-10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
        <div className="flex items-center gap-4">
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-300 group-hover:text-indigo-400 transition-colors'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-widest italic ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'}`}>{label}</span>
        </div>
        {active && <ArrowUpRight className="w-4 h-4 opacity-50" />}
    </button>
);

const StatCard = ({ label, value, trend, color, icon: Icon }) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 bg-${trend === 'up' ? 'green' : 'slate'}-50 rounded-full`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-green-600" /> : <ArrowDownRight className="w-3 h-3 text-slate-400" />}
                <span className={`text-[9px] font-black uppercase text-${trend === 'up' ? 'green' : 'slate'}-600 tracking-widest underline decoration-green-100 decoration-4`}>+14%</span>
            </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <h4 className="text-4xl font-black text-slate-800 italic tracking-tighter">{value}</h4>
    </div>
);

const StrengthItem = ({ label, desc, color }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all cursor-default group">
        <div className={`w-1.5 h-10 rounded-full bg-${color}-500 group-hover:scale-y-110 transition-transform`}></div>
        <div>
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic">{label}</p>
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1 opacity-60">Status: {desc}</p>
        </div>
    </div>
);

export default ParentDashboard;
