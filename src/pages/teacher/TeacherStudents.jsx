import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { addStudent, getStudents } from '../../lib/services';
import { Plus, Users, Search, Mail, Clock, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';

const TeacherStudents = () => {
    const { schoolId } = useAuth();
    const { activeClassId, activeClass } = useClass();
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        if (schoolId && activeClassId) {
            fetchStudents();
        } else {
            setLoading(false);
            setStudents([]);
        }
    }, [schoolId, activeClassId]);

    useEffect(() => {
        if (activeClassId) {
            setValue('classId', activeClassId);
        }
    }, [activeClassId, setValue]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const studentsData = await getStudents(schoolId, activeClassId);
            setStudents(studentsData);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await addStudent(schoolId, data);
            reset({ classId: activeClassId });
            setIsModalOpen(false);
            fetchStudents();
            alert("Student added successfully! Parent invitation sent.");
        } catch (error) {
            console.error(error);
            alert("Error adding student. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Student 360</h1>
                    <p className="text-gray-500 font-medium mt-1 italic uppercase tracking-widest text-[10px]">Managing Academic Roster for {activeClass?.name}</p>
                </div>

                {!activeClassId && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-xs font-bold text-amber-700">Please select a class context to manage students.</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={!activeClassId}
                        className={`flex items-center gap-2 px-8 py-4 rounded-[24px] transition-all shadow-xl font-black text-xs uppercase tracking-widest group ${!activeClassId
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20 active:scale-95'
                            }`}
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Student
                    </button>
                </div>
            </div>

            {!activeClassId ? (
                <div className="bg-white p-20 rounded-[50px] border border-dashed border-gray-100 text-center flex flex-col items-center justify-center shadow-xl shadow-gray-200/50">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 text-gray-200">
                        <Users className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 italic tracking-tight">No Class Selected</h3>
                    <p className="text-gray-400 font-medium max-w-xs mt-3">Choose a specific class from the top bar to initialize Student 360 visibility.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students by name or parent email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-[30px] shadow-lg shadow-gray-200/20 outline-none focus:border-primary-300 transition-all font-bold text-sm italic"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <div className="w-full px-6 py-5 bg-blue-50/50 border border-blue-100 rounded-[30px] flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Context</p>
                                    <p className="text-base font-black text-blue-900 italic tracking-tight">{activeClass?.name} - {activeClass?.section}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[50px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-black">
                                    <tr>
                                        <th className="px-12 py-8">Identity</th>
                                        <th className="px-12 py-8">Parent Gateway</th>
                                        <th className="px-12 py-8">Cloud Sync</th>
                                        <th className="px-12 py-8 text-right">Transparency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-12 py-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 text-primary-600 flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform italic border-b-4 border-b-primary-100">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-xl italic tracking-tight">{student.name}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200">ID: {student.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <span className="text-sm font-black text-gray-500 font-mono tracking-tighter">{student.parentEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                {student.parentUid ? (
                                                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-green-50 text-green-700 rounded-[20px] border border-green-100 shadow-sm border-dashed">
                                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gray-50 text-gray-400 rounded-[20px] border border-gray-100 shadow-sm border-dashed">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inherited</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-12 py-10 text-right">
                                                <button className="text-[11px] font-black text-primary-600 uppercase tracking-[0.2em] hover:underline px-6 py-3 bg-primary-50 rounded-2xl border border-primary-100">View Data &rarr;</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-12 py-40 text-center opacity-30">
                                                <div className="flex flex-col items-center">
                                                    <Users className="w-24 h-24 mb-6" />
                                                    <p className="text-sm font-black uppercase tracking-[0.4em]">Zero Student Signals Recorded</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[60px] p-16 max-w-xl w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full blur-[120px] opacity-60 -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-14">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3 italic underline decoration-primary-300 decoration-8 underline-offset-8">New Enrollment</h2>
                                    <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Context: {activeClass?.name} - {activeClass?.section}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-3xl transition-all shadow-inner">
                                    <Plus className="w-8 h-8 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2 italic">Student Identity</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className={`w-full px-8 py-6 bg-gray-50 rounded-[35px] border outline-none transition-all font-black text-lg italic tracking-tight ${errors.name ? 'border-red-300' : 'border-gray-100 focus:border-primary-300 focus:bg-white focus:shadow-2xl shadow-gray-200/50 shadow-inner'}`}
                                        placeholder="Enter full legal name..."
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-3 ml-4">🚨 {errors.name.message}</p>}
                                </div>

                                <input type="hidden" {...register("classId", { required: true })} />

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2 italic">Parent Digital Gateway</label>
                                    <input
                                        {...register("parentEmail", {
                                            required: "Parent email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email signature"
                                            }
                                        })}
                                        type="email"
                                        className={`w-full px-8 py-6 bg-gray-50 rounded-[35px] border outline-none transition-all font-black text-lg italic tracking-tight ${errors.parentEmail ? 'border-red-300' : 'border-gray-100 focus:border-primary-300 focus:bg-white focus:shadow-2xl shadow-gray-200/50 shadow-inner'}`}
                                        placeholder="parent@gateway.com"
                                    />
                                    {errors.parentEmail && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-3 ml-4">🚨 {errors.parentEmail.message}</p>}
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gray-900 text-white font-black py-8 rounded-[40px] text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-600 active:scale-[0.96] transition-all flex items-center justify-center gap-4 group"
                                    >
                                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                Activate Gateway <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mt-8 opacity-60">Secure invitation link will be dispatched via Firebase Cloud</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
