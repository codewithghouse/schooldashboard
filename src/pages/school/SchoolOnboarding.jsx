import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSchool } from '../../lib/services';
import { useNavigate } from 'react-router-dom';
import { School, ArrowRight, Building2 } from 'lucide-react';

const SchoolOnboarding = () => {
    const { user, userData } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createSchool(formData, user.uid);
            // Ideally force a refresh of user context, but navigation will likely trigger re-checks or we rely on Firestore listener if we had one.
            // For now, simpler to reload or navigate.
            window.location.href = '/school/dashboard';
        } catch (error) {
            console.error("Failed to create school:", error);
            alert("Error creating school. Please try again.");
            setLoading(false);
        }
    };

    if (userData?.role === 'school_admin' && userData?.schoolId) {
        // Already has school
        navigate('/school/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <School className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Register Your School</h2>
                        <p className="text-gray-500 mt-2">Complete your profile to start managing your institution.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                        placeholder="Ex. Greenwood International High"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                    placeholder="Ex. New York"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State / Region</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                    placeholder="Ex. NY"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white font-semibold py-4 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-70 mt-4"
                        >
                            {loading ? 'Creating School...' : 'Complete Registration'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchoolOnboarding;
