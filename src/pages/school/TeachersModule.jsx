import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inviteTeacher, getTeachers, getClasses, deleteTeacher } from '../../lib/services';
import { Plus, Mail, CheckCircle, Clock, Trash2 } from 'lucide-react';
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
            console.log("Production Invite: Dispatching request to Backend Proxy...");
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
        if (!window.confirm(`Are you sure you want to delete ${teacher.name || 'this teacher'}? Status: ${teacher.status}`)) return;

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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Teachers Directory</h1>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (classes.length === 0) return alert("Add at least one class first!");
                            if (!window.confirm("Seed 5 test invites?")) return;

                            const testInvites = [
                                { name: "Test Teacher A", email: "teacher_a@test.com", subjects: ["Mathematics"] },
                                { name: "Test Teacher B", email: "teacher_b@test.com", subjects: ["Science"] },
                                { name: "Test Teacher C", email: "teacher_c@test.com", subjects: ["English"] },
                            ];

                            const defaultClassId = classes[0].id;

                            try {
                                await Promise.all(testInvites.map(t => inviteTeacher(schoolId, t, [defaultClassId])));
                                alert("Test invites created. Check 'Invited' status below.");
                                loadData();
                            } catch (e) { alert("Seed failed."); }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                        Seed Test Invites
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add Teacher
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Teacher</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Subjects</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {teachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">{teacher.name || 'Pending Onboarding'}</td>
                                <td className="px-6 py-4 text-gray-500">{teacher.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {teacher.subjects?.map((sub, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{sub}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {teacher.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                            <CheckCircle className="w-3 h-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                            <Clock className="w-3 h-3" /> Invited
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(teacher)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Teacher"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No teachers found. Invite them to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black mb-6 text-gray-900 tracking-tight italic">Invite Teacher</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input {...register("name", { required: true })} className="w-full px-3 py-2 border rounded-lg shadow-sm" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input {...register("email", { required: true })} type="email" className="w-full px-3 py-2 border rounded-lg shadow-sm" placeholder="john@school.edu" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma separated)</label>
                                <input {...register("subjects", { required: true })} className="w-full px-3 py-2 border rounded-lg shadow-sm" placeholder="Math, Physics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Classes</label>
                                <select
                                    multiple
                                    value={selectedClassIds}
                                    onChange={(e) =>
                                        setSelectedClassIds(
                                            Array.from(e.target.selectedOptions, o => o.value)
                                        )
                                    }
                                    className="w-full px-3 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 text-sm font-bold"
                                >
                                    {loadingClasses ? (
                                        <option disabled>Loading classes...</option>
                                    ) : classes.length === 0 ? (
                                        <option disabled>No classes found.</option>
                                    ) : (
                                        classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                Class {cls.grade}{cls.section} — {cls.subject}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Hold Ctrl (Windows) or Cmd (Mac) to select multiple classes.</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-black uppercase tracking-widest transition-all">Cancel</button>
                                <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all">Send Invitation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersModule;
