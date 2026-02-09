import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// Assuming you have services to count these. If not, we'll fetch all and count length (not efficient for scale but OK for MVP step 2).
import { getClasses, getTeachers, getStudents, getWeeklyUpdates } from '../../lib/services';
import { Users, BookOpen, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color} shadow-lg shadow-gray-200`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const SchoolDashboard = () => {
    const { schoolId } = useAuth();
    const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (schoolId) {
            loadStats();
        }
    }, [schoolId]);

    const loadStats = async () => {
        try {
            // Parallel fetch for counts
            const [cls, teach, stud] = await Promise.all([
                getClasses(schoolId),
                getTeachers(schoolId),
                getStudents(schoolId)
            ]);
            setCounts({
                classes: cls.length,
                teachers: teach.length,
                students: stud.length
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Students"
                    value={loading ? "..." : counts.students}
                    icon={GraduationCap}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Teachers"
                    value={loading ? "..." : counts.teachers}
                    icon={Users}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Total Classes"
                    value={loading ? "..." : counts.classes}
                    icon={BookOpen}
                    color="bg-purple-500"
                />
            </div>

            {/* Monitoring / Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Updates Placeholder for MVP */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Pending Weekly Updates</h3>
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">0 Pending</span>
                    </div>
                    <div className="text-center text-gray-500 py-8">
                        <p>All teachers are up to date! (Mock status for MVP)</p>
                    </div>
                </div>

                {/* Learning Gap Alerts Placeholder */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Critical Alerts</h3>
                    </div>
                    <div className="space-y-4">
                        {/* Static alerts for demo purposes as we don't have enough real data to drive analytics engine yet */}
                        <div className="p-4 rounded-xl border-l-4 border-yellow-400 bg-yellow-50/50">
                            <p className="font-medium text-gray-900">System Ready</p>
                            <p className="text-sm text-gray-600 mt-1">Start by adding classes and teachers via the sidebar.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolDashboard;
