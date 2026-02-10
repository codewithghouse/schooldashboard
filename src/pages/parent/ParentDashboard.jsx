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
    ChevronRight,
    MessageSquare,
    CheckCircle2,
    Loader2,
    Building2,
    Activity,
    Plus,
    X,
    Clock,
    User,
    ShieldCheck,
    AlertTriangle,
    Flag,
    TrendingUp,
    Award,
    Zap,
    Sparkles,
    Star,
    Target,
    Shield
} from 'lucide-react';

const DEMO_MODE = true;

const ParentDashboard = () => {
    const { user, userData, schoolId: authSchoolId } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [classInfo, setClassInfo] = useState(null);

    // Ticket Modal State
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

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
                const myTickets = await getTickets(sId, 'parent', user.uid);
                setTickets(myTickets.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
            } catch (error) {
                console.error("Parent Dashboard Load Error:", error);
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

            setResults(stdResults);
            setUpdates(stdUpdates.filter(u => u.status === 'published' || DEMO_MODE));
            setClassInfo(stdClass);
        } catch (error) {
            console.error("Student Detail Load Error:", error);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await createTicket(sId, {
                ...newTicket,
                userId: user.uid,
                userName: userData?.name || user.email,
                userEmail: user.email,
                role: 'parent'
            });
            const myTickets = await getTickets(sId, 'parent', user.uid);
            setTickets(myTickets.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
            setIsTicketModalOpen(false);
            setNewTicket({ subject: '', message: '' });
        } catch (error) {
            console.error(error);
        }
    };

    // Derived Intelligence (UI Layer Only)
    const getPerformanceBand = () => {
        if (results.length === 0 && !DEMO_MODE) return "Initial alignment in progress";
        // Dummy logic for demo to show better bands
        if (DEMO_MODE && results.length === 0) return "Top 25%";
        const avg = results.reduce((acc, r) => acc + (r.marksScored / r.totalMarks), 0) / (results.length || 1);
        if (avg >= 0.75) return "Top 25%";
        if (avg >= 0.40) return "Middle 60%";
        return "Needs Attention";
    };

    const getStatusIndicator = () => {
        const band = getPerformanceBand();
        if (band === "Top 25%") return { label: "On Track", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 };
        if (band === "Middle 60%") return { label: "Stable", color: "text-blue-600 bg-blue-50 border-blue-100", icon: ShieldCheck };
        if (band === "Needs Attention") return { label: "Action Required", color: "text-amber-600 bg-amber-50 border-amber-100", icon: AlertTriangle };
        return { label: "Calibrating", color: "text-gray-400 bg-gray-50 border-gray-100", icon: Clock };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white font-inter">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Synchronizing Child Data...</p>
            </div>
        );
    }

    if (!selectedStudent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-gray-100 mb-8 shadow-sm">
                    <User className="w-10 h-10 text-gray-200" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-4">Awaiting child data from school.</h1>
                <p className="text-sm text-gray-500 max-w-sm mb-10 leading-relaxed">Your profile is currently waiting to be linked with your child's student record by the school administration.</p>
                <div className="px-6 py-3 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Contact School Office</div>
            </div>
        );
    }

    const status = getStatusIndicator();
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-white flex font-inter text-gray-900">
            {/* Sidebar */}
            <aside className="w-80 border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0 p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-black italic tracking-tighter text-xl capitalize">EduPortal</span>
                </div>

                {/* SLICK ID CARD WIDGET */}
                <div className="bg-gray-900 rounded-[32px] p-6 text-white mb-10 relative overflow-hidden group shadow-xl shadow-gray-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-xl border border-white/20">
                                {selectedStudent.name[0]}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Student ID</p>
                                <p className="text-lg font-black italic tracking-tight truncate">#{selectedStudent.id.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <span>Class & Section</span>
                                <span className="text-white">Grade {selectedStudent.grade}-{selectedStudent.section}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <span>Academic Status</span>
                                <span className="text-emerald-400">Regular</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Gold Tier Badge</span>
                        </div>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={GraduationCap} label="Academics" active={activeTab === 'academics'} onClick={() => setActiveTab('academics')} />
                    <SidebarItem icon={Clock} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                    <SidebarItem icon={BookOpen} label="Weekly Updates" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
                    <SidebarItem icon={LifeBuoy} label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                </nav>

                <div className="pt-8 border-t border-gray-50 text-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Powered by Antigravity OS</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-24 border-b border-gray-50 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-200">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">{selectedStudent.name}</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Class {selectedStudent.grade} - Section {selectedStudent.section}</p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${status.color}`}>
                        <StatusIcon className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                    </div>
                </header>

                <div className="p-10 max-w-6xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* VIEW: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <OverviewCard
                                    label="Overall Standing"
                                    main={getPerformanceBand()}
                                    desc={results.length > 0 ? `Based on ${results.length} mapped assessments.` : "Baseline evaluation in progress."}
                                    insight={getPerformanceBand() === "Top 25%" ? "Exceptional academic positioning." : getPerformanceBand() === "Middle 60%" ? "Consistent performance aligned with class median." : "Requires focus session."}
                                />
                                <OverviewCard
                                    label="Next Major Milestone"
                                    main="Final Exams"
                                    desc="Scheduled for Mid-March"
                                    insight="Syllabus coverage currently at 78%."
                                />
                                <OverviewCard
                                    label="Social Metric"
                                    main="Highly Active"
                                    desc="Institutional Participation"
                                    insight="Bacha school activities mein leading hai."
                                />
                                <OverviewCard
                                    label="Attendance Index"
                                    main="98%"
                                    desc="Institutional Regularity"
                                    insight="Meets the gold standard of presence."
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Left: Monthly Trajectory Index (CSS Graph) */}
                                <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[44px] p-10 shadow-sm">
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h3 className="text-2xl font-black italic tracking-tight uppercase">Monthly Trajectory</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Tracking consistency over the academic cycle</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-black"></div>
                                                <span className="text-[9px] font-black uppercase text-gray-500">Overall Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between h-64 gap-3">
                                        {[65, 78, 72, 85, 91, 88].map((v, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                <div
                                                    className="w-full bg-gray-50 group-hover:bg-gray-900 transition-all rounded-[12px] relative cursor-pointer"
                                                    style={{ height: `${v}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {v}% Score
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Month {i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-10 text-xs text-gray-500 font-medium italic border-t border-gray-50 pt-6">
                                        **Tara AI Insight:** Trajectory shows a consistent upward stabilization. Strength in consistency noted.
                                    </p>
                                </div>

                                {/* Right: Achievement Badges */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-gray-50/50 border border-gray-100 rounded-[44px] p-8">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Honors & Achievements</h4>
                                        <div className="space-y-4">
                                            <BadgeItem icon={Award} label="100% Attendance" color="emerald" desc="Gold regularity strike" />
                                            <BadgeItem icon={Zap} label="Quick Thinker" color="indigo" desc="Top response speed" />
                                            <BadgeItem icon={ShieldCheck} label="Perfect Discipline" color="blue" desc="Conduct standard met" />
                                            <BadgeItem icon={Star} label="Star Student" color="amber" desc="February's Top Cohort" />
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6">
                                        <div className="flex items-center gap-3 mb-3 text-emerald-600">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Upcoming Goal</span>
                                        </div>
                                        <p className="text-sm font-black italic tracking-tight text-emerald-900 leading-tight">Mathematics Expert</p>
                                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Requires 85%+ in next assessment to unlock.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: ACADEMICS */}
                    {activeTab === 'academics' && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Skill Radar / Progress Breakdown */}
                                <div className="bg-white border border-gray-100 rounded-[44px] p-10">
                                    <h3 className="text-2xl font-black italic tracking-tight uppercase mb-8">Cognitive Progress</h3>
                                    <div className="space-y-8">
                                        <SkillItem label="Logical Reasoning" value={85} color="indigo" icon={Target} />
                                        <SkillItem label="Emotional Quotient" value={92} color="emerald" icon={Activity} />
                                        <SkillItem label="Linguistic Ability" value={78} color="blue" icon={MessageSquare} />
                                        <SkillItem label="Creative Synthesis" value={88} color="amber" icon={Sparkles} />
                                    </div>
                                </div>

                                {/* Syllabus Tracker */}
                                <div className="bg-gray-50 border border-gray-100 rounded-[44px] p-10">
                                    <div className="flex justify-between items-center mb-10">
                                        <h3 className="text-2xl font-black italic tracking-tight uppercase">Syllabus Coverage</h3>
                                        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-900">Semester 2 Cycle</span>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <SyllabusItem label="Mathematics" progress={75} status="On Track" />
                                        <SyllabusItem label="English Literature" progress={90} status="Near Completion" />
                                        <SyllabusItem label="Science & Tech" progress={62} status="Continuous Flow" />
                                        <SyllabusItem label="Social Sciences" progress={80} status="Revision Phase" />
                                    </div>
                                    <div className="mt-10 p-5 bg-white rounded-3xl border border-gray-200 flex items-center gap-4">
                                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Institutional Completion Index: **78% Average**</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[44px] p-10">
                                <h3 className="text-2xl font-black italic tracking-tight uppercase mb-8">Recent Assessment Logs</h3>
                                {results.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {results.map((res, i) => (
                                            <ResultRow key={i} res={res} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-30">
                                        <Activity className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest italic">Academic cycle data synchronizing...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIEW: WEEKLY UPDATES (Topic Feed) */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-12">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tight uppercase">Academic Dispatch</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Real-time classroom narrative</p>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Sync Version 4.2</div>
                            </div>

                            {updates.length > 0 ? (
                                <div className="space-y-10 relative before:absolute before:left-7 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                                    {updates.map((upd, i) => (
                                        <div key={i} className="flex gap-10 relative z-10">
                                            <div className="w-4 h-4 rounded-full border-4 border-white bg-gray-900 shadow-sm mt-1.5 shrink-0"></div>
                                            <div className="flex-1 bg-white p-10 rounded-[44px] border border-gray-100 hover:shadow-2xl hover:shadow-gray-100/50 transition-all group">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic mb-2">Institutional Broadcast • {upd.createdAt?.toDate().toLocaleDateString()}</p>
                                                        <h3 className="text-3xl font-black text-gray-900 italic uppercase underline decoration-gray-50 decoration-8 underline-offset-8 transition-all group-hover:decoration-gray-100">{upd.subject}</h3>
                                                    </div>
                                                    <div className="bg-gray-50 px-5 py-2.5 border border-gray-100 rounded-2xl flex flex-col items-center">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">CHAPTER</span>
                                                        <span className="text-lg font-black italic">{upd.chapterCompleted}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-medium text-gray-600 leading-relaxed italic border-l-[6px] border-gray-50 pl-10 mb-10">“{upd.generalNotes}”</p>
                                                <div className="flex flex-wrap gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-flex items-center gap-3">
                                                        <Flag className="w-4 h-4 text-gray-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Action Item: {upd.homeworkAssigned || "No specific task"}</span>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-flex items-center gap-3">
                                                        <Target className="w-4 h-4 text-gray-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Next Topic: {upd.nextTopic || "Continuous Study"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center bg-gray-50 border border-dashed border-gray-200 rounded-[50px]">
                                    <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black text-gray-900 uppercase italic">Updates will appear weekly.</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto mt-4 italic">Class narrative is being collated. Once the teacher publishes the report, it will visualize here instantly.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ATTENDANCE & SUPPORT (Keep existing or further polish?) */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-12">
                            <div className="bg-gray-900 rounded-[60px] p-24 text-center text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-transparent"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[40px] flex items-center justify-center text-white mx-auto mb-10 border border-white/20 shadow-2xl">
                                        <Clock className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-6xl font-black italic tracking-tighter mb-6 uppercase">98% Presence Index</h2>
                                    <p className="text-xl text-gray-400 font-medium max-w-xl mx-auto mb-16 italic leading-relaxed">Stable regularity detected. Student meets the Institutional Gold Standard for presence this academic year.</p>
                                    <div className="flex justify-center gap-4">
                                        <div className="px-10 py-5 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest italic shadow-xl">Regularity Verified</div>
                                        <div className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest italic">Beta Presence Log</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="flex justify-between items-center bg-white border border-gray-100 p-10 rounded-[44px]">
                                        <div>
                                            <h2 className="text-3xl font-black italic tracking-tight uppercase">Support Desk</h2>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct bridge to academic office</p>
                                        </div>
                                        <button
                                            onClick={() => setIsTicketModalOpen(true)}
                                            className="px-10 py-6 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center gap-4 italic"
                                        >
                                            New Inquiry <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {tickets.map((t, i) => (
                                            <div key={i} className="bg-white p-10 rounded-[44px] border border-gray-100 hover:border-gray-200 transition-all shadow-sm">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black italic ${t.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {t.status === 'open' ? '?' : '✓'}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-2xl font-black italic tracking-tight uppercase">{t.subject}</h4>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic mt-1">{t.ticketNo} • Logged on {t.createdAt?.toDate().toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest italic ${t.status === 'open' ? 'bg-amber-600 text-white shadow-lg' : 'bg-emerald-600 text-white shadow-lg'}`}>
                                                        {t.status}
                                                    </div>
                                                </div>
                                                <p className="text-lg font-medium text-gray-500 leading-relaxed italic border-l-4 border-gray-50 pl-10">“{t.message}”</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Tara AI Advice Widget */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-gray-900 rounded-[44px] p-10 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-8 text-indigo-400">
                                                <Sparkles className="w-6 h-6" />
                                                <span className="text-xs font-black uppercase tracking-widest">Tara AI Recommendation</span>
                                            </div>
                                            <p className="text-lg font-black italic tracking-tight leading-relaxed mb-6">"Based on current trajectory, focus on Mathematics Chapter 4 over the weekend. Logic reasoning is high, but precision calibration is required."</p>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-indigo-400" />
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personalized Intelligence</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-[44px] p-10 border border-gray-100">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Support Status</h4>
                                        <div className="flex items-center gap-4 text-emerald-600 mb-6">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">All Systems Online</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed italic">Our team monitors all academic inquiries 24/7. Response time is typically under 12 hours.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Support Modal (Z-INDEX adjustment) */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[60px] p-16 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 border border-gray-100">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-16">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 italic tracking-tighter leading-none mb-4 uppercase underline decoration-gray-100 decoration-8 underline-offset-8">New Inquiry</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Direct Institutional Bridge</p>
                                </div>
                                <button onClick={() => setIsTicketModalOpen(false)} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100 text-gray-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Subject Context</label>
                                    <input
                                        className="w-full px-10 py-6 bg-gray-50 border border-gray-100 rounded-[32px] outline-none focus:border-gray-900 focus:bg-white transition-all font-black italic text-xl tracking-tight shadow-inner"
                                        placeholder="Brief summary..."
                                        value={newTicket.subject}
                                        onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Detailed Observation</label>
                                    <textarea
                                        className="w-full px-10 py-8 bg-gray-50 border border-gray-100 rounded-[44px] outline-none focus:border-gray-900 focus:bg-white transition-all font-medium text-gray-600 min-h-[200px] italic shadow-inner text-lg"
                                        placeholder="Explain your concern..."
                                        value={newTicket.message}
                                        onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-8 bg-gray-900 text-white rounded-[44px] font-black text-[12px] uppercase tracking-[0.44em] shadow-2xl shadow-gray-200 hover:bg-black transition-all italic flex items-center justify-center gap-6">
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

// --- Atomic Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${active ? 'bg-gray-50 text-gray-900 shadow-sm relative z-10 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-300 group-hover:text-gray-500'}`} />
        <span className={`text-[11px] font-black uppercase tracking-widest italic ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </button>
);

const OverviewCard = ({ label, main, desc, insight }) => (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 hover:border-gray-300 transition-all group">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic underline decoration-gray-50 decoration-2 underline-offset-4">{label}</p>
        <h4 className="text-2xl font-black text-gray-900 italic tracking-tighter mb-1 uppercase underline decoration-gray-50 decoration-4 group-hover:decoration-gray-100 transition-all underline-offset-4 leading-tight">{main}</h4>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-6">{desc}</p>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] text-gray-500 font-bold italic lowercase leading-relaxed">System Insight: {insight}</p>
        </div>
    </div>
);

const BadgeItem = ({ icon: Icon, label, color, desc }) => {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:translate-x-1 transition-all">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-gray-900">{label}</p>
                <p className="text-[9px] font-bold text-gray-400 italic lowercase">{desc}</p>
            </div>
        </div>
    );
};

const SkillItem = ({ label, value, color, icon: Icon }) => {
    const colors = {
        indigo: "bg-indigo-600 shadow-indigo-200",
        emerald: "bg-emerald-600 shadow-emerald-200",
        blue: "bg-blue-600 shadow-blue-200",
        amber: "bg-amber-600 shadow-amber-200"
    };
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-3 px-1">
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-black uppercase text-gray-800 tracking-tight">{label}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase italic transition-all group-hover:text-gray-900">{value}% Mastery</span>
            </div>
            <div className="h-3 bg-gray-50 rounded-full border border-gray-100 overflow-hidden p-[2px]">
                <div
                    className={`h-full rounded-full transition-all duration-1000 shadow-lg ${colors[color]}`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};

const SyllabusItem = ({ label, progress, status }) => (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 group">
        <div className="flex justify-between items-start mb-4">
            <h5 className="text-sm font-black italic tracking-tight">{label}</h5>
            <span className="text-[9px] font-black uppercase italic text-gray-400">{status}</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-[10px] font-black tracking-tighter italic text-gray-900">{progress}%</span>
        </div>
    </div>
);

const ResultRow = ({ res }) => (
    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between hover:bg-white hover:border-gray-300 transition-all">
        <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center font-black italic text-gray-900">
                <span className="text-lg">{Math.round((res.marksScored / res.totalMarks) * 100)}</span>
                <span className="text-[8px] uppercase tracking-widest -mt-1">%</span>
            </div>
            <div>
                <p className="text-sm font-black italic tracking-tight uppercase">{res.subject}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Assessment logged on {res.createdAt?.toDate().toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <p className="text-lg font-black italic text-gray-900">{res.marksScored}/{res.totalMarks}</p>
            <p className={`text-[8px] font-black uppercase italic ${(res.marksScored / res.totalMarks) >= 0.75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {(res.marksScored / res.totalMarks) >= 0.75 ? 'Above Average' : 'Standard Met'}
            </p>
        </div>
    </div>
);

export default ParentDashboard;
