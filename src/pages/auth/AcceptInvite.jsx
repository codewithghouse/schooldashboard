import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { finalizeOnboarding } from "../../lib/services";
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('verifying'); // verifying, onboarding, success, error
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuth = async () => {
            const queryParams = new URLSearchParams(location.search);
            const inviteId = queryParams.get('id');

            if (!inviteId) {
                setStatus('error');
                setError("Missing invitation ID.");
                return;
            }

            // 1. Verify if this is a valid sign-in link
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');

                // If email isn't in localStorage (e.g. user opened link on different device)
                if (!email) {
                    email = window.prompt('Please provide your email for verification');
                }

                if (!email) {
                    setStatus('error');
                    setError("Email is required to complete sign-in.");
                    return;
                }

                try {
                    setStatus('onboarding');
                    // 2. Complete sign-in
                    const result = await signInWithEmailLink(auth, email, window.location.href);
                    const user = result.user;

                    // 3. Call backend to finalize onboarding (atomic transaction)
                    const onboardingResult = await finalizeOnboarding(user.uid, user.email, inviteId);

                    // 4. Success! Clear storage and redirect
                    window.localStorage.removeItem('emailForSignIn');
                    setStatus('success');

                    // Redirect based on role
                    setTimeout(() => {
                        const role = onboardingResult.role;
                        if (role === 'teacher') navigate('/teacher/dashboard');
                        else if (role === 'parent') navigate('/parent/dashboard');
                        else if (role === 'school_admin') navigate('/school/dashboard');
                        else navigate('/');
                    }, 2000);

                } catch (err) {
                    console.error("Auth Link Error:", err);
                    setStatus('error');
                    setError(err.message);
                }
            } else {
                // Not a sign-in link, maybe just a landing page?
                setStatus('error');
                setError("Invalid or expired invitation link.");
            }
        };

        handleAuth();
    }, [navigate, location.search]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {status === 'verifying' && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Verifying Security Link...</h2>
                        <p className="text-gray-500">Connecting to Firebase Auth...</p>
                    </>
                )}

                {status === 'onboarding' && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Setting Up Your Account...</h2>
                        <p className="text-gray-500">Finalizing teacher/parent profile in Firestore...</p>
                    </>
                )}

                {status === 'success' && (
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100 flex flex-col items-center animate-in zoom-in-95">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
                        <p className="text-gray-500">Verification complete. Redirecting to your dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-100 flex flex-col items-center animate-in zoom-in-95">
                        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Failed</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-black transition-all"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;
