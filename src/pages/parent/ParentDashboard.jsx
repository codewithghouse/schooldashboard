import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyStudents, getSchool } from '../../lib/services';
import {
    Users,
    Building2,
    BookOpen,
    GraduationCap,
    Loader2,
    Calendar,
    Award,
    ChevronRight,
    ArrowRight,
    Mail
} from 'lucide-react';

const ParentDashboard = () => {
    const { user, userData } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [schoolInfo, setSchoolInfo] = useState(null);

    useEffect(() => {
        const loadParentData = async () => {
            if (user?.email) {
                try {
                    const myStudents = await getMyStudents(user.email);
                    setStudents(myStudents);

                    if (userData?.schoolId) {
                        const school = await getSchool(userData.schoolId);
                        setSchoolInfo(school);
                    }
                } catch (error) {
                    console.error("Error loading parent dashboard:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadParentData();
    }, [user, userData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Header */}
            <div className="bg-white rounded-[40px] p-12 shadow-xl shadow-blue-900/5 border border-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{schoolInfo?.name || 'AcademiVis School'}</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 italic">Parent Dashboard</h1>
                        <p className="text-xl text-gray-500 font-medium">Welcome back. View your children's academic transparency here.</p>
                    </div>
                    <div className="bg-blue-50 px-8 py-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Active Email</p>
                            <p className="text-lg font-black text-gray-900">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" /> Your Children
                    </h2>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-xs font-black text-gray-500 uppercase tracking-widest">
                        {students.length} Linked Records
                    </span>
                </div>

                {students.length === 0 ? (
                    <div className="bg-white p-20 rounded-[50px] text-center border-4 border-dashed border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 mb-2 italic">No students yet</h3>
                        <p className="text-gray-400 font-medium max-w-md mx-auto">
                            If you believe this is an error, please contact the school administrator to link your email address to your child's record.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {students.map((student) => (
                            <div key={student.id} className="group bg-white rounded-[40px] p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all hover:border-blue-200">
                                <div className="flex items-start justify-between mb-10">
                                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                            Active Student
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-10">
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight italic">{student.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        <span>Grade {student.grade} – Section {student.section}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Academic Status</p>
                                        <p className="text-lg font-black text-gray-900">Normal</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendance</p>
                                        <p className="text-lg font-black text-gray-900">Good</p>
                                    </div>
                                </div>

                                <button className="w-full mt-10 py-5 bg-gray-900 text-white rounded-[30px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group-hover:bg-blue-600 transition-colors">
                                    View Full Report <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions / Static Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StaticCard
                    icon={Calendar}
                    title="School Events"
                    desc="Stay updated with vacations and events."
                    label="View Schedule"
                />
                <StaticCard
                    icon={Award}
                    title="Achievements"
                    desc="View certifications and recognitions."
                    label="View Badges"
                />
                <StaticCard
                    icon={Mail}
                    title="Direct Message"
                    desc="Contact subject teachers directly."
                    label="Send Message"
                />
            </div>
        </div>
    );
};

const StaticCard = ({ icon: Icon, title, desc, label }) => (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-lg group hover:ring-8 ring-blue-50 transition-all cursor-pointer">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Icon className="w-7 h-7" />
        </div>
        <h4 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{title}</h4>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">{desc}</p>
        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
            {label} <ChevronRight className="w-4 h-4" />
        </div>
    </div>
);

export default ParentDashboard;
