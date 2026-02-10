import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getMyStudents,
    getSchool,
    getStudentResults,
    getWeeklyUpdates,
    getTeacher,
    getClass
} from '../../lib/services';
import {
    Users,
    Building2,
    BookOpen,
    GraduationCap,
    Loader2,
    Calendar,
    Award,
    ChevronRight,
    ArrowRight,
    TrendingUp,
    Target,
    Activity,
    UserCheck,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Hash,
    MessageSquare,
    Zap,
    Clock
} from 'lucide-react';

const ParentDashboard = () => {
    const { user, userData, schoolId: authSchoolId } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [classInfo, setClassInfo] = useState(null);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Synchronizing Child Intelligence...</p>
            </div>
        );
    }

    const subjectPerformance = getPerformanceBySubject(results);
    const focusAreas = getFocusAreas(results);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-4 md:px-0">

            {/* Header: Child Selector & Identity */}
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="flex gap-4 p-2 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                    {students.map(std => (
                        <button
                            key={std.id}
                            onClick={() => setSelectedStudent(std)}
                            className={`px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${selectedStudent?.id === std.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            {std.name}
                        </button>
                    ))}
                    {students.length === 0 && (
                        <p className="px-6 py-4 text-xs font-bold text-gray-400">No linked student records found.</p>
                    )}
                </div>
                <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[32px] border border-gray-100 shadow-sm">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Institution</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">{schoolInfo?.name || 'AcademiVis School'}</p>
                    </div>
                </div>
            </div>

            {/* Profile & Mentor Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white rounded-[50px] p-12 md:p-16 border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Grade {selectedStudent?.grade} – {selectedStudent?.section}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Enrollment</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic leading-none mb-4">
                            {selectedStudent?.name}
                        </h1>
                        <p className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed italic">
                            “Monitoring every milestone. Transparent access to academic growth and teacher observations.”
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-gray-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-10 flex items-center gap-3">
                        <UserCheck className="w-5 h-5" /> Class Mentor
                    </h4>

                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-20 h-20 bg-white/10 rounded-[30px] border border-white/10 flex items-center justify-center text-3xl font-black text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                            {teacher?.name?.substring(0, 1) || 'T'}
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black tracking-tight italic">{teacher?.name || 'Assigned Soon'}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Lead Educator</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full py-5 bg-white text-gray-900 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-400 transition-all flex items-center justify-center gap-3 italic">
                            Contact Teacher <MessageSquare className="w-4 h-4" />
                        </button>
                        <p className="text-[9px] text-gray-500 text-center font-bold uppercase tracking-widest">Secure internal gateway active</p>
                    </div>
                </div>
            </div>

            {/* Modular Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Section 1: Subject Performance (Left Main) */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white rounded-[50px] border border-gray-100 shadow-lg p-12 hover:border-indigo-100 transition-all">
                        <SectionHeader
                            icon={TrendingUp}
                            title="Subject Analytics"
                            label="Historical Milestone Performance"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                            {subjectPerformance.length > 0 ? subjectPerformance.map((sub, i) => (
                                <PerformanceBar key={i} name={sub.name} percentage={sub.percentage} />
                            )) : (
                                <EmptyState message="No performance metrics recorded yet." icon={TrendingUp} />
                            )}
                        </div>
                    </div>

                    {/* Section 2: Weekly Narratives (Timeline) */}
                    <div className="bg-white rounded-[50px] border border-gray-100 shadow-lg p-12 hover:border-emerald-100 transition-all">
                        <SectionHeader
                            icon={Activity}
                            title="Learning Narratives"
                            label="Teacher Observations & Weekly Progress"
                        />
                        <div className="space-y-8">
                            {updates.length > 0 ? updates.slice(0, 4).map((upd, i) => (
                                <UpdateCard key={i} update={upd} index={updates.length - i} />
                            )) : (
                                <EmptyState message="No narratives provided for this period." icon={BookOpen} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Growth & Results (Right Sidebar) */}
                <div className="lg:col-span-4 space-y-10">

                    {/* Focus Targets */}
                    <div className="bg-gray-50 rounded-[50px] border border-gray-100 p-10 group">
                        <SectionHeader
                            icon={Target}
                            title="Growth Points"
                            label="Personalized Focus Areas"
                        />
                        <div className="space-y-6 mt-10">
                            {focusAreas.length > 0 ? focusAreas.map((area, i) => (
                                <FocusArea key={i} title={area} />
                            )) : (
                                <div className="py-12 bg-white rounded-3xl text-center border border-dashed border-gray-200">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                                    <p className="text-[10px] font-black uppercase text-gray-400">Everything looks solid.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <MiniStat
                            icon={Zap}
                            label="Tests Taken"
                            value={results.length}
                            color="indigo"
                        />
                        <MiniStat
                            icon={Award}
                            label="Consistency"
                            value="High"
                            color="green"
                        />
                    </div>

                    {/* Assessment Registry */}
                    <div className="bg-white rounded-[50px] border border-gray-100 shadow-xl p-10">
                        <SectionHeader
                            icon={Hash}
                            title="Assessment Registry"
                            label="Unit-wise Scored Records"
                        />
                        <div className="space-y-4 mt-8">
                            {results.slice(0, 6).map((res, i) => (
                                <ResultRow key={i} result={res} />
                            ))}
                            {results.length === 0 && <p className="text-center py-10 text-xs italic text-gray-400 uppercase font-black">Waiting for results...</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components for Modularity ---

const SectionHeader = ({ icon: Icon, title, label }) => (
    <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight italic leading-none">{title}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    </div>
);

const PerformanceBar = ({ name, percentage }) => (
    <div className="group">
        <div className="flex justify-between items-end mb-4 px-1">
            <div>
                <p className="text-sm font-black text-gray-900 tracking-tight italic uppercase">{name}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Course Completion</p>
            </div>
            <span className={`text-2xl font-black italic tracking-tighter ${percentage > 75 ? 'text-green-600' : 'text-indigo-600'}`}>
                {percentage}%
            </span>
        </div>
        <div className="w-full h-3.5 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100">
            <div
                className="h-full bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    </div>
);

const UpdateCard = ({ update, index }) => (
    <div className="flex gap-8 group">
        <div className="hidden md:flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <Calendar className="w-5 h-5" />
            </div>
            <div className="w-0.5 flex-1 bg-gray-50 my-2"></div>
        </div>
        <div className="flex-1 bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 hover:border-indigo-200 transition-all hover:bg-white hover:shadow-xl group-hover:-translate-y-1 duration-500 relative">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight italic">{update.subject || 'Unit Summary'}</h4>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{update.createdAt?.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                    Unit: {update.chapterCompleted}
                </div>
            </div>
            <p className="text-md font-medium text-gray-500 leading-relaxed italic border-l-4 border-indigo-200 pl-6 mb-8">
                “{update.generalNotes || 'Academic narratives for this milestone are being finalized.'}”
            </p>
            <div className="flex flex-wrap gap-4">
                <Badge icon={Sparkles} text={`Tasked: ${update.homeworkAssigned || 'Standard Review'}`} />
                {update.nextTopic && <Badge icon={ArrowRight} text={`Upcoming: ${update.nextTopic}`} />}
            </div>
        </div>
    </div>
);

const Badge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Icon className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[150px]">{text}</span>
    </div>
);

const FocusArea = ({ title }) => (
    <div className="flex gap-5 group items-center bg-white p-5 rounded-3xl border border-gray-100 hover:border-indigo-300 transition-all cursor-default">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Hash className="w-4 h-4" />
        </div>
        <div>
            <p className="text-lg font-black tracking-tight italic text-gray-900 leading-none">{title}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Topic identified for reinforcement</p>
        </div>
    </div>
);

const MiniStat = ({ icon: Icon, label, value, color }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        green: 'bg-green-50 text-green-600 border-green-100',
    };
    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className={`p-3 rounded-xl mb-4 ${colors[color]} border`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">{value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
};

const ResultRow = ({ result }) => (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-sm ${Number(result.marksScored) / Number(result.totalMarks) > 0.8 ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                {Math.round((Number(result.marksScored) / Number(result.totalMarks)) * 100)}%
            </div>
            <div>
                <p className="text-xs font-black text-gray-900 tracking-tight italic uppercase">{result.subject || 'Unit Registry'}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest">{result.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-black text-gray-900">{result.marksScored}<span className="text-gray-400">/{result.totalMarks}</span></p>
            <p className="text-[8px] font-black text-indigo-400 uppercase mt-0.5 tracking-tighter italic">Log ID: {result.id.substring(0, 4)}</p>
        </div>
    </div>
);

const EmptyState = ({ message, icon: Icon }) => (
    <div className="col-span-full py-20 text-center opacity-30 italic font-medium flex flex-col items-center gap-4">
        <Icon className="w-16 h-16" />
        <p className="text-xl font-bold uppercase tracking-[0.2em]">{message}</p>
    </div>
);

// --- Helpers ---

const getPerformanceBySubject = (results) => {
    const subjects = {};
    results.forEach(res => {
        const sub = res.subject || 'Assessments';
        if (!subjects[sub]) subjects[sub] = { total: 0, marks: 0, count: 0 };
        subjects[sub].total += Number(res.totalMarks || 0);
        subjects[sub].marks += Number(res.marksScored || 0);
        subjects[sub].count += 1;
    });
    return Object.entries(subjects).map(([name, data]) => ({
        name,
        percentage: data.total > 0 ? Math.round((data.marks / data.total) * 100) : 0
    }));
};

const getFocusAreas = (results) => {
    const topics = new Set();
    results.forEach(res => {
        if (res.weakTopics) res.weakTopics.forEach(t => topics.add(t));
    });
    return Array.from(topics).slice(0, 5);
};

export default ParentDashboard;
