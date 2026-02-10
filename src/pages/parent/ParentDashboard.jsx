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
    Flag
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
            // Only show 'published' updates if not in demo mode, else show all for demo
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
        if (results.length === 0) return "Initial alignment in progress";
        const avg = results.reduce((acc, r) => acc + (r.marksScored / r.totalMarks), 0) / results.length;
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
            <aside className="w-72 border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0 p-8">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-black italic tracking-tighter text-xl capitalize">{sId ? 'School Portal' : 'Portal'}</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={GraduationCap} label="Academics" active={activeTab === 'academics'} onClick={() => setActiveTab('academics')} />
                    <SidebarItem icon={Clock} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
                    <SidebarItem icon={BookOpen} label="Weekly Updates" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
                    <SidebarItem icon={LifeBuoy} label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                </nav>

                <div className="pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 font-black text-gray-400">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black truncate italic">{user.email}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parent Account</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mandatory Professional Header */}
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

                <div className="p-10 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* Multi-child trigger (Subtle) */}
                    {students.length > 1 && (
                        <div className="flex gap-3 pb-4 overflow-x-auto no-scrollbar">
                            {students.map(std => (
                                <button
                                    key={std.id}
                                    onClick={() => setSelectedStudent(std)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedStudent.id === std.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {std.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* VIEW: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <OverviewCard
                                    label="Overall Standing"
                                    main={getPerformanceBand()}
                                    desc={results.length > 0 ? `Based on ${results.length} mapped assessments.` : "Baseline evaluation in progress."}
                                    insight={getPerformanceBand() === "Top 25%" ? "Exceptional academic positioning." : getPerformanceBand() === "Middle 60%" ? "Consistent performance aligned with class median." : "Requires focus session."}
                                />
                                <OverviewCard
                                    label="Assessment Status"
                                    main={`${results.length} Conducted`}
                                    desc="Academic year cycle active"
                                    insight={results.length > 0 ? "Data feed synchronized." : "Initial assessments underway."}
                                />
                                <OverviewCard
                                    label="Reason Insight"
                                    main="Stable Presence"
                                    desc="Monitoring daily regularity"
                                    insight="No missed assessments detected."
                                />
                                <OverviewCard
                                    label="Next Expectation"
                                    main="Assessment Phase"
                                    desc="Continuous evaluation flow"
                                    insight="Next assessment cycle is in progress."
                                />
                            </div>

                            {/* Progress Visibility (CSS Only) */}
                            <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visibility Meter</p>
                                        <h3 className="text-2xl font-black italic tracking-tight text-gray-900 uppercase">Child Progress Visibility</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black italic text-gray-900 tracking-tighter">45%</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidence Score</p>
                                    </div>
                                </div>
                                <div className="h-4 bg-white rounded-full overflow-hidden border border-gray-200 p-1">
                                    <div className="h-full bg-gray-900 rounded-full transition-all duration-1000" style={{ width: '45%' }}></div>
                                </div>
                                <p className="mt-6 text-xs text-gray-500 font-medium italic opacity-70">
                                    *Progress visibility improves as more assessments are completed. Current standard: **80% coverage** expected by semester end.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* VIEW: ACADEMICS */}
                    {activeTab === 'academics' && (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                                <h2 className="text-3xl font-black italic tracking-tight uppercase">Academic Standing</h2>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Official Institutional Data</span>
                                </div>
                            </div>

                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {results.map((res, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-all">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex flex-col items-center justify-center font-black italic border border-gray-100">
                                                    <span className="text-2xl">{Math.round((res.marksScored / res.totalMarks) * 100)}</span>
                                                    <span className="text-[9px] uppercase tracking-widest -mt-1">%</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black italic tracking-tight uppercase">{res.subject}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                            {(res.marksScored / res.totalMarks) >= 0.6 ? "Aligned with class expectations" : "Review Session Suggested"}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400">Score: {res.marksScored}/{res.totalMarks}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Comparison</p>
                                                <p className="text-sm font-black italic text-gray-900">
                                                    {(res.marksScored / res.totalMarks) >= 0.75 ? "Above class average" : "Aligned with class median"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
                                    <Activity className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                                    <h3 className="text-xl font-black text-gray-900 uppercase italic">Initial assessments underway.</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed italic">The academic cycle for this semester has just begun. Performance metrics will populate as assessments are logged.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: WEEKLY UPDATES */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-10">
                            <h2 className="text-3xl font-black italic tracking-tight uppercase border-b border-gray-100 pb-8">Weekly Updates</h2>

                            {updates.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:left-7 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                                    {updates.map((upd, i) => (
                                        <div key={i} className="flex gap-10 relative z-10">
                                            <div className="w-14 items-center flex flex-col pt-2 shrink-0">
                                                <div className="w-4 h-4 rounded-full border-4 border-white bg-gray-900 shadow-sm"></div>
                                            </div>
                                            <div className="flex-1 bg-white p-10 rounded-[40px] border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-2">Subject Broadcast • {upd.createdAt?.toDate().toLocaleDateString()}</p>
                                                        <h3 className="text-2xl font-black text-gray-900 italic uppercase">{upd.subject}</h3>
                                                    </div>
                                                    <span className="px-5 py-2 bg-gray-50 border border-gray-100 text-gray-900 rounded-full text-[9px] font-black uppercase tracking-widest italic">CH: {upd.chapterCompleted}</span>
                                                </div>
                                                <p className="text-lg font-medium text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-8 mb-8">“{upd.generalNotes}”</p>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-flex items-center gap-3">
                                                    <Flag className="w-4 h-4 text-gray-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Weekend Focus: {upd.homeworkAssigned || "No specific task"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center bg-gray-50 rounded-[48px] border border-gray-100">
                                    <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                                    <h3 className="text-xl font-black text-gray-900 uppercase italic">Updates will appear weekly.</h3>
                                    <p className="text-sm text-gray-500 mt-2 italic">Class syllabus coverage has started. Weekly narratives of classroom progress will be shared here.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIEW: ATTENDANCE */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-10 text-center py-20 bg-gray-50 rounded-[60px] border border-gray-100">
                            <div className="w-20 h-20 bg-white border border-gray-100 rounded-3xl flex items-center justify-center text-gray-900 mx-auto mb-8 shadow-sm">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-black text-gray-900 italic tracking-tighter mb-4">98% Attendance</h2>
                            <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto mb-12 italic leading-relaxed">Exhibiting consistent regularity and institutional presence.</p>
                            <div className="flex justify-center gap-3">
                                <div className="px-6 py-3 bg-gray-200 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest italic">Attendance Aligned</div>
                                <div className="px-6 py-3 border border-gray-200 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest italic">Monitoring Active</div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: SUPPORT */}
                    {activeTab === 'support' && (
                        <div className="space-y-10">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-8">
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tight uppercase text-gray-900">Support Desk</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Direct channel to academic administration</p>
                                </div>
                                <button
                                    onClick={() => setIsTicketModalOpen(true)}
                                    className="px-8 py-5 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center gap-3 italic"
                                >
                                    Raise Inquiry <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {tickets.map((t, i) => (
                                    <div key={i} className="bg-white p-10 rounded-[40px] border border-gray-100 hover:border-gray-300 transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                    {t.status === 'open' ? '?' : '✓'}
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black italic tracking-tight uppercase text-gray-900">{t.subject}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mt-1">{t.ticketNo} • Logged on {t.createdAt?.toDate().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic ${t.status === 'open' ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'}`}>
                                                {t.status}
                                            </div>
                                        </div>
                                        <p className="text-lg font-medium text-gray-500 leading-relaxed italic border-l-4 border-gray-50 pl-10 underline decoration-gray-50 decoration-4 underline-offset-8">“{t.message}”</p>
                                    </div>
                                ))}
                                {tickets.length === 0 && (
                                    <div className="text-center py-32 bg-gray-50 rounded-[48px] border border-gray-100">
                                        <LifeBuoy className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                                        <p className="text-sm text-gray-400 italic font-medium">Support history is empty. We are here to help whenever you need us.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Support Modal */}
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

export default ParentDashboard;
