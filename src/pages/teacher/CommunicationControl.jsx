import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents } from '../../lib/services';
import {
    Eye,
    ShieldCheck,
    Bell,
    Smartphone,
    Mail,
    Lock,
    ExternalLink,
    Clock,
    CheckCircle2,
    Users,
    Info,
    Calendar,
    MessageSquare
} from 'lucide-react';

const CommunicationControl = () => {
    const { schoolId, userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (schoolId) loadData();
    }, [schoolId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getClasses(schoolId);
            const filtered = data.filter(c => c.classTeacherId === userData.teacherId);
            setClasses(filtered.length > 0 ? filtered : data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const broadcastChannelStatus = [
        { type: 'Portal', status: 'active', desc: 'Real-time academic dashboard for parents' },
        { type: 'Email', status: 'active', desc: 'Automated weekly snapshots and test alerts' },
        { type: 'Notifications', status: 'standby', desc: 'Push alerts for critical events' },
    ];

    const upcomingExams = [
        { subject: 'Mathematics', title: 'Calculus Midterm', date: 'Oct 24, 2025', visibility: 'visible' },
        { subject: 'Physics', title: 'Mechanics Quiz', date: 'Nov 02, 2025', visibility: 'hidden' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Control Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                <ShieldCheck className="absolute -top-10 -right-10 w-64 h-64 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Guardian Gateway</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-none mb-4">Communication Control</h1>
                    <p className="text-gray-400 font-medium max-w-xl">
                        Manage what parents see, when they see it, and establish clear digital boundaries.
                    </p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                        <Lock className="w-8 h-8 text-primary-400" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Privacy Lock</p>
                            <p className="text-xs font-bold text-gray-200">Active - One-Way Channel</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Channel Management */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {broadcastChannelStatus.map((chan, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-primary-200 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className={`p-4 rounded-2xl ${chan.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {chan.type === 'Portal' ? <Smartphone className="w-6 h-6" /> : chan.type === 'Email' ? <Mail className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${chan.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                    {chan.status}
                                </div>
                            </div>
                            <h3 className="font-black text-lg text-gray-900">{chan.type} Pipeline</h3>
                            <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{chan.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Visibility Controls */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Parent-Visible Components</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Control active features in the parent portal</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                <Info className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Policy</span>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            <VisibilityToggle label="Academic Dashboards" status={true} desc="Allow parents to see grade trends and averages." />
                            <VisibilityToggle label="Attendance Status" status={true} desc="Show real-time physical presence indicators." />
                            <VisibilityToggle label="Weekly Teaching Narratives" status={true} desc="Display your weekly summaries and notes." />
                            <VisibilityToggle label="Student Personal Weaknesses" status={false} desc="Hide granular topic weaknesses until teacher review." />
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
                        <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" /> Exam Schedule Visibility
                        </h3>
                        <div className="space-y-4">
                            {upcomingExams.map((exam, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[24px] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:border-indigo-100 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner text-gray-400 group-hover:text-indigo-600 transition-colors">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">{exam.subject}</p>
                                            <p className="font-bold text-gray-900">{exam.title}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{exam.date}</p>
                                        </div>
                                    </div>
                                    <button className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${exam.visibility === 'visible' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 hover:bg-indigo-600 hover:text-white'}`}>
                                        {exam.visibility === 'visible' ? 'Visible to Parents' : 'Make Visible'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Guidance & Boundaries Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative h-full">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                            <MessageSquare className="w-7 h-7" />
                        </div>
                        <h4 className="text-2xl font-black tracking-tight mb-4">Teacher's Tip: Boundary Setting</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <CheckCircle2 className="w-5 h-5 text-indigo-200 flex-shrink-0" />
                                <p className="text-xs text-indigo-100 font-medium leading-relaxed italic">“Use Weekly Narratives to answer questions BEFORE they are asked.”</p>
                            </div>
                            <div className="flex gap-4">
                                <CheckCircle2 className="w-5 h-5 text-indigo-200 flex-shrink-0" />
                                <p className="text-xs text-indigo-100 font-medium leading-relaxed italic">“Batch notifications to Friday evenings for better parent engagement.”</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            Active Monitors <Eye className="w-4 h-4" />
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-600">Avg. Weekly Reads</span>
                                <span className="text-sm font-black text-gray-900">124</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-600">Open Rate</span>
                                <span className="text-sm font-black text-emerald-600">82%</span>
                            </div>
                            <button className="w-full mt-6 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-500 tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                Activity Log <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VisibilityToggle = ({ label, status, desc }) => (
    <div className="flex items-start justify-between p-6 rounded-[28px] bg-gray-50/30 border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
        <div className="flex-1 pr-8">
            <h4 className="font-bold text-gray-900 text-lg mb-1">{label}</h4>
            <p className="text-xs text-gray-400 font-medium">{desc}</p>
        </div>
        <div className={`w-14 h-7 rounded-full relative p-1 transition-all cursor-pointer ${status ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${status ? 'translate-x-7' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

export default CommunicationControl;
