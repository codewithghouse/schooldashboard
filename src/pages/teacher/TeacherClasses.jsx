import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { addWeeklyUpdate, getSyllabus, getStudents } from '../../lib/services';
import { CheckCircle, BookOpen } from 'lucide-react';

const TeacherClasses = () => {
    const { schoolId, userData } = useAuth();
    const { myClasses: assignedClasses } = useClass();
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [students, setStudents] = useState([]);
    const [syllabus, setSyllabus] = useState([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('');

    const [updateFormData, setUpdateFormData] = useState({
        chapterCompleted: '',
        studentStatuses: {}, // studentId -> 'Good' | 'Average' | 'Needs Attention'
        homeworkPercent: 100,
        note: ''
    });

    const handleOpenUpdate = async (classId) => {
        setSelectedClassId(classId);
        // Fetch students and syllabus
        const [sts, syl] = await Promise.all([
            getStudents(schoolId, classId),
            getSyllabus(schoolId, classId)
        ]);
        setStudents(sts);
        setSyllabus(syl);
        setIsUpdateModalOpen(true);
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
            await addWeeklyUpdate({
                schoolId,
                classId: selectedClassId,
                teacherId: userData.uid,
                subject: currentSubject,
                ...updateFormData
            });
            alert("Weekly update submitted successfully!");
            setIsUpdateModalOpen(false);
            setUpdateFormData({ chapterCompleted: '', studentStatuses: {}, homeworkPercent: 100, note: '' });
        } catch (error) {
            console.error(error);
            alert("Error submitting update");
        }
    };

    const handleStudentStatusChange = (studentId, status) => {
        setUpdateFormData(prev => ({
            ...prev,
            studentStatuses: {
                ...prev.studentStatuses,
                [studentId]: status
            }
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assigned Classes</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Managing {assignedClasses.length} Academic Sections</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {assignedClasses.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                        <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No classes assigned to your profile.</p>
                    </div>
                ) : (
                    assignedClasses.map((cls) => (
                        <div key={cls.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-primary-100 transition-all"></div>

                            <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tighter">{cls.name}</h3>
                            <div className="flex items-center gap-2 mb-8">
                                <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">Section {cls.section}</span>
                                {cls.subject && <span className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-100">{cls.subject}</span>}
                            </div>

                            <button
                                onClick={() => handleOpenUpdate(cls.id)}
                                className="w-full py-4.5 bg-gray-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Weekly Proof Log
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Weekly Update Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full my-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Weekly Performance Log</h2>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">Close</button>
                        </div>

                        <form onSubmit={handleSubmitUpdate} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Subject</label>
                                    <input
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 transition-all font-bold text-sm"
                                        placeholder="e.g., Mathematics"
                                        value={currentSubject}
                                        onChange={(e) => setCurrentSubject(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Avg. Homework Completion %</label>
                                    <input
                                        type="number" min="0" max="100"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 transition-all font-bold text-sm"
                                        value={updateFormData.homeworkPercent}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, homeworkPercent: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Target Chapter Completed</label>
                                <select
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none appearance-none font-bold text-sm text-gray-700 cursor-pointer"
                                    value={updateFormData.chapterCompleted}
                                    onChange={(e) => setUpdateFormData({ ...updateFormData, chapterCompleted: e.target.value })}
                                >
                                    <option value="">Select Stage from Syllabus...</option>
                                    {syllabus.filter(s => !currentSubject || s.subject.toLowerCase().includes(currentSubject.toLowerCase())).flatMap(s => s.chapters).map((chap, i) => (
                                        <option key={i} value={chap}>{chap}</option>
                                    ))}
                                </select>
                                {syllabus.length === 0 && <p className="text-[10px] text-amber-600 font-bold mt-2 ml-1">Notice: No digital syllabus found. Please request upload.</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Individual Student Spotlight</label>
                                <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-[28px] divide-y divide-gray-50 shadow-inner bg-gray-50/20">
                                    {students.map(std => (
                                        <div key={std.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                                            <span className="text-sm font-bold text-gray-800">{std.name}</span>
                                            <div className="flex gap-2">
                                                {['Good', 'Average', 'Needs Attention'].map(status => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => handleStudentStatusChange(std.id, status)}
                                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${updateFormData.studentStatuses[std.id] === status
                                                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                                                            : 'bg-white text-gray-400 border-gray-100 hover:border-primary-200'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent Briefing Note</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-primary-300 transition-all font-medium text-sm"
                                    rows="3"
                                    placeholder="Write a brief observation for the parents..."
                                    value={updateFormData.note}
                                    onChange={(e) => setUpdateFormData({ ...updateFormData, note: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all transform active:scale-[0.98]">
                                    Lock Update & Notify Parents
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TeacherClasses;
