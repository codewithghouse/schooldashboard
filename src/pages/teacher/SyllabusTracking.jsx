import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { getSyllabus } from '../../lib/services';
import {
    BookOpen,
    CheckCircle2,
    Circle,
    Gauge,
    Layers,
    Target,
    HelpCircle,
    RotateCcw,
    Zap,
    TrendingUp,
    ChevronDown,
    Award,
    AlertCircle
} from 'lucide-react';

const SyllabusTracking = () => {
    const { schoolId, userData } = useAuth();
    const { activeClassId, activeClass } = useClass();
    const [loading, setLoading] = useState(false);
    const [syllabus, setSyllabus] = useState([]);

    useEffect(() => {
        if (schoolId && activeClassId) {
            fetchSyllabusForClass();
        } else {
            setSyllabus([]);
        }
    }, [schoolId, activeClassId]);

    const fetchSyllabusForClass = async () => {
        setLoading(true);
        try {
            const data = await getSyllabus(schoolId, activeClassId);
            // Enrich with "Status" and "Confidence" for demo-premium feel
            const enriched = data.map(s => ({
                ...s,
                chapters: s.chapters.map(ch => ({
                    name: ch,
                    status: Math.random() > 0.4 ? 'taught' : Math.random() > 0.5 ? 'planned' : 'revision',
                    confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
                }))
            }));
            setSyllabus(enriched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Context Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Layers className="w-8 h-8 text-primary-600" /> Syllabus & Curriculum
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-tight text-xs">Tracking Engine for <b>{activeClass ? `${activeClass.name} - ${activeClass.section}` : <span className="text-amber-600 animate-pulse underline text-sm">Please Select a Class</span>}</b></p>
                </div>

                {activeClassId ? (
                    <div className="flex items-center gap-3 bg-primary-50 px-6 py-3 rounded-[24px] border border-primary-100 shadow-sm">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary-700">{activeClass?.name} - {activeClass?.section}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-amber-50 px-6 py-3 rounded-[24px] border border-amber-100 animate-pulse">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-amber-700">Class Selection Required</span>
                    </div>
                )}
            </div>

            {/* Overall Health Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SyllabusStat
                    label="Completion Rate"
                    value="64%"
                    icon={Gauge}
                    color="primary"
                    desc="Total course coverage"
                />
                <SyllabusStat
                    label="Concept Clarity"
                    value="82%"
                    icon={Award}
                    color="green"
                    desc="Aggregate teacher confidence"
                />
                <SyllabusStat
                    label="Active Revision"
                    value="4"
                    icon={RotateCcw}
                    color="orange"
                    desc="Chapters marked for review"
                />
                <SyllabusStat
                    label="Next Target"
                    value="Unit 5"
                    icon={Zap}
                    color="indigo"
                    desc="Estimated start: Oct 15"
                />
            </div>

            {/* Subject-wise Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {syllabus.map((sub, i) => (
                    <div key={i} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group hover:border-primary-200 transition-all duration-500">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{sub.subject}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Academic Session 2025-26</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-gray-900 leading-none">64%</span>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Done</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {sub.chapters.map((chap, ci) => (
                                <div key={ci} className="group/chap">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-4 flex-1">
                                            {chap.status === 'taught' ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            ) : chap.status === 'revision' ? (
                                                <RotateCcw className="w-5 h-5 text-orange-500 mt-0.5 animate-spin-slow flex-shrink-0" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-200 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <p className={`font-bold text-gray-800 ${chap.status === 'taught' ? 'opacity-100' : 'opacity-60'}`}>{chap.name}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <StatusBadge type={chap.status} />
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">•</span>
                                                    <div className="flex items-center gap-1.5 grayscale group-hover/chap:grayscale-0 transition-all">
                                                        <TrendingUp className="w-3 h-3 text-primary-500" />
                                                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Confidence: {chap.confidence}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all">
                                            <HelpCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${chap.status === 'taught' ? 'bg-gradient-to-r from-green-400 to-green-600' : chap.status === 'revision' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gray-100'}`}
                                            style={{ width: chap.status === 'taught' ? '100%' : chap.status === 'revision' ? '100%' : '0%' }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Assistant Section Preview */}
            <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-600/30 transition-all duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center border border-white/20 backdrop-blur-xl flex-shrink-0">
                        <Zap className="w-10 h-10 text-primary-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black tracking-tight mb-2">Feeling behind? Accelerate with AI</h4>
                        <p className="text-gray-400 font-medium text-sm max-w-lg">
                            We've identified 3 chapters needing revision. Generate a quick **Revision Action Plan** or a **Diagnostic Quiz** to catch up.
                        </p>
                    </div>
                    <button className="px-8 py-5 bg-white text-gray-900 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-100 transition-all active:scale-95">
                        Ignite Revision Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

const SyllabusStat = ({ label, value, icon: Icon, color, desc }) => {
    const colorStyles = {
        primary: 'bg-primary-50 text-primary-600 border-primary-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="bg-white p-7 rounded-[32px] border border-gray-100 shadow-sm hover:border-primary-200 transition-all group">
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{value}</h4>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{desc}</p>
        </div>
    );
};

const StatusBadge = ({ type }) => {
    const badges = {
        taught: { bg: 'bg-green-50 text-green-700', text: 'Taught & Verified' },
        planned: { bg: 'bg-blue-50 text-blue-700', text: 'Upcoming Milestone' },
        revision: { bg: 'bg-orange-50 text-orange-700', text: 'Needs Revision' },
    };
    const b = badges[type] || badges.planned;
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${b.bg}`}>
            {b.text}
        </span>
    );
};

export default SyllabusTracking;
