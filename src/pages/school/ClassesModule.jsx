import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addClass, getClasses, getTeachers } from '../../lib/services';
import { Plus, BookOpen, User } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);

const ClassesModule = () => {
    const { schoolId } = useAuth();
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (schoolId) {
            loadData();
        }
    }, [schoolId]);

    const loadData = async () => {
        if (!schoolId) {
            console.warn("⚠️ loadData called without schoolId");
            return;
        }
        setLoading(true);
        try {
            console.log("📂 Fetching data for schoolId:", schoolId);
            const [classesData, teachersData] = await Promise.all([
                getClasses(schoolId),
                getTeachers(schoolId)
            ]);
            setClasses(classesData);
            setTeachers(teachersData);
            console.log("✅ Data Loaded:", classesData.length, "classes found.");
        } catch (error) {
            console.error("❌ Data Load Error:", error);
            alert("Failed to load classes. Please ensure you have sufficient permissions.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSetup = async () => {
        if (!confirm("This will create 10 new classes (Class 1 to 10, Section A). Proceed?")) return;
        setIsSettingUp(true);
        try {
            for (const className of CLASS_OPTIONS) {
                // Check if class already exists to avoid duplicates
                const exists = classes.some(c => c.name === className && c.section === 'A');
                if (!exists) {
                    await addClass(schoolId, {
                        name: className,
                        section: 'A',
                        grade: className.replace('Class ', ''),
                        subject: 'General',
                        classTeacherId: null // Hard Enforced
                    });
                }
            }
            alert("Standard classes created successfully!");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error in Quick Setup");
        } finally {
            setIsSettingUp(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await addClass(schoolId, data);
            reset();
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Error adding class");
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Classes Management</h1>
                    <p className="text-gray-500 text-sm">Organize your school's grade levels and sections.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleQuickSetup}
                        disabled={isSettingUp}
                        className="flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                    >
                        {isSettingUp ? 'Setting up...' : 'Quick Setup (1-10)'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add New Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-bold">No Classes Created</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Use the buttons above to manually add classes or use Quick Setup for a standard 1-10 structure.</p>
                    </div>
                ) : (
                    classes.sort((a, b) => {
                        const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
                        const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
                        return numA - numB;
                    }).map((cls) => (
                        <div key={cls.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary-600/5 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">{cls.name}</h3>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 px-2 py-0.5 rounded mt-1 inline-block">Section {cls.section}</span>
                                </div>
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 border-t border-gray-50 pt-6">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Class Teacher</p>
                                    <p className="font-bold text-gray-700">
                                        {cls.classTeacherId
                                            ? teachers.find(t => (t.uid === cls.classTeacherId || t.id === cls.classTeacherId))?.name || 'Unknown'
                                            : 'Not Assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Add New Class</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class Level</label>
                                <select {...register("name", { required: true })} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-primary-300 transition-all font-bold text-sm">
                                    <option value="">Select Level...</option>
                                    {CLASS_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Section</label>
                                <input {...register("section", { required: true })} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-primary-300 transition-all font-bold text-sm" placeholder="e.g. A" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Main Subject</label>
                                <input {...register("subject", { required: true })} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-primary-300 transition-all font-bold text-sm" placeholder="e.g. Mathematics" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assign Class Teacher</label>
                                <select {...register("classTeacherId")} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-primary-300 transition-all font-bold text-sm">
                                    <option value="">Select Teacher (Optional)</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.uid || t.id}>
                                            {t.name} {t.uid ? '(Active)' : '(Invited)'}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-gray-400 mt-2 px-1 italic">Note: Assignments prefer Firebase UIDs for secure real-time sync.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700">Add Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassesModule;
