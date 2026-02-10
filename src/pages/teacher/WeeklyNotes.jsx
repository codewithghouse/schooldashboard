import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { getSyllabus, addWeeklyUpdate } from '../../lib/services';
import {
    ClipboardList,
    Send,
    Zap,
    Eye,
    CheckCircle2,
    ChevronRight,
    MessageSquare,
    AlertCircle,
    Loader2,
    Calendar,
    PenTool,
    BookOpen
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const WeeklyNotes = () => {
    const { schoolId, userData } = useAuth();
    const { myClasses, activeClassId, activeClass } = useClass();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [syllabus, setSyllabus] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);

    const { register, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            subject: '',
            chapterCompleted: '',
            homeworkAssigned: '',
            generalNotes: '',
            classHealth: 'good'
        }
    });

    const formData = watch();

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
            setSyllabus(data);
            if (data.length > 0) setValue('subject', data[0].subject);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!activeClassId) return;
        setSubmitting(true);
        try {
            await addWeeklyUpdate({
                ...data,
                schoolId,
                teacherId: userData.teacherId,
                teacherName: userData.name,
                classId: activeClassId,
            });
            alert("Weekly report dispatched to parents successfully!");
            reset();
            setPreviewMode(false);
        } catch (error) {
            console.error(error);
            alert("Failed to dispatch update.");
        } finally {
            setSubmitting(false);
        }
    };

    const autoFillFromSyllabus = () => {
        if (!formData.subject) return;
        const sub = syllabus.find(s => s.subject === formData.subject);
        if (sub && sub.chapters.length > 0) {
            setValue('chapterCompleted', sub.chapters[0]); // Simple auto-fill first chapter
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Weekly Progress Portal</h1>
                    <p className="text-gray-500 font-medium mt-1 italic">“Keep families in the loop, without the mental fatigue.”</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Week 42 • Oct 2025</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Reporting Engine */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">

                        {/* Sidebar Form Controls */}
                        <div className="md:w-80 bg-gray-50/50 border-r border-gray-100 p-10 space-y-8 relative">
                            {!activeClassId && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-tight">Class Required</p>
                                    <p className="text-[10px] text-gray-500 font-medium mt-2">Please select a class from the top bar to continue.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Target Class</label>
                                <div className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl font-black text-sm shadow-sm flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    {activeClass ? `${activeClass.name} - ${activeClass.section}` : 'None Selected'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Academic Health</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['good', 'average', 'needs_attention'].map((h) => (
                                        <button
                                            key={h}
                                            onClick={() => setValue('classHealth', h)}
                                            className={`px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all text-left flex items-center justify-between group ${formData.classHealth === h ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'}`}
                                        >
                                            {h.replace('_', ' ')}
                                            {formData.classHealth === h && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Quick Efficiency
                                </p>
                                <p className="text-[10px] text-indigo-600 font-medium leading-relaxed">System has detected **Unit 4** as likely completion for this week based on your calendar.</p>
                                <button
                                    onClick={autoFillFromSyllabus}
                                    className="mt-3 text-[9px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                                >
                                    Auto-Fill Details
                                </button>
                            </div>
                        </div>

                        {/* Primary Content Entry */}
                        <div className="flex-1 p-10 md:p-14">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-2xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teaching Subject</label>
                                        <select
                                            {...register('subject', { required: true })}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-sm focus:bg-white focus:border-indigo-300 transition-all"
                                        >
                                            <option value="">Select Subject...</option>
                                            {syllabus.map(s => <option key={s.id} value={s.subject}>{s.subject}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chapter/Topic Mastery</label>
                                        <select
                                            {...register('chapterCompleted', { required: true })}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-sm focus:bg-white focus:border-indigo-300 transition-all"
                                        >
                                            <option value="">Select Chapter...</option>
                                            {syllabus.find(s => s.subject === formData.subject)?.chapters?.map((chap, idx) => (
                                                <option key={idx} value={chap}>{chap}</option>
                                            ))}
                                            <option value="Custom Topic">-- Manual Topic (Add to notes) --</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Homework Delegation</label>
                                    <input
                                        {...register('homeworkAssigned')}
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-sm focus:bg-white focus:border-indigo-300 transition-all"
                                        placeholder="Specific task for the weekend..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Narrative (The Story)</label>
                                    <textarea
                                        {...register('generalNotes')}
                                        className="w-full min-h-[180px] px-6 py-5 bg-gray-50 rounded-[32px] border border-gray-100 outline-none font-medium text-sm focus:bg-white focus:border-indigo-300 transition-all resize-none placeholder:italic"
                                        placeholder="Briefly describe the classroom vibe and learning milestones this week..."
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(true)}
                                        className="flex-1 px-8 py-5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Eye className="w-5 h-5" /> Parent View
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Dispatch Report</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent-Visible Preview Modal */}
            {previewMode && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-indigo-600 p-10 text-white relative">
                            <div className="absolute top-10 right-10">
                                <button onClick={() => setPreviewMode(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <Send className="w-5 h-5 rotate-45" />
                                </button>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Parent Portal Preview</p>
                            <h3 className="text-3xl font-black tracking-tight">{formData.subject || 'Weekly Update'}</h3>
                            <p className="text-indigo-100 font-medium mt-1">Sent by Teacher {userData.name}</p>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4 py-4 px-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic Mastery</p>
                                    <p className="font-bold text-gray-900">{formData.chapterCompleted || 'Not Specified'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Learning Narrative</p>
                                <p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-3xl italic">
                                    “{formData.generalNotes || 'No notes provided for this week.'}”
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Weekend Homework</p>
                                <p className="text-sm font-bold text-indigo-700 bg-indigo-50/50 p-4 rounded-2xl border border-dashed border-indigo-200">
                                    {formData.homeworkAssigned || 'No specific homework for this week.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setPreviewMode(false)}
                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all"
                            >
                                Looks Good, Continue Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyNotes;
