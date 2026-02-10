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
    MessageSquare
} from 'lucide-react';

const ParentDashboard = () => {
    const { user, userData } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schoolInfo, setSchoolInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [classInfo, setClassInfo] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user?.email) return;
            try {
                const myStudents = await getMyStudents(user.email, user.uid);
                setStudents(myStudents);
                if (myStudents.length > 0) {
                    setSelectedStudent(myStudents[0]);
                }
                if (userData?.schoolId) {
                    const school = await getSchool(userData.schoolId);
                    setSchoolInfo(school);
                }
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [user, userData]);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentDetail();
        }
    }, [selectedStudent]);

    const loadStudentDetail = async () => {
        if (!selectedStudent) return;
        try {
            const [stdResults, stdUpdates, stdClass] = await Promise.all([
                getStudentResults(selectedStudent.id),
                getWeeklyUpdates(userData.schoolId, selectedStudent.classId),
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

    // Helper: Calculate subject-wise performance
    const getPerformanceBySubject = () => {
        const subjects = {};
        results.forEach(res => {
            // Since results don't have subject directly, we'd ideally fetch 'test' details
            // For now, let's assume we might have 'subject' in result or we can group by test metadata
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

    // Helper: Get Focus areas (Weak Topics aggregated from results)
    const getFocusAreas = () => {
        const topics = new Set();
        results.forEach(res => {
            if (res.weakTopics) res.weakTopics.forEach(t => topics.add(t));
        });
        return Array.from(topics).slice(0, 5);
    };

    const subjectPerformance = getPerformanceBySubject();
    const focusAreas = getFocusAreas();

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            {/* Context Switcher & Child Identity */}
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                <div className="flex gap-4 p-2 bg-gray-100/50 rounded-[32px] border border-gray-100">
                    {students.map(std => (
                        <button
                            key={std.id}
                            onClick={() => setSelectedStudent(std)}
                            className={`px-6 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${selectedStudent?.id === std.id ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {std.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{schoolInfo?.name || 'AcademiVis Portal'}</span>
                </div>
            </div>

            {/* Profile Hero Section */}
            <div className="bg-white rounded-[60px] p-12 md:p-16 border border-gray-100 shadow-2xl shadow-indigo-900/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-60"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-12 xl:col-span-8">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Profile: {selectedStudent?.grade} – {selectedStudent?.section}</span>
                            <span className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <Activity className="w-4 h-4 text-green-500" /> Academic Health: Good
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter italic leading-none mb-6">
                            {selectedStudent?.name}
                        </h1>
                        <p className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed italic">
                            “Transparency creates trust. Tracking growth through unit milestones and teacher narratives.”
                        </p>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-4">
                        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Class Mentor</h4>
                                <UserCheck className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm text-2xl font-black text-indigo-600">
                                    {teacher?.name?.substring(0, 1) || 'T'}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-lg font-black text-gray-900 tracking-tight italic">{teacher?.name || 'Teacher Link Pending'}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Lead</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase text-gray-500 tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                                Request Insight <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Intelligence: Performance */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight italic flex items-center gap-3">
                                    <TrendingUp className="w-7 h-7 text-indigo-600" /> Subject Performance
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Milestone Achievement Index</p>
                            </div>
                            <div className="px-5 py-2.5 bg-indigo-50 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">
                                Current Term Analysis
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {subjectPerformance.length > 0 ? subjectPerformance.map((sub, i) => (
                                <div key={i} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 tracking-tight italic">{sub.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">Consistency Index</p>
                                        </div>
                                        <span className={`text-xl font-black italic tracking-tighter ${sub.percentage > 75 ? 'text-green-600' : 'text-indigo-600'}`}>
                                            {sub.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${sub.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="col-span-2 text-center py-10 text-gray-400 italic font-medium">No assessment data processed for this term yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Timeline Updates */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight italic flex items-center gap-3">
                                <Activity className="w-6 h-6 text-indigo-600" /> Weekly Context Timeline
                            </h3>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">View Full History</button>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {updates.slice(0, 3).map((upd, i) => (
                                <div key={i} className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start group hover:border-indigo-100 transition-all">
                                    <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-2xl flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-gray-400">
                                        <Calendar className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">W. {i + 1}</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <h4 className="text-2xl font-black text-gray-900 tracking-tight italic">{upd.subject || 'Unit Report'}</h4>
                                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{upd.chapterCompleted}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                                            “{upd.generalNotes || 'Teaching narratives not provided for this period.'}”
                                        </p>
                                        <div className="pt-4 flex flex-wrap gap-4">
                                            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Homework: {upd.homeworkAssigned || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {updates.length === 0 && (
                                <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-100 p-20 text-center opacity-40">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-black italic uppercase text-lg">No narratives uploaded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Tactical Intelligence */}
                <div className="lg:col-span-4 space-y-10">
                    {/* WIDGET: Academic Focus */}
                    <div className="bg-gray-900 rounded-[50px] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-400 mb-8 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Academic Focus Areas
                        </h4>
                        <div className="space-y-6">
                            {focusAreas.length > 0 ? focusAreas.map((area, i) => (
                                <div key={i} className="flex gap-4 group/item">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary-600 transition-colors">
                                        <Hash className="w-4 h-4 text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black tracking-tight group-hover/item:text-primary-400 transition-colors">{area}</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recommended Focus</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center space-y-4 opacity-40">
                                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-400" />
                                    <p className="text-xs font-black uppercase tracking-widest italic leading-relaxed">System scan reveals no significant focus gaps.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-10 pt-10 border-t border-white/5">
                            <button className="w-full py-5 bg-white text-gray-900 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-primary-400 transition-all flex items-center justify-center gap-2 italic">
                                Learning Hub <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* WIDGET: Term Results Registry */}
                    <div className="bg-white rounded-[44px] border border-gray-100 shadow-lg p-10">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center justify-between">
                            Assessment Registry
                            <span className="text-indigo-600">{results.length} Scored Units</span>
                        </h4>
                        <div className="space-y-6">
                            {results.slice(0, 5).map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-xs ${Number(res.marksScored) / Number(res.totalMarks) > 0.8 ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {Math.round((Number(res.marksScored) / Number(res.totalMarks)) * 100)}%
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 tracking-tight italic uppercase">{res.subject || 'Test ID: ' + res.id.substring(0, 4)}</p>
                                            <p className="text-[9px] text-gray-400 font-bold tracking-widest">{res.createdAt?.toDate().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-900">{res.marksScored}<span className="text-gray-400">/{res.totalMarks}</span></p>
                                    </div>
                                </div>
                            ))}
                            {results.length === 0 && (
                                <div className="text-center py-12 opacity-30 italic font-medium text-xs">Waiting for assessment results...</div>
                            )}
                        </div>
                        <button className="w-full mt-10 py-5 bg-white border border-gray-100 rounded-[28px] text-[10px] font-black uppercase text-gray-400 tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2">
                            Detailed Report Card <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
