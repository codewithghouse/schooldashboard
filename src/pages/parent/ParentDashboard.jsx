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
    User,
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
    ShieldCheck,
    Heart,
    Info
} from 'lucide-react';

// INTELLIGENCE_MODE Configuration
const INTELLIGENCE_MODE = true;

const ParentDashboard = () => {
    const { user, userData, schoolId: authSchoolId } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
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
            alert("Support ticket raised successfully!");
        } catch (error) {
            console.error(error);
            alert("Error raising ticket");
        }
    };

    // --- Parent-Perspective Intelligence Helpers ---

    const getPerformanceBand = (result) => {
        if (!INTELLIGENCE_MODE) return null;
        const percentage = Math.round((result.marksScored / result.totalMarks) * 100);
        if (percentage >= 85) return { label: 'Top 25%', color: 'green', desc: 'Aligned with advanced expectations' };
        if (percentage >= 50) return { label: 'Middle 60%', color: 'amber', desc: 'Consistent class participation' };
        return { label: 'Needs Attention', color: 'rose', desc: 'Milestone reinforcement suggested' };
    };

    const getAcademicHealth = () => {
        if (results.length === 0) return { label: 'Synchronizing', color: 'indigo', status: 'Core assessments pending' };
        const avg = results.reduce((acc, res) => acc + (res.marksScored / res.totalMarks), 0) / results.length;
        if (avg >= 0.75) return { label: 'Stable', color: 'green', status: 'Academic trajectoy is on track' };
        if (avg >= 0.5) return { label: 'Active', color: 'amber', status: 'Steady growth observed' };
        return { label: 'Review Needed', color: 'rose', status: 'Focus areas identified' };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-6" />
                <p className="text-xs font-black tracking-[0.4em] text-gray-400 uppercase italic">Loading Parent Perspective...</p>
            </div>
        );
    }

    const health = getAcademicHealth();

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-gray-900 pb-20">
            {/* Child Selector Overlay */}
            <div className="max-w-7xl mx-auto px-4 md:px-0 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex bg-white p-1.5 rounded-[32px] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                        {students.map(std => (
                            <button
                                key={std.id}
                                onClick={() => setSelectedStudent(std)}
                                className={`px-8 py-3.5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedStudent?.id === std.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                {std.name}
                            </button>
                        ))}
                        {students.length === 0 && (
                            <p className="px-8 py-3.5 text-xs font-black text-gray-300 uppercase italic">Awaiting Child Link</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Navigation Sidebar */}
                    <nav className="lg:col-span-3 space-y-3">
                        <NavItem icon={LayoutDashboard} label="Emotional Connect" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                        <NavItem icon={GraduationCap} label="Academic Standing" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                        <NavItem icon={BookOpen} label="Topic Feed" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
                        <NavItem icon={Clock} label="Daily Presence" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} demo />
                        <NavItem icon={LifeBuoy} label="Parent Voice" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    </nav>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9 animate-in fade-in slide-in-from-right-4 duration-700">
                        {activeTab === 'home' && (
                            <div className="space-y-10">
                                {/* Academic Health Hero */}
                                <div className="bg-white rounded-[50px] p-12 md:p-16 border border-gray-100 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60"></div>
                                    <div className="relative z-10">
                                        <div className="flex flex-wrap items-center gap-4 mb-8">
                                            <span className={`px-6 py-2 bg-${health.color}-50 text-${health.color}-600 rounded-full text-[10px] font-black uppercase tracking-widest italic border border-${health.color}-100`}>
                                                Status: {health.label}
                                            </span>
                                            <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                                <ShieldCheck className="w-4 h-4 text-primary-600" /> Institution Verified
                                            </span>
                                        </div>
                                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic leading-none mb-6">
                                            {selectedStudent?.name || 'Monitoring Active'}
                                        </h1>
                                        <p className="text-xl text-gray-400 font-medium max-w-2xl italic leading-relaxed">
                                            “{health.status}. Our system is continuously mapping classroom participation with assessment data.”
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Recent Milestone */}
                                    <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-lg">
                                        <div className="flex items-center justify-between mb-10">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Latest Milestone</h4>
                                            <TrendingUp className="w-5 h-5 text-primary-600" />
                                        </div>
                                        {results.length > 0 ? (
                                            <div>
                                                <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-3 italic">{results[0].subject}</p>
                                                <h3 className="text-4xl font-black text-gray-900 italic tracking-tighter mb-8 group cursor-default">
                                                    Performance: <span className="text-primary-600">{Math.round((results[0].marksScored / results[0].totalMarks) * 100)}%</span>
                                                </h3>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                                                    <Info className="w-4 h-4 text-gray-400" />
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase italic">Aligned with class expectations for this unit.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <ReassuringEmpty title="Initial Phase" desc="Initial assessments are underway. Insights will auto-populate shortly." />
                                        )}
                                    </div>

                                    {/* Teacher Insight */}
                                    <div className="bg-gray-900 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        <div className="flex items-center justify-between mb-10">
                                            <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest italic">Lead Mentor Insight</h4>
                                            <Heart className="w-5 h-5 text-primary-400" />
                                        </div>
                                        {updates.length > 0 ? (
                                            <div>
                                                <p className="text-lg font-medium text-gray-300 italic mb-10 leading-relaxed">
                                                    “{updates[0].generalNotes}”
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-black uppercase text-primary-400">{teacher?.name?.[0]}</div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white italic">{teacher?.name}</p>
                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 italic">Academic Lead</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <ReassuringEmpty title="Narratives Pending" desc="Mentors are compiling classroom observations for this week." dark />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'results' && (
                            <div className="space-y-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Academic Standing</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Comparative Perspective: Enabled</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> No missed assessments detected
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {results.map((res, i) => {
                                        const band = getPerformanceBand(res);
                                        const isAbsent = res.marksScored === 0;

                                        return (
                                            <div key={i} className="bg-white rounded-[44px] p-10 border border-gray-100 hover:border-primary-200 transition-all hover:shadow-2xl group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                                    <div className="flex items-center gap-10">
                                                        <div className={`w-20 h-20 rounded-[30px] flex flex-col items-center justify-center font-black italic border transition-all ${isAbsent ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-primary-600 border-gray-100 group-hover:bg-primary-600 group-hover:text-white'}`}>
                                                            <span className="text-2xl">{isAbsent ? '!' : Math.round((res.marksScored / res.totalMarks) * 100)}</span>
                                                            {!isAbsent && <span className="text-[10px] -mt-1">%</span>}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">{res.subject}</h4>
                                                                {!isAbsent && (
                                                                    <span className={`text-[8px] font-black text-${band.color}-600 uppercase bg-${band.color}-50 px-3 py-1 rounded-full border border-${band.color}-100 italic`}>
                                                                        {band.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-6">
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest italic">{res.createdAt?.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                                                </div>
                                                                {isAbsent && (
                                                                    <span className="text-[9px] font-black text-rose-500 uppercase italic flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Missed Assessment • Significant impact potential</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                                        <div className="w-full space-y-2">
                                                            <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest italic px-1">
                                                                <span>Progress Visibility</span>
                                                                <span>{band?.desc}</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                                                <div className={`h-full bg-primary-600 rounded-full transition-all duration-1000 group-hover:brightness-110`} style={{ width: `${(res.marksScored / res.totalMarks) * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {results.length === 0 && <EmptyInsight icon={TrendingUp} title="Initial Standing" desc="Evaluation frameworks are currently active. Standing indicators will populate following the first unit cycle." />}
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="space-y-10">
                                <div className="px-4">
                                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Active Topic Feed</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">What is being taught in the classroom</p>
                                </div>
                                <div className="space-y-8 relative px-4">
                                    {updates.map((upd, i) => (
                                        <div key={i} className="bg-white rounded-[44px] p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full blur-[60px] opacity-40"></div>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8 relative z-10">
                                                <div>
                                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 italic">Classroom Narrative • {upd.createdAt?.toDate().toLocaleDateString()}</p>
                                                    <h3 className="text-3xl font-black text-gray-900 italic tracking-tight">{upd.subject || 'Unit Exploration'}</h3>
                                                </div>
                                                <div className="px-6 py-3 bg-gray-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest italic shadow-xl">
                                                    Module: {upd.chapterCompleted}
                                                </div>
                                            </div>
                                            <p className="text-lg font-medium text-gray-500 leading-relaxed italic border-l-4 border-primary-100 pl-8 mb-10">
                                                “{upd.generalNotes}”
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-white transition-all">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Expectation Reinforcement</p>
                                                    <p className="text-base font-black text-gray-900 italic">{upd.homeworkAssigned || 'Routine Study Objectives'}</p>
                                                </div>
                                                <div className="p-6 bg-primary-50/50 rounded-3xl border border-primary-100 group-hover:bg-white transition-all">
                                                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-2 italic">Next Curricular Focus</p>
                                                    <p className="text-base font-black text-primary-900 italic">{upd.nextTopic || 'Advancing Module'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {updates.length === 0 && <EmptyInsight icon={BookOpen} title="Feed Synchronizing" desc="Classroom narratives are currently being synthesized. Feed will update as teachers log topic milestones." />}
                                </div>
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="bg-white rounded-[60px] p-16 md:p-24 border border-gray-100 shadow-xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-50/20 to-transparent pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-primary-50 rounded-[40px] flex items-center justify-center text-primary-600 mx-auto mb-10 shadow-inner">
                                        <ShieldCheck className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 italic tracking-tighter mb-6 underline decoration-primary-200 underline-offset-8">Daily Presence Gateway</h2>
                                    <p className="text-xl text-gray-400 font-medium max-w-lg mx-auto mb-16 italic leading-relaxed">
                                        “Is my child regular?” • Full daily attendance transparency and history is currently being calibrated for {selectedStudent?.name}.
                                    </p>
                                    <div className="inline-flex flex-col items-center gap-6">
                                        <div className="px-10 py-4 bg-gray-50 rounded-full border border-gray-100 shadow-sm flex items-center gap-4">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.34em] text-gray-500 italic">Security Integration Level: High</span>
                                        </div>
                                        <p className="text-xs font-black text-primary-600 uppercase tracking-widest italic underline decoration-primary-100">Live feed auto-activation in progress</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="space-y-10">
                                <div className="flex justify-between items-center px-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 italic tracking-tight underline decoration-primary-200 underline-offset-4">Parent Voice</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic whitespace-nowrap overflow-hidden">Your concerns, directly addressed by the institution.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsTicketModalOpen(true)}
                                        className="px-8 py-5 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-primary-600 transition-all flex items-center gap-3 italic flex-shrink-0"
                                    >
                                        Raise Concern <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {tickets.map((t, i) => (
                                        <div key={i} className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-lg hover:border-primary-100 transition-all relative group">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-all ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                        {t.status === 'open' ? '?' : '✓'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">{t.subject}</h4>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Log: {t.ticketNo} • Tracked since {t.createdAt?.toDate().toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest italic shadow-sm ${t.status === 'open' ? 'bg-amber-400 text-white' : 'bg-green-500 text-white'}`}>
                                                    Status: {t.status}
                                                </div>
                                            </div>
                                            <p className="text-lg font-medium text-gray-500 leading-relaxed italic border-l-4 border-gray-100 pl-10">
                                                “{t.message}”
                                            </p>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && <EmptyInsight icon={LifeBuoy} title="Direct Communication" desc="The secure gateway for your feedback is open. Any concerns or queries raised will be archived here for your transparency." />}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Ticket Modal */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[60px] p-12 md:p-20 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100 rounded-full blur-[120px] -mr-40 -mt-40 opacity-40"></div>
                        <div className="relative z-10 text-center">
                            <div className="flex justify-between items-start mb-16">
                                <div className="text-left">
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic leading-none mb-4">Submit Feedback</h2>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Confidential Institutional Bridge</p>
                                </div>
                                <button onClick={() => setIsTicketModalOpen(false)} className="p-4 bg-gray-50 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-12">
                                <div className="text-left">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-4 italic">Core Concern Context</label>
                                    <input
                                        className="w-full px-10 py-6 bg-gray-50 border border-gray-100 rounded-[32px] outline-none focus:border-primary-300 focus:bg-white transition-all font-black italic text-xl tracking-tight shadow-inner"
                                        placeholder="Briefly summarize your request..."
                                        value={ticketData.subject}
                                        onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="text-left">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-4 italic">Detailed Observation</label>
                                    <textarea
                                        className="w-full px-10 py-8 bg-gray-50 border border-gray-100 rounded-[44px] outline-none focus:border-primary-300 focus:bg-white transition-all font-medium text-gray-600 min-h-[180px] italic shadow-inner text-lg"
                                        placeholder="Please provide specifics here for faster resolution..."
                                        value={ticketData.message}
                                        onChange={e => setTicketData({ ...ticketData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-8 bg-gray-900 text-white rounded-[44px] font-black text-[12px] uppercase tracking-[0.44em] shadow-2xl hover:bg-primary-600 transition-all italic flex items-center justify-center gap-6">
                                    Dispatch Concern <ChevronRight className="w-6 h-6" />
                                </button>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic underline decoration-primary-100 decoration-2">Encrypted Communication Endpoint Verified</p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-Components (Parent Perspective UI) ---

const NavItem = ({ icon: Icon, label, active, onClick, demo }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-8 py-5.5 rounded-[32px] transition-all group ${active ? 'bg-white shadow-2xl shadow-primary-600/10 border border-primary-50 relative z-10' : 'hover:bg-gray-100'}`}
    >
        <div className="flex items-center gap-6">
            <div className={`w-11 h-11 rounded-[20px] flex items-center justify-center transition-all ${active ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-gray-50 text-gray-300 group-hover:bg-white group-hover:text-primary-600 border border-transparent shadow-sm'}`}>
                <Icon className="w-5.5 h-5.5" />
            </div>
            <span className={`text-[12px] font-black uppercase tracking-widest transition-all italic ${active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
        </div>
        {demo && (
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-primary-100 rounded-full animate-pulse"></div>
            </div>
        )}
    </button>
);

const ReassuringEmpty = ({ title, desc, dark }) => (
    <div className={`space-y-4 py-4 px-6 rounded-3xl border-2 border-dashed ${dark ? 'border-white/10' : 'border-gray-50'}`}>
        <p className={`text-xs font-black uppercase tracking-widest italic ${dark ? 'text-primary-400' : 'text-primary-600'}`}>{title}</p>
        <p className={`text-[11px] font-medium italic ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{desc}</p>
    </div>
);

const EmptyInsight = ({ icon: Icon, title, desc }) => (
    <div className="py-24 text-center px-6">
        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-300 mx-auto mb-10 border border-gray-50 shadow-inner">
            <Icon className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 italic tracking-tight">{title}</h3>
        <p className="text-gray-400 font-medium text-sm max-w-sm mx-auto mt-4 italic leading-relaxed text-balance">
            {desc}
        </p>
    </div>
);

export default ParentDashboard;
