import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { addStudent, getStudents } from '../../lib/services';
import { Plus, Users, Search, GraduationCap, Mail, CheckCircle, Clock, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';

const TeacherStudents = () => {
    const { schoolId, userData } = useAuth();
    const { activeClassId, activeClass, myClasses } = useClass();
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

    // Update modal class selection when global class changes
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
            reset({ classId: activeClassId }); // Reset but keep the active class
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
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Management</h1>
                    <p className="text-gray-500 font-medium mt-1 italic">“Keep track of every journey, build every bridge.”</p>
                </div>

                {!activeClassId && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-xs font-bold text-amber-700">Please select a class from the top bar to manage students.</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            if (!activeClassId) {
                                alert("Please select a class first!");
                                return;
                            }
                            if (!window.confirm("Add 30 dummy students to " + activeClass?.name + "?")) return;

                            const dummyNames = [
                                "Aarav Sharma", "Ishani Gupta", "Vihaan Khan", "Ananya Reddy", "Arjun Malhotra",
                                "Saanvi Iyer", "Kabir Singh", "Myra Kapoor", "Aryan Verma", "Diya Mistri",
                                "Reyansh Das", "Navya Joshi", "Ishaan Nair", "Advika Rao", "Krishna Bhat",
                                "Kyra Saxena", "Atharva Patil", "Zara Ahmed", "Sai Charan", "Pari Deshmukh",
                                "Aavya Kulkarni", "Avyaan Shah", "Shanaya Choudhury", "Ayaan Siddiqui", "Amaira Gill",
                                "Aaditya Mehra", "Sarah Sheikh", "Veer Dixit", "Sia Thakur", "Vivaan Goel"
                            ];

                            const studentsToSeed = dummyNames.map((name, i) => ({
                                name: name,
                                parentEmail: `parent.student${i + 1}@example.com`,
                                classId: activeClassId
                            }));

                            try {
                                setSubmitting(true);
                                // Using the bulkAddStudents if it's available, otherwise loop
                                // But TeacherStudents only imported addStudent. Let's check imports.
                                for (const student of studentsToSeed) {
                                    await addStudent(schoolId, student);
                                }
                                alert("30 Dummy students added successfully!");
                                fetchStudents();
                            } catch (e) {
                                console.error(e);
                                alert("Failed to seed students.");
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                        disabled={!activeClassId || submitting}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all shadow-xl font-black text-xs uppercase tracking-widest ${!activeClassId
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                            }`}
                    >
                        Seed 30 Students
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={!activeClassId}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all shadow-xl font-black text-xs uppercase tracking-widest group ${!activeClassId
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20 active:scale-95'
                            }`}
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add New Student
                    </button>
                </div>
            </div>

            {!activeClassId ? (
                <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                        <Users className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No Context Selected</h3>
                    <p className="text-gray-500 font-medium max-w-xs mt-2">Use the global class selector above to view and manage students for a specific section.</p>
                </div>
            ) : (
                <>
                    {/* Filters & Search */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-8 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students by name or parent email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-500/5 transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <div className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-[24px] flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Active Class</p>
                                    <p className="text-sm font-black text-blue-900">{activeClass?.name} - {activeClass?.section}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Students Table/Grid */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Student Profile</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Parent Gateway</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 flex items-center justify-center font-black text-lg shadow-inner">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-base">{student.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="px-2 py-0.5 bg-gray-100 rounded-md text-[9px] font-black text-gray-500 uppercase tracking-tighter">ID: {student.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-600">{student.parentEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {student.parentUid ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl border border-green-100 shadow-sm border-dashed">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Authenticated</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shadow-sm border-dashed">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pending Sync</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline px-4 py-2">View 360 &rarr;</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-10 py-32 text-center text-gray-300">
                                                <div className="flex flex-col items-center">
                                                    <Users className="w-20 h-20 mb-6 opacity-10" />
                                                    <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">No student signatures found</p>
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

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">New Enrollment</h2>
                                    <p className="text-gray-500 font-medium text-sm">Registering for <b>{activeClass?.name}</b></p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                    <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Student Full Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className={`w-full px-7 py-5 bg-gray-50 rounded-[28px] border outline-none transition-all font-bold text-base ${errors.name ? 'border-red-300 bg-red-50/10' : 'border-gray-100 focus:border-primary-300 focus:bg-white shadow-inner'}`}
                                        placeholder="Full student name"
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.name.message}</p>}
                                </div>

                                <input type="hidden" {...register("classId", { required: true })} />

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Parent Notification Email</label>
                                    <input
                                        {...register("parentEmail", {
                                            required: "Parent email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        type="email"
                                        className={`w-full px-7 py-5 bg-gray-50 rounded-[28px] border outline-none transition-all font-bold text-base ${errors.parentEmail ? 'border-red-300 bg-red-50/10' : 'border-gray-100 focus:border-primary-300 focus:bg-white shadow-inner'}`}
                                        placeholder="parent@gateway.com"
                                    />
                                    {errors.parentEmail && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.parentEmail.message}</p>}
                                </div>

                                <div className="pt-4 flex flex-col gap-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary-600 text-white font-black py-6 rounded-[32px] text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate Learning Gateway'}
                                    </button>
                                    <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Secure invite will be dispatched instantly</p>
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
