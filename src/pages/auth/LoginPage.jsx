import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, UserCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { user, role, userData } = useAuth();
    const location = useLocation();

    // Get role from URL query param
    const queryParams = new URLSearchParams(location.search);
    const selectedRole = queryParams.get('role'); // For UX labeling only

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            // Save intended role to localStorage so AuthContext can prioritize it
            if (selectedRole) {
                localStorage.setItem('intended_role', selectedRole);
            }

            const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
            const { auth } = await import('../../lib/firebase');
            const provider = new GoogleAuthProvider();
            // Force account selection on every login
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);

            // 1️⃣ After Admin Login — CREATE / MERGE USER DOC (Requirement)
            if (selectedRole === 'admin') {
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);

                // Only initialize schoolId: null if truly new or missing
                if (!userSnap.exists() || !userSnap.data().schoolId) {
                    await setDoc(
                        userRef,
                        {
                            uid: result.user.uid,
                            role: "admin",
                            schoolId: null,
                            email: result.user.email
                        },
                        { merge: true }
                    );
                }
            }
        } catch (error) {
            console.error(error);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert("Google Login failed: " + error.message);
            }
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Save intended role to localStorage so AuthContext can prioritize it
            if (selectedRole) {
                localStorage.setItem('intended_role', selectedRole);
            }

            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const { auth } = await import('../../lib/firebase');
            const result = await signInWithEmailAndPassword(auth,
                e.target[0].value, // email 
                e.target[1].value  // password
            );

            // 1️⃣ After Admin Login — CREATE / MERGE USER DOC (Requirement)
            if (selectedRole === 'admin') {
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists() || !userSnap.data().schoolId) {
                    await setDoc(
                        userRef,
                        {
                            uid: result.user.uid,
                            role: "admin",
                            schoolId: null,
                            email: result.user.email
                        },
                        { merge: true }
                    );
                }
            }
        } catch (error) {
            console.error(error);
            alert("Login failed: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                            AcademiVis
                        </Link>

                        {/* Selected Role Label (Requirement 2) */}
                        {selectedRole && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
                                <UserCircle2 className="w-3.5 h-3.5" />
                                {selectedRole === 'admin' ? 'School Administrator' : selectedRole.replace('_', ' ')} Portal
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 mt-1 text-sm">Sign in to access your dashboard</p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-70 group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.28.81-.56z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 bg-white text-gray-400">Or email</span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        placeholder="you@school.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all placeholder:text-gray-400 text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 group shadow-lg shadow-primary-600/20 disabled:opacity-70 mt-2"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                            <strong>Note:</strong> Log in with the email address registered with your school.
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                            &larr; Back to Role Selection
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
