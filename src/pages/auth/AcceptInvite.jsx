import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AcceptInvite = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const inviteId = queryParams.get('id');

        // Capture invite ID and store it if needed (AuthContext uses email, so id is mainly for audit/UX)
        if (inviteId) {
            console.log("Processing invite:", inviteId);
            localStorage.setItem('pending_invite_id', inviteId);
        }

        // Delay slightly for effect, then redirect to login
        const timer = setTimeout(() => {
            navigate('/login');
        }, 1500);

        return () => clearTimeout(timer);
    }, [navigate, location.search]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Validating Invitation...</h2>
                <p className="text-gray-500">Please wait while we prepare your dashboard access.</p>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        You will be redirected to the login page. Use the email address where you received the invitation to sign in.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvite;
