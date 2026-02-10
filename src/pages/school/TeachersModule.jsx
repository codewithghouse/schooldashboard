import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inviteTeacher, getTeachers, getClasses, deleteTeacher } from '../../lib/services';
import { Plus, CheckCircle, Clock, Trash2, ShieldCheck, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

const TeachersModule = () => {
    const { schoolId } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [selectedClassIds, setSelectedClassIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (schoolId) {
            loadData();
        }
    }, [schoolId]);

    const loadData = async () => {
        setLoadingClasses(true);
        try {
            const [teachersData, classesData] = await Promise.all([
                getTeachers(schoolId),
                getClasses(schoolId)
            ]);
            setTeachers(teachersData);
            setClasses(classesData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoadingClasses(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const subjects = data.subjects.split(',').map(s => s.trim());

            await inviteTeacher(schoolId, {
                name: data.name,
                email: data.email,
                subjects: subjects
            }, selectedClassIds);

            reset();
            setSelectedClassIds([]);
            setIsModalOpen(false);
            loadData();
            alert("Invitation sent! The teacher will receive an email to activate their account.");
        } catch (error) {
            console.error("Teacher invite failure:", error);
            alert("Error sending invitation: " + error.message);
        }
    };

    const handleDelete = async (teacher) => {
        if (!window.confirm(`Are you sure you want to delete ${teacher.name || 'this teacher'}?`)) return;

        try {
            await deleteTeacher(schoolId, teacher.id);
            alert("Record removed.");
            loadData();
        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Failed to remove teacher record.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm gap-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Teachers Directory</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-10 py-4 bg-primary-600 text-white rounded-[24px] hover:bg-primary-700 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                    >
                        <Plus className="w-4 h-4" /> Invite Faculty
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-6">Faculty Member</th>
                            <th className="px-8 py-6">Email Address</th>
                            <th className="px-8 py-6">Specialization</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {teachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 italic text-lg">{teacher.name || 'Pending Onboarding'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-gray-500 font-medium font-mono text-xs">{teacher.email}</td>
                                <td className="px-8 py-6">
                                    <div className="flex gap-1 flex-wrap">
                                        {teacher.subjects?.map((sub, i) => (
                                            <span key={i} className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest border border-blue-100">{sub}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {teacher.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-green-50 text-green-600 uppercase tracking-widest border border-green-100 shadow-sm">
                                            <CheckCircle className="w-3 h-3" /> Professional
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100">
                                            <Clock className="w-3 h-3" /> Invited
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => handleDelete(teacher)}
                                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                        title="Delete Teacher"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <p className="text-gray-400 font-black italic text-xl">No faculty records found.</p>
                                    <p className="text-gray-400 text-sm mt-1">Dispatch invitations to begin building your team.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Invite Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-8 text-gray-900 tracking-tight italic">Invite Faculty</h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <input {...register("name", { required: true })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-300 font-bold text-sm" placeholder="e.g. Dr. Sarah Chen" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Professional Email</label>
                                    <input {...register("email", { required: true })} type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-300 font-bold text-sm" placeholder="faculty@school.edu" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Specialization (comma separated)</label>
                                    <input {...register("subjects", { required: true })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-300 font-bold text-sm" placeholder="e.g. Advanced Calculus, Quantum Mechanics" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contextual Workload (Classes)</label>
                                    <select
                                        multiple
                                        value={selectedClassIds}
                                        onChange={(e) =>
                                            setSelectedClassIds(
                                                Array.from(e.target.selectedOptions, o => o.value)
                                            )
                                        }
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl h-40 outline-none focus:bg-white focus:border-blue-300 font-bold text-sm"
                                    >
                                        {loadingClasses ? (
                                            <option disabled>Syncing Workloads...</option>
                                        ) : classes.length === 0 ? (
                                            <option disabled>No classes defined.</option>
                                        ) : (
                                            classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>
                                                    Grade {cls.grade}{cls.section} — {cls.subject}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Hold Ctrl/Cmd to select multiple academic contexts.</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                                    <button type="submit" className="px-10 py-4 bg-primary-600 text-white rounded-[24px] hover:bg-primary-700 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Dispatch Link
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersModule;
