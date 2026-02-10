import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart, BookOpen, ShieldCheck, GraduationCap, UserCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
    const { user, role, userData } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                AcademiVis
                            </span>
                        </div>
                        <div>
                            <Link
                                to="/login"
                                className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all text-sm"
                            >
                                Login Portal
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
                    Now accepting partner schools for 2026
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
                    Marks tell you <span className="text-primary-600">what</span>.<br />
                    We tell you <span className="text-primary-600">why</span>.
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed">
                    The first true academic visibility platform. Move beyond basic report cards to track learning gaps, syllabus coverage, and real academic progress.
                </p>

                {/* ROLE SELECTION CARDS (Requirement 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-4">
                    <RoleCard
                        icon={<GraduationCap className="w-8 h-8" />}
                        role="Teacher"
                        description="Record syllabus and test updates"
                        color="bg-purple-600"
                        onClick={() => navigate('/login?role=teacher')}
                    />
                    <RoleCard
                        icon={<UserCircle className="w-8 h-8" />}
                        role="Parent"
                        description="Monitor your child's progress"
                        color="bg-primary-600"
                        onClick={() => navigate('/login?role=parent')}
                    />
                    <RoleCard
                        icon={<Users className="w-8 h-8" />}
                        role="Student"
                        description="View your learning journey"
                        color="bg-orange-600"
                        onClick={() => navigate('/login?role=student')}
                    />
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How it works</h2>
                        <p className="mt-4 text-gray-600 text-lg">Three simple steps to complete academic transparency.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-primary-600" />}
                            title="1. Teachers Update"
                            description="Teachers log weekly progress, test results, and identify specific learning gaps from the syllabus."
                        />
                        <FeatureCard
                            icon={<BarChart className="w-8 h-8 text-primary-600" />}
                            title="2. Schools Monitor"
                            description="Admin dashboards provide real-time oversight on syllabus coverage, teacher performance, and outliers."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-primary-600" />}
                            title="3. Parents Understand"
                            description="Parents get actionable insights on their child's weak areas and progress, not just raw numbers."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gray-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-500 via-transparent to-transparent"></div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
                            Ready to modernize your school?
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                            Join the forward-thinking institutions that are changing how they track academic success.
                        </p>
                        <button
                            onClick={() => navigate('/login?role=admin')}
                            className="relative z-10 px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2">
                            <span className="text-2xl font-bold text-gray-900">AcademiVis</span>
                            <p className="mt-4 text-gray-500 max-w-xs">
                                Empowering schools with data-driven insights for better learning outcomes.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
                            <ul className="space-y-3 text-gray-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">For Schools</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">For Teachers</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">For Parents</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                            <ul className="space-y-3 text-gray-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>&copy; 2026 AcademiVis. All rights reserved.</p>
                        <p>Made for education.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const RoleCard = ({ icon, role, description, color, onClick }) => (
    <button
        onClick={onClick}
        className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left w-full"
    >
        <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">I am a {role}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
            Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
    </button>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] transition-all">
        <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary-600">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;

