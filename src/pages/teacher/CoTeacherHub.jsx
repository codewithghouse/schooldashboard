import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    FileText,
    Lightbulb,
    Save,
    Send,
    Plus,
    Trash2,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    FileUp,
    Layout
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { generateAIContent, uploadToCloudinary } from '../../lib/aiService';
import { saveAIContent, getAIContent, updateAIStatus, deleteAIContent } from '../../lib/services';

const CoTeacherHub = () => {
    const { userData, schoolId } = useAuth();
    const { activeClassId, myClasses } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'drafts'
    const [drafts, setDrafts] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        board: 'CBSE',
        grade: '10',
        subject: 'Science',
        topic: '',
        instructions: '',
        mode: 'AI', // 'AI' or 'Manual'
        type: 'quiz' // 'quiz', 'lesson', 'weak_topics'
    });

    // AI Output State
    const [aiResult, setAiResult] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (schoolId && userData?.teacherId) {
            fetchDrafts();
        }
    }, [schoolId, userData, activeClassId]);

    const fetchDrafts = async () => {
        try {
            const data = await getAIContent(schoolId, userData.teacherId);
            // Filter by active class for focused view
            const filtered = data.filter(d => d.classId === activeClassId || d.classId === 'all');
            setDrafts(filtered);
        } catch (err) {
            console.error("Failed to fetch drafts", err);
        }
    };

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setUploading(true);
        try {
            const result = await uploadToCloudinary(selectedFile);
            setFile(result);
        } catch (err) {
            alert("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!formData.topic) return alert("Please enter a topic");
        if (!activeClassId) return;

        setLoading(true);
        try {
            const result = await generateAIContent({
                ...formData,
                pdfUrl: file?.url,
                teacherInstructions: formData.instructions,
                classId: activeClassId,
                teacherId: userData.teacherId,
                schoolId: schoolId
            });
            setAiResult(result);
        } catch (err) {
            console.error("AI Generation failed:", err);
            alert(`AI Generation failed: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publish = false) => {
        if (!aiResult) return;

        setLoading(true);
        try {
            const payload = {
                schoolId,
                teacherId: userData.teacherId,
                classId: activeClassId, // Linked to real class
                subject: formData.subject,
                topic: formData.topic,
                type: formData.type,
                content: aiResult,
                generatedBy: formData.mode === 'AI' ? 'ai' : 'teacher',
                draft: !publish,
                approvedByTeacher: publish,
            };

            await saveAIContent(payload);
            alert(publish ? "Content Published Successfully! Parents and Students can now view this." : "Draft Saved Successfully!");
            setAiResult(null);
            fetchDrafts();
            if (publish) setActiveTab('drafts');
        } catch (err) {
            alert("Failed to save content");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateResult = (updatedContent) => {
        setAiResult(updatedContent);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 font-sans pb-20">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-200">
                            AI Intelligence Engine
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4 flex items-center gap-4">
                        <Sparkles className="w-10 h-10 text-primary-600 animate-pulse" /> Co-Teacher AI Hub
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl">
                        Generate class-specific quizzes, lesson plans, and revision diagnostic tools.
                    </p>
                </div>

                <div className="flex bg-gray-50 p-2 rounded-[24px] border border-gray-100 relative z-10">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-8 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white text-primary-600 shadow-xl shadow-primary-600/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Create Content
                    </button>
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={`px-8 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'drafts' ? 'bg-white text-primary-600 shadow-xl shadow-primary-600/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Draft Library ({drafts.length})
                    </button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Input Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
                                <Layout className="w-4 h-4 text-primary-600" />
                                Context Settings
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Syllabus Board</label>
                                    <select
                                        value={formData.board}
                                        onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        <option>CBSE</option>
                                        <option>ICSE</option>
                                        <option>State Board</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Grade</label>
                                        <select
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            {['6', '7', '8', '9', '10', '11', '12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option>Science</option>
                                            <option>Mathematics</option>
                                            <option>English</option>
                                            <option>Social Science</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Topic Name</label>
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="e.g., Photosynthesis"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Reference PDF (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="pdf-upload"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            {uploading ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                                            ) : file ? (
                                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                                    <CheckCircle2 className="w-5 h-5" /> Context Attached
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <FileUp className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                    <span className="text-xs text-gray-500">Upload Chapter Doc</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">AI Intelligence</span>
                                        <span className="text-[9px] text-gray-400 italic">Optimized for Accuracy</span>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, mode: formData.mode === 'AI' ? 'Manual' : 'AI' })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.mode === 'AI' ? 'bg-primary-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.mode === 'AI' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {!activeClassId && (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-indigo-800 leading-snug">
                                                Great content needs a home.
                                            </p>
                                            <p className="text-[10px] text-indigo-600 mt-0.5 leading-snug">
                                                Please select a class from the <b>top bar</b> to provide context and unlock AI generation.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !activeClassId}
                                    className={`w-full font-black py-4.5 rounded-2xl shadow-xl transition-all flex flex-col items-center justify-center gap-1.5 px-6 ${!activeClassId
                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100 shadow-none grayscale'
                                        : 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700 active:scale-95'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : formData.mode === 'AI' ? <><Sparkles className="w-5 h-5" /> Generate Academic Content</> : 'Create Manually'}
                                    </div>
                                    {!activeClassId && <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Selection Required</span>}
                                </button>
                                <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest px-4">
                                    {activeClassId ? `Locked onto: ${myClasses.find(c => c.id === activeClassId)?.name}` : 'Waiting for Class Context'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-8">
                        {aiResult ? (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="bg-primary-600 p-6 flex justify-between items-center text-white">
                                        <div>
                                            <h3 className="text-lg font-bold">{aiResult.title}</h3>
                                            <p className="text-primary-100 text-xs">AI Generated Draft for {myClasses.find(c => c.id === activeClassId)?.name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setAiResult(null)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <EditableContent
                                            result={aiResult}
                                            onChange={handleUpdateResult}
                                        />
                                    </div>

                                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                        <button
                                            onClick={() => handleSave(false)}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-white transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Keep as Draft
                                        </button>
                                        <button
                                            onClick={() => handleSave(true)}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20"
                                        >
                                            <Send className="w-4 h-4" /> Publish to Class
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-white/50">
                                <div className="bg-primary-50 p-6 rounded-full text-primary-600 mb-6">
                                    <Lightbulb className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Workspace Empty</h3>
                                <p className="text-gray-500 max-w-sm mb-8 italic">
                                    "AI-generated content is saved specifically for the class selected in your dashboard."
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'quiz' })}
                                        className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${formData.type === 'quiz' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                    >
                                        Practice Quiz
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'lesson' })}
                                        className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${formData.type === 'lesson' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                    >
                                        Topic Summary
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium tracking-tight">No content found for {myClasses.find(c => c.id === activeClassId)?.name || 'this class'}.</p>
                            <button onClick={() => setActiveTab('new')} className="mt-4 text-primary-600 font-bold hover:underline">Start Creating &rarr;</button>
                        </div>
                    ) : (
                        drafts.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.approvedByTeacher ? 'bg-primary-100 text-primary-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {item.approvedByTeacher ? 'Published' : 'Draft'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Delete this content?")) {
                                                deleteAIContent(item.id).then(() => fetchDrafts());
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{item.topic}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.type} • {item.subject}</p>

                                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400 font-bold font-mono">{new Date(item.createdAt?.toDate()).toLocaleDateString()}</span>
                                    <button
                                        onClick={() => {
                                            setAiResult(item.content);
                                            setActiveTab('new');
                                        }}
                                        className="text-xs font-bold text-primary-600 hover:underline"
                                    >
                                        Edit Content &rarr;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Sub-component for editing AI results
const EditableContent = ({ result, onChange }) => {
    if (result.type === 'quiz') {
        return (
            <div className="space-y-8">
                {result.questions.map((q, idx) => (
                    <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-extrabold text-primary-400 shadow-sm border border-gray-100">
                                {idx + 1}
                            </div>
                            <div className="flex-1 space-y-4">
                                <textarea
                                    className="w-full bg-transparent font-bold text-gray-900 outline-none resize-none px-2 border-b border-dashed border-transparent focus:border-primary-200"
                                    value={q.question}
                                    rows={2}
                                    onChange={(e) => {
                                        const newQuestions = [...result.questions];
                                        newQuestions[idx].question = e.target.value;
                                        onChange({ ...result, questions: newQuestions });
                                    }}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt, oIdx) => (
                                        <input
                                            key={oIdx}
                                            className={`w-full px-4 py-2 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-primary-500 outline-none font-medium ${q.answer === opt ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-inner' : 'bg-white border-gray-100 text-gray-600'}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const newQuestions = [...result.questions];
                                                newQuestions[idx].options[oIdx] = e.target.value;
                                                onChange({ ...result, questions: newQuestions });
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="p-4 bg-primary-100/30 rounded-2xl border border-primary-100">
                                    <p className="text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1 font-mono">Teacher Context / Explanation</p>
                                    <p className="text-sm text-primary-900 leading-relaxed font-medium">"{q.explanation}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-primary-200 hover:text-primary-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    <Plus className="w-5 h-5" /> Add Manual Question
                </button>
            </div>
        );
    }

    if (result.type === 'lesson') {
        return (
            <div className="space-y-10">
                {result.outline.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center font-bold text-primary-600 text-xs shadow-sm shadow-primary-100">{idx + 1}</span>
                            <input
                                className="text-xl font-bold text-gray-900 bg-transparent outline-none w-full border-b-2 border-transparent focus:border-primary-200 transition-all"
                                value={item.heading}
                                onChange={(e) => {
                                    const newOutline = [...result.outline];
                                    newOutline[idx].heading = e.target.value;
                                    onChange({ ...result, outline: newOutline });
                                }}
                            />
                        </div>
                        <div className="pl-11 space-y-3">
                            {item.points.map((p, pIdx) => (
                                <div key={pIdx} className="flex items-start gap-2 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                                    <textarea
                                        className="w-full text-sm text-gray-600 bg-transparent outline-none py-0 h-auto resize-none font-medium leading-relaxed focus:text-gray-900 transition-colors"
                                        value={p}
                                        rows={Math.ceil(p.length / 50)}
                                        onChange={(e) => {
                                            const newOutline = [...result.outline];
                                            newOutline[idx].points[pIdx] = e.target.value;
                                            onChange({ ...result, outline: newOutline });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default CoTeacherHub;
