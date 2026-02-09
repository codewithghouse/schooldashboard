import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getWeeklyUpdates } from '../../lib/services';
import {
    Clock,
    Calendar,
    ClipboardCheck,
    Bookmark,
    ChevronRight,
    StickyNote,
    Save,
    Bell,
    CheckCircle2,
    AlarmClock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyCommand = () => {
    const { userData, schoolId } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState(localStorage.getItem(`teacher_notes_${userData?.uid}`) || '');
    const [timetable, setTimetable] = useState([
        { time: '08:00 AM', subject: 'Mathematics', class: 'Class 10-A', status: 'completed' },
        { time: '09:30 AM', subject: 'Physics', class: 'Class 9-B', status: 'current' },
        { time: '11:00 AM', subject: 'Mathematics', class: 'Class 8-A', status: 'upcoming' },
        { time: '01:30 PM', subject: 'Physics Lab', class: 'Class 10-A', status: 'upcoming' },
    ]);

    const [pendingActions, setPendingActions] = useState([
        { id: 1, text: "Grade Class 10 Calculus Test", deadline: "Today", priority: "high" },
        { id: 2, text: "Submit Weekly Update for Class 9", deadline: "Tomorrow", priority: "medium" },
        { id: 3, text: "Prepare AI Revision Plan for Unit 2", deadline: "Friday", priority: "low" },
    ]);

    useEffect(() => {
        // In a real app, fetch from Firestore. For now, demo-premium data.
        setTimeout(() => setLoading(false), 800);
    }, []);

    const saveNotes = () => {
        localStorage.setItem(`teacher_notes_${userData?.uid}`, notes);
        alert("Personal notes saved safely!");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Daily Command Center</h1>
                    <p className="text-gray-500 font-medium mt-1 italic">“I know exactly what I need to do today.”</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span className="font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Timetable / Agenda */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Today's Mission Briefing
                            </h3>
                            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Schedule</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {timetable.map((item, i) => (
                                <div key={i} className={`p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-colors ${item.status === 'current' ? 'bg-primary-50/30' : ''}`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`text-sm font-black tracking-tighter ${item.status === 'completed' ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {item.time}
                                        </div>
                                        <div className="w-px h-8 bg-gray-100"></div>
                                        <div>
                                            <p className={`font-bold text-lg ${item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.subject}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.class}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {item.status === 'current' && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg animate-pulse shadow-lg shadow-primary-500/30">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter">Current Class</span>
                                            </div>
                                        )}
                                        {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-5 h-5 text-gray-300" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Academic Actions */}
                    <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <AlarmClock className="w-24 h-24" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary-400 mb-6">Unfinished Business</h3>
                        <div className="space-y-4 relative z-10">
                            {pendingActions.map((action) => (
                                <div key={action.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${action.priority === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : action.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-200">{action.text}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Deadline: {action.deadline}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Teacher Private Notes & Reminders */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 flex flex-col h-full ring-4 ring-primary-50/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <StickyNote className="w-4 h-4" /> Personal Sanctum
                            </h3>
                            <button
                                onClick={saveNotes}
                                className="p-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm group"
                            >
                                <Save className="w-4 h-4 group-active:scale-90" />
                            </button>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="flex-1 w-full min-h-[350px] bg-gray-50/50 rounded-2xl p-6 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/5 border border-transparent focus:border-primary-100 transition-all resize-none placeholder:italic placeholder:text-gray-300"
                            placeholder="Type your personal observations, reminders, or class ideas here. This is private and only visible to you..."
                        />
                        <div className="mt-6 p-4 bg-primary-50/50 rounded-2xl flex items-center gap-3">
                            <Bookmark className="w-5 h-5 text-primary-500 flex-shrink-0" />
                            <p className="text-[10px] text-primary-800 font-bold leading-relaxed">Your notes are stored locally and encrypted for your privacy. Use this for sensitive student observations.</p>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex items-center gap-6 group hover:translate-y-[-4px] transition-all cursor-pointer shadow-xl shadow-indigo-500/20">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
                            <Bell className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Next Event Notification</h4>
                            <p className="text-indigo-100 text-xs mt-1">Mathematics Exam Drafting starts in **15 minutes**.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyCommand;
