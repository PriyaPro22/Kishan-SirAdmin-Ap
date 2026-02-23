'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Upload, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import AuthModal from '../components/Auth/AuthModal';

export default function ProfilePage() {
    const router = useRouter();
    const { darkMode, openModal } = useApp();

    // States
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // User data
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }
        setIsLoggedIn(true);
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');

            if (!userId) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const response = await axios.get(`${baseUrl}/api/auth/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
                }
            });

            if (response.data.success) {
                const user = response.data.user;
                setFullName(user.name || '');
                setEmail(user.email || '');
                setDob(user.dob || '');
                setPhoneNumber(user.phoneNumber || '');
                setCurrentImageUrl(user.photoUrl || '');
            }
        } catch (err: any) {
            console.error('Profile load error:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const authToken = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');

            if (!userId) {
                setError('User ID not found');
                return;
            }

            const formData = new FormData();
            formData.append('name', fullName);
            if (email) formData.append('email', email);
            if (dob) formData.append('dob', dob);
            if (profileImage) formData.append('photoUrl', profileImage);

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const response = await axios.patch(`${baseUrl}/api/auth/update-user/${userId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data',
                    'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
                }
            });

            if (response.data.success) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#050B14]' : 'bg-gray-50'}`}>
                <Loader2 size={40} className="animate-spin text-[#FFC42E]" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-[#050B14]' : 'bg-gray-50'} text-center`}>
                <div className="w-24 h-24 bg-[#FFC42E]/10 rounded-full flex items-center justify-center mb-6">
                    <User size={48} className="text-[#FFC42E]" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Login Required</h2>
                <p className={`mb-8 max-w-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Please login to view and edit your profile details.
                </p>
                <button
                    onClick={() => openModal('auth')}
                    className="w-full max-w-xs py-4 rounded-xl bg-[#FFC42E] text-gray-900 font-bold text-lg shadow-lg active:scale-95 transition-all"
                >
                    Login Now
                </button>
                <button
                    onClick={() => router.push('/')}
                    className={`mt-4 text-sm font-medium ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Back to Home
                </button>

                <AuthModal
                    darkMode={darkMode}
                    location=""
                />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#050B14]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-lg border-b ${darkMode ? 'bg-[#1a1f2e]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    >
                        <ArrowLeft size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
                    </button>
                    <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Edit Profile
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-6 sm:p-8 shadow-lg border ${darkMode ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-gray-200'}`}
                >
                    {/* Profile Image */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl ${darkMode ? 'border-[#FFC42E]/20 bg-white/5' : 'border-white bg-gray-50'}`}>
                                {profilePreview || currentImageUrl ? (
                                    <img
                                        src={profilePreview || currentImageUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={48} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-[#FFC42E] flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#FFD700] transition-transform hover:scale-110 active:scale-95">
                                <Upload size={20} className="text-gray-900" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {phoneNumber}
                        </p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <User size={16} className="inline mr-2" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${darkMode
                                    ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E]/50'
                                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFC42E]/50 border border-gray-200'
                                    }`}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <Mail size={16} className="inline mr-2" />
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${darkMode
                                    ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E]/50'
                                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFC42E]/50 border border-gray-200'
                                    }`}
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <Calendar size={16} className="inline mr-2" />
                                Date of Birth (Optional)
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${darkMode
                                    ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E]/50'
                                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFC42E]/50 border border-gray-200'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center"
                        >
                            {success}
                        </motion.div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !fullName.trim()}
                        className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-[#FFC42E] to-[#FFD700] text-gray-900 font-bold text-lg shadow-[0_4px_20px_rgb(255,196,46,0.3)] hover:shadow-[0_6px_25px_rgb(255,196,46,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
