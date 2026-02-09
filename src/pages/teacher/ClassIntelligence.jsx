import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, getSyllabus, getWeeklyUpdates } from '../../lib/services';
import {
    Users,
    BookOpen,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    LineChart,
    ChevronDown,
    Zap,
    Target,
    Activity,
    BrainCircuit,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassIntelligence = () => {
    const { schoolId, userData } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Performance Data (Demo-Premium)
    const [stats, setStats] = useState({
        avgPerformance: 82,
        participation: 94,
        completion: 68
    });

    const [attentionStudents, setAttentionStudents] = useState([
        { id: 1, name: "Arjun Mehta", issue: "Consistent dip in Math results", class: "Class 10-A", trend: 'down' },
        { id: 2, name: "Sara Khan", issue: "Missed last 2 weekly assessments", class: "Class 10-A", trend: 'stale' },
        { id: 3, name: "David Raj", issue: "High complexity in Topic: Algebra", class: "Class 9-B", trend: 'down' },
    ]);

    useEffect(() => {
        if (schoolId) loadData();
    }, [schoolId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getClasses(schoolId);
            const filtered = data.filter(c => c.classTeacherId === userData.teacherId);
            setClasses(filtered.length > 0 ? filtered : data); // Fallback to all
            if (filtered.length > 0) setSelectedClassId(filtered[0].id);
            else if (data.length > 0) setSelectedClassId(data[0].id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const currentClass = classes.find(c => c.id === selectedClassId);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header: Class Pulse */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-200">
                            Class Intelligence Hub
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">
                        Understanding {currentClass?.name || 'Class'}
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl">
                        Deep dive into class behaviors, academic trends, and critical intervention signals.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                    <div className="relative group/select min-w-[200px]">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none appearance-none font-bold text-gray-700 focus:bg-white focus:border-primary-300 transition-all cursor-pointer"
                        >
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover/select:text-primary-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Core Class Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <VitalCard
                    label="Academic Velocity"
                    value={`${stats.avgPerformance}%`}
                    icon={TrendingUp}
                    trend="+4% from last month"
                    desc="Average across all subjects"
                    color="primary"
                />
                <VitalCard
                    label="Engagement Index"
                    value={`${stats.participation}%`}
                    icon={BrainCircuit}
                    trend="Steady"
                    desc="Participation in classroom activities"
                    color="indigo"
                />
                <VitalCard
                    label="Curriculum Coverage"
                    value={`${stats.completion}%`}
                    icon={Zap}
                    trend="On Track"
                    desc="Syllabus taught vs planned"
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Detailed Intelligence Panel */}
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Academic Trend Analysis</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Historical visibility (Last 6 Months)</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            {['6M', '3M', '1M'].map(p => (
                                <button key={p} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${p === '6M' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}>{p}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex items-end justify-between gap-2 pb-6 px-4">
                        {/* Fake Data Bars */}
                        {[65, 82, 75, 91, 78, 85].map((val, i) => (
                            <div key={i} className="flex-1 group flex flex-col items-center gap-4">
                                <div className="relative w-full flex items-end justify-center">
                                    <div
                                        style={{ height: `${val * 2}px` }}
                                        className="w-full max-w-[60px] bg-primary-100 rounded-2xl group-hover:bg-primary-600 transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100"></div>
                                    </div>
                                    <div className="hidden group-hover:block absolute -top-10 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-black shadow-xl animate-in zoom-in-90">{val}%</div>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Strongest Area</p>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50/50 border border-green-100">
                                <Target className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Topic Understanding</p>
                                    <p className="text-xs text-green-600">92% Average Understanding</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Area for Review</p>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                                <Activity className="w-8 h-8 text-orange-500" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Weekly Consistency</p>
                                    <p className="text-xs text-orange-600">Recent 15% dip in submissions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attention Signals Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Personal Intervention
                            </h3>
                            <button onClick={() => navigate('/teacher/students')} className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-widest">View Roster</button>
                        </div>
                        <div className="space-y-6">
                            {attentionStudents.map((student) => (
                                <div key={student.id} className="group p-5 rounded-2xl bg-gray-50/50 border border-transparent hover:border-red-100 hover:bg-red-50/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-red-700 transition-colors uppercase tracking-tight">{student.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{student.class}</p>
                                        </div>
                                        {student.trend === 'down' ? <ArrowDownRight className="w-5 h-5 text-red-500" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed italic border-l-2 border-red-200 pl-3">“{student.issue}”</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/teacher/students')} className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-600 transition-all shadow-xl">
                            Analyze All Patterns
                        </button>
                    </div>

                    <div className="bg-primary-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-[50px] pointer-events-none transition-transform duration-1000 group-hover:scale-150"></div>
                        <h4 className="text-xl font-bold mb-3 relative z-10 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary-200" /> Intelligence Tip
                        </h4>
                        <p className="text-xs text-primary-100 leading-relaxed font-bold relative z-10">
                            Class 10-A performs **34% better** in morning sessions. Consider scheduling complex math topics before 10 AM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VitalCard = ({ label, value, icon: Icon, trend, desc, color }) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600 border-primary-100 ring-primary-50',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-50',
        orange: 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-50',
    };

    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group hover:ring-8 transition-all duration-500 ring-transparent">
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-3xl group-hover:scale-110 transition-transform ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter truncate">{value}</h3>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${colors[color]}`}>
                        {trend}
                    </span>
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
};

export default ClassIntelligence;
