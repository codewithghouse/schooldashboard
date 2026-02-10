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
    X
} from 'lucide-react';

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-6" />
                <p className="text-xs font-black tracking-[0.4em] text-gray-400 uppercase italic">Initializing Digital Gateway...</p>
            </div>
        );
    }

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
                    </div>
                    <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[32px] border border-gray-100 shadow-sm">
                        <Building2 className="w-5 h-5 text-primary-600" />
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Academic Partner</p>
                            <p className="text-sm font-black text-gray-900 tracking-tight italic">{schoolInfo?.name || 'AcademiVis School'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Navigation Sidebar */}
                    <nav className="lg:col-span-3 space-y-3">
                        <NavItem icon={LayoutDashboard} label="Home Overview" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                        <NavItem icon={GraduationCap} label="Academic Progress" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                        <NavItem icon={BookOpen} label="Learning Timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
                        <NavItem icon={Clock} label="Attendance Summary" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} demo />
                        <NavItem icon={LifeBuoy} label="Support & Help" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    </nav>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9 animate-in fade-in slide-in-from-right-4 duration-700">
                        {activeTab === 'home' && (
                            <div className="space-y-10">
                                {/* Hero Card */}
                                <div className="bg-white rounded-[50px] p-12 border border-gray-100 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60"></div>
                                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic leading-none mb-4 relative z-10">
                                        Hello, {user.displayName || 'Parent'}
                                    </h1>
                                    <p className="text-xl text-gray-400 font-medium max-w-2xl italic relative z-10">
                                        Monitor {selectedStudent?.name}'s academic trajectory and school milestones in real-time.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Latest Achievement */}
                                    <div className="bg-white p-10 rounded-[44px] border border-gray-100 shadow-lg">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Latest Assessment</h4>
                                            <Award className="w-5 h-5 text-primary-600" />
                                        </div>
                                        {results.length > 0 ? (
                                            <div>
                                                <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-2">{results[0].subject}</p>
                                                <h3 className="text-4xl font-black text-gray-900 italic tracking-tighter mb-4">{results[0].marksScored} / {results[0].totalMarks}</h3>
                                                <p className="text-xs text-gray-400 font-medium">Logged on {results[0].createdAt?.toDate().toLocaleDateString()}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Waiting for initial assessment scores...</p>
                                        )}
                                    </div>

                                    {/* Latest Perspective */}
                                    <div className="bg-gray-900 p-10 rounded-[44px] text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest italic">Latest Narrative</h4>
                                            <MessageSquare className="w-5 h-5 text-primary-400" />
                                        </div>
                                        {updates.length > 0 ? (
                                            <div>
                                                <p className="text-sm italic font-medium text-gray-300 line-clamp-3 mb-6">“{updates[0].generalNotes}”</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black uppercase">{teacher?.name?.charAt(0)}</div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mentored by {teacher?.name}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No teaching updates recorded for this week.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'results' && (
                            <div className="bg-white rounded-[50px] border border-gray-100 shadow-xl overflow-hidden">
                                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Assessment Registry</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Full Academic Scored History</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="p-10">
                                    <div className="space-y-4">
                                        {results.map((res, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-white border border-gray-100 hover:border-primary-200 transition-all hover:shadow-xl hover:shadow-primary-600/5 group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black italic text-lg text-primary-600 border border-gray-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                        {Math.round((res.marksScored / res.totalMarks) * 100)}%
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 tracking-tight italic uppercase">{res.subject}</p>
                                                        <div className="flex items-center gap-2 mt-1 opacity-50">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{res.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-gray-900 tracking-tighter italic">{res.marksScored}<span className="text-gray-300">/{res.totalMarks}</span></p>
                                                    <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mt-0.5">Scored Registry</p>
                                                </div>
                                            </div>
                                        ))}
                                        {results.length === 0 && <EmptyState icon={TrendingUp} title="No Records" desc="Assessment results will appear here as soon as they are published by the class mentor." />}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 px-4">
                                    <BookOpen className="w-6 h-6 text-primary-600" />
                                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Learning Journey</h2>
                                </div>
                                <div className="space-y-8 relative">
                                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block"></div>
                                    {updates.map((upd, i) => (
                                        <div key={i} className="relative md:pl-20 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="hidden md:flex absolute left-5 top-8 w-6 h-6 bg-white border-2 border-primary-600 rounded-full items-center justify-center z-10 shadow-lg shadow-primary-600/20">
                                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                            </div>
                                            <div className="bg-white rounded-[44px] p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all hover:bg-white/50">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                                    <div>
                                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 italic">Week of {upd.createdAt?.toDate().toLocaleDateString()}</p>
                                                        <h3 className="text-2xl font-black text-gray-900 italic tracking-tight">{upd.subject || 'Unit Report'}</h3>
                                                    </div>
                                                    <div className="px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                        Milestone: {upd.chapterCompleted}
                                                    </div>
                                                </div>
                                                <p className="text-lg font-medium text-gray-500 leading-relaxed italic border-l-4 border-primary-200 pl-8 mb-8">
                                                    “{upd.generalNotes}”
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                                        <Activity className="w-5 h-5 text-primary-500" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Homework Assigned</p>
                                                            <p className="text-xs font-black text-gray-800 tracking-tight">{upd.homeworkAssigned || 'Standard Review'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-4 transition-colors">
                                                        <Target className="w-5 h-5 text-primary-600" />
                                                        <div>
                                                            <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Next Topic</p>
                                                            <p className="text-xs font-black text-primary-900 tracking-tight">{upd.nextTopic || 'Finalizing Module'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {updates.length === 0 && <EmptyState icon={BookOpen} title="Timeline Empty" desc="Milestone updates and teaching narratives will be logged here periodically." />}
                                </div>
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="bg-white rounded-[50px] p-16 border border-gray-100 shadow-xl text-center">
                                <div className="w-24 h-24 bg-primary-50 rounded-[40px] flex items-center justify-center text-primary-600 mx-auto mb-10 shadow-inner">
                                    <Clock className="w-10 h-10" />
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 italic tracking-tighter mb-4">Attendance Synchronization</h2>
                                <p className="text-gray-400 font-medium max-w-sm mx-auto mb-12 italic italic leading-relaxed">
                                    Live daily attendance logging and notifications for {selectedStudent?.name} are being calibrated. Check back soon for the visual calendar.
                                </p>
                                <div className="inline-flex items-center gap-4 px-8 py-3.5 bg-gray-50 rounded-full border border-gray-100">
                                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Feature Under Calibration</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="space-y-10">
                                <div className="flex justify-between items-center px-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 italic tracking-tight">Support Gateway</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct Communication with Institution</p>
                                    </div>
                                    <button
                                        onClick={() => setIsTicketModalOpen(true)}
                                        className="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-primary-600 transition-all flex items-center gap-3 italic"
                                    >
                                        New Inquiry <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {tickets.map((t, i) => (
                                        <div key={i} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-lg hover:border-primary-200 transition-all">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-inner ${t.status === 'open' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                        {t.status === 'open' ? '?' : '✓'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-black text-gray-900 tracking-tight italic">{t.subject}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.ticketNo}</span>
                                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{t.createdAt?.toDate().toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                    {t.status}
                                                </div>
                                            </div>
                                            <p className="text-base font-medium text-gray-500 leading-relaxed italic border-l-4 border-gray-100 pl-8">
                                                {t.message}
                                            </p>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && <EmptyState icon={LifeBuoy} title="No Inquiries" desc="Direct communications between you and the administration will be securely logged here." />}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Ticket Modal */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[60px] p-12 md:p-16 max-w-xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic leading-none mb-3">Institution Inquiry</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Type: Standard Communication</p>
                                </div>
                                <button onClick={() => setIsTicketModalOpen(false)} className="p-4 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-3xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2 italic">Subject of Communication</label>
                                    <input
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[28px] outline-none focus:border-primary-300 focus:bg-white transition-all font-black italic text-lg tracking-tight shadow-inner"
                                        placeholder="Brief summary..."
                                        value={ticketData.subject}
                                        onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2 italic">Detailed Context</label>
                                    <textarea
                                        className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[40px] outline-none focus:border-primary-300 focus:bg-white transition-all font-medium text-gray-600 min-h-[150px] italic shadow-inner"
                                        placeholder="Describe your inquiry..."
                                        value={ticketData.message}
                                        onChange={e => setTicketData({ ...ticketData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-7 bg-gray-900 text-white rounded-[40px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-600 transition-all italic flex items-center justify-center gap-4">
                                    Dispatch Inquiry <ChevronRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active, onClick, demo }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-8 py-5 rounded-[28px] transition-all group ${active ? 'bg-white shadow-xl shadow-primary-600/5 border border-primary-100' : 'hover:bg-gray-100'}`}
    >
        <div className="flex items-center gap-5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-primary-600 border border-transparent group-hover:border-gray-100 shadow-sm'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
        </div>
        {demo && (
            <div className="w-2.5 h-2.5 bg-primary-100 rounded-full"></div>
        )}
    </button>
);

const EmptyState = ({ icon: Icon, title, desc }) => (
    <div className="py-24 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center text-gray-200 mx-auto mb-8 border border-gray-50 shadow-inner">
            <Icon className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-gray-300 italic tracking-tight">{title}</h3>
        <p className="text-gray-400 font-medium text-xs max-w-[200px] mx-auto mt-2 italic leading-relaxed">{desc}</p>
    </div>
);

export default ParentDashboard;
