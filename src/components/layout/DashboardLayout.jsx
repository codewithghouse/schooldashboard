import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    Activity,
    LogOut,
    Menu,
    X,
    Bell,
    FileText,
    UserCircle,
    Sparkles,
    ChevronDown,
    Zap,
    Layers,
    ClipboardList,
    ShieldCheck,
    Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span className="font-medium text-sm">{label}</span>
    </Link>
);

const DashboardLayout = ({ role: requiredRole = 'school' }) => {
    const { role: userRole, userData, logout } = useAuth();
    const { myClasses, activeClassId, setActiveClass } = useClass();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // --- INTERNAL ROUTE GUARD ---
    useEffect(() => {
        if (!userData && !userRole) return; // Wait for auth to load

        if (userRole !== requiredRole) {
            console.error(`🚫 Access Denied: Role ${userRole} tried to access ${requiredRole} dashboard.`);
            // Redirect to their correct dashboard
            if (userRole === 'admin') navigate('/school/dashboard');
            else if (userRole === 'teacher') navigate('/teacher/dashboard');
            else if (userRole === 'parent') navigate('/parent/dashboard');
            else navigate('/login');
        }
    }, [userRole, requiredRole, navigate, userData]);

    const handleClassChange = (e) => {
        setActiveClass(e.target.value);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navItemsByRole = {
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard', to: '/school/dashboard' },
            { icon: BookOpen, label: 'Classes', to: '/school/classes' },
            { icon: Users, label: 'Teachers', to: '/school/teachers' },
            { icon: GraduationCap, label: 'Students', to: '/school/students' },
            { icon: FileText, label: 'Syllabus', to: '/school/syllabus' },
            { icon: Activity, label: 'Monitoring', to: '/school/monitoring' },
        ],
        teacher: [
            { icon: LayoutDashboard, label: 'Dashboard Overview', to: '/teacher/dashboard' },
            { icon: Zap, label: 'Daily Command', to: '/teacher/command' },
            { icon: Activity, label: 'Class Intelligence', to: '/teacher/intelligence' },
            { icon: Users, label: 'Student 360', to: '/teacher/students' },
            { icon: Layers, label: 'Syllabus Tracker', to: '/teacher/syllabus' },
            { icon: ClipboardList, label: 'Assessments', to: '/teacher/tests' },
            { icon: FileText, label: 'Weekly Notes', to: '/teacher/notes' },
            { icon: Sparkles, label: 'Co-Teacher AI', to: '/teacher/hub' },
            { icon: ShieldCheck, label: 'Parent Link Control', to: '/teacher/communication' },
            { icon: Award, label: 'Professional Proof', to: '/teacher/performance' },
        ],
        parent: [
            { icon: LayoutDashboard, label: 'Academic Overview', to: '/parent/dashboard' },
        ]
    };

    const navItems = navItemsByRole[requiredRole] || [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <Link to="/" className="h-16 flex items-center px-6 border-b border-gray-50 group">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            AcademiVis
                        </span>
                    </Link>

                    {/* Nav Items */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
                            {requiredRole === 'admin' ? 'School Management' : `${requiredRole} Portal`}
                        </div>
                        {navItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                icon={item.icon}
                                label={item.label}
                                to={item.to}
                                active={location.pathname === item.to}
                            />
                        ))}
                    </div>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-gray-50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
                        >
                            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Global Class Selector for Teachers */}
                        {requiredRole === 'teacher' && (
                            <div className="flex items-center gap-2 flex-grow max-w-md">
                                <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all duration-500 w-full ${!activeClassId
                                    ? 'bg-amber-50 border-amber-200 shadow-lg shadow-amber-500/20 animate-pulse ring-2 ring-amber-500 ring-offset-2'
                                    : 'bg-gray-50 border-gray-100'
                                    }`}>
                                    <div className={`p-1.5 rounded-lg ${!activeClassId ? 'bg-amber-100' : 'bg-primary-100'}`}>
                                        <BookOpen className={`w-4 h-4 ${!activeClassId ? 'text-amber-600' : 'text-primary-600'}`} />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">
                                            {activeClassId ? 'Active Context' : 'Select Working Class'}
                                        </span>
                                        <select
                                            className="bg-transparent text-sm font-black text-gray-900 outline-none cursor-pointer w-full appearance-none"
                                            value={activeClassId || ''}
                                            onChange={handleClassChange}
                                        >
                                            <option value="" disabled>Choose assigned class...</option>
                                            {myClasses.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    Grade {c.name.replace('Class ', '')} - {c.section}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {!activeClassId && (
                                        <div className="bg-amber-500 text-white p-1 rounded-full animate-bounce">
                                            <Zap className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shadow-sm">
                                {userData?.email?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                                    {userData?.name || userData?.email?.split('@')[0]}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                    {userRole?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50/50">
                    <Outlet context={{ activeClassId, setActiveClassId: setActiveClass, myClasses }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

