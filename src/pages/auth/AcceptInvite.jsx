import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from '../../context/AuthContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const { refreshUserData } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleAuth = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                const urlParams = new URL(window.location.href).searchParams;

                let email = localStorage.getItem('inviteEmail');
                const role = localStorage.getItem('inviteRole') || urlParams.get('role');
                const schoolId = localStorage.getItem('inviteSchoolId') || urlParams.get('schoolId');

                // If email isn't in localStorage (user opened link on different device/browser)
                if (!email) {
                    email = window.prompt('Please provide your email for verification');
                }

                if (!email || !role || !schoolId) {
                    setStatus('error');
                    setError("Invitation metadata missing. Please ensure you use the same browser or contact your administrator.");
                    return;
                }

                try {
                    // 1. Complete login
                    const result = await signInWithEmailLink(auth, email, window.location.href);
                    const uid = result.user.uid;

                    // 2. Create users/{uid} document
                    const userRef = doc(db, 'users', uid);
                    await setDoc(userRef, {
                        uid,
                        email: email.toLowerCase(),
                        role: role,
                        schoolId: schoolId,
                        createdAt: serverTimestamp()
                    });

                    // 3. Role-specific document creation
                    if (role === 'teacher') {
                        const name = localStorage.getItem('inviteName') || urlParams.get('name') || 'Teacher';
                        const subjectsRaw = localStorage.getItem('inviteSubjects') || urlParams.get('subjects') || '[]';
                        const classIdsRaw = localStorage.getItem('inviteClassIds') || urlParams.get('classes') || '[]';

                        let subjects = [];
                        let classIds = [];
                        try { subjects = JSON.parse(subjectsRaw); } catch (e) { }
                        try { classIds = JSON.parse(classIdsRaw); } catch (e) { }

                        const teacherRef = doc(db, 'teachers', uid);
                        await setDoc(teacherRef, {
                            uid,
                            email: email.toLowerCase(),
                            name,
                            schoolId,
                            subjects,
                            status: 'active',
                            createdAt: serverTimestamp()
                        });

                        for (const classId of classIds) {
                            await updateDoc(doc(db, 'classes', classId), {
                                classTeacherId: uid
                            });
                        }
                    } else if (role === 'parent') {
                        const studentId = localStorage.getItem('inviteStudentId') || urlParams.get('studentId');
                        if (studentId) {
                            await updateDoc(doc(db, 'students', studentId), {
                                parentUid: uid
                            });
                        }
                    }

                    // 3.5 Sync Context
                    await refreshUserData();

                    // 4. Success! Clear storage
                    localStorage.removeItem('inviteEmail');
                    localStorage.removeItem('inviteRole');
                    localStorage.removeItem('inviteSchoolId');
                    localStorage.removeItem('inviteName');
                    localStorage.removeItem('inviteSubjects');
                    localStorage.removeItem('inviteClassIds');
                    localStorage.removeItem('inviteStudentId');

                    setStatus('success');

                    // Redirect based on role
                    setTimeout(() => {
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
                setStatus('error');
                setError("Invalid or expired invitation link.");
            }
        };

        handleAuth();
    }, [navigate, refreshUserData]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {status === 'verifying' && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Verifying Invite...</h2>
                        <p className="text-gray-500">Checking your secure link and preparing your dashboard.</p>
                    </>
                )}

                {status === 'success' && (
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100 flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
                        <p className="text-gray-500">Invitation accepted. Redirecting...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-100 flex flex-col items-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Failed</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium"
                        >
                            Return to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;
