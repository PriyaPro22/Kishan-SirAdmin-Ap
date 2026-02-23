'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Loader2, User, Mail, Calendar, Upload, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface LoginPopupProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
}

export default function LoginPopup({ isOpen, onClose, darkMode }: LoginPopupProps) {
    const router = useRouter();

    // States
    const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Profile states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState('');

    // OTP input refs
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Handle phone number input
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setPhoneNumber(value);
            setError('');
        }
    };

    // Send OTP
    const handleSendOTP = async () => {
        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            const response = await axios.post(`${baseUrl}/api/auth/send-otp`, {
                mobile: phoneNumber
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': apiToken
                }
            });

            if (response.data.success) {
                setStep('otp');
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError(response.data.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            console.error('OTP send error:', err);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(digit => digit !== '') && index === 5) {
            verifyOTP(newOtp.join(''));
        }
    };

    // Handle OTP backspace
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Verify OTP
    const verifyOTP = async (otpCode: string) => {
        setLoading(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            const response = await axios.post(`${baseUrl}/api/auth/verify-otp`, {
                otpToken: localStorage.getItem('otpToken'), // Fallback
                otp: otpCode
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': apiToken
                }
            });

            if (response.data.success) {
                const { token, uid, redirectTo } = response.data;

                // Store authentication token for subsequent requests
                if (token) {
                    localStorage.setItem('authToken', token);
                }

                // Store UID if provided
                if (uid) {
                    localStorage.setItem('userId', uid);
                }

                if (redirectTo === 'signup') {
                    setStep('profile');
                } else {
                    // Existing user - close and refresh
                    if (response.data.user) {
                        localStorage.setItem('userData', JSON.stringify(response.data.user));
                    }
                    // Trigger FCM Sync
                    window.dispatchEvent(new Event('userLoggedIn'));
                    onClose();
                    window.location.reload();
                }
            } else {
                setError(response.data.message || 'Invalid OTP');
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
            }
        } catch (err: any) {
            console.error('OTP verify error:', err);
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Handle profile image upload
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

    // Complete registration
    const handleCompleteRegistration = async () => {
        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';
            const authToken = localStorage.getItem('authToken');

            const formData = new FormData();
            formData.append('name', fullName);
            formData.append('email', email);
            if (dob) formData.append('dob', dob);
            if (profileImage) {
                formData.append('photoUrl', profileImage);
            }

            const response = await axios.post(`${baseUrl}/api/auth/create-user`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`,
                    'x-api-token': apiToken
                }
            });

            if (response.data.success) {
                const userData = response.data.data || response.data.user;
                localStorage.setItem('userData', JSON.stringify(userData));
                if (response.data.uid || response.data.userId) {
                    localStorage.setItem('userId', response.data.uid || response.data.userId);
                }
                // Trigger FCM Sync
                window.dispatchEvent(new Event('userLoggedIn'));
                onClose();
                window.location.reload();
            } else {
                setError(response.data.message || 'Failed to complete registration');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Popup Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <AnimatePresence mode="wait">
                            {/* Phone Number Step */}
                            {step === 'phone' && (
                                <motion.div
                                    key="phone"
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="relative w-full max-w-sm pointer-events-auto"
                                >
                                    <div className={`relative rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-xl ${darkMode
                                        ? 'bg-[#1a1f2e]/95 border-white/10'
                                        : 'bg-white/90 border-white/20'
                                        }`}>
                                        {/* Close button */}
                                        <button
                                            onClick={onClose}
                                            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            <X size={18} />
                                        </button>

                                        {/* Icon */}
                                        <div className="flex justify-center mb-4">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFC42E] to-[#FFD700] flex items-center justify-center shadow-lg">
                                                <Smartphone size={28} className="text-gray-900" />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h2 className={`text-xl sm:text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            WhatsApp Login
                                        </h2>
                                        <p className={`text-sm text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Enter your mobile number to continue
                                        </p>

                                        {/* Phone Input */}
                                        <div className="mb-4">
                                            <div className="flex gap-2">
                                                <div className={`px-3 py-3 rounded-xl font-medium text-sm ${darkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'
                                                    }`}>
                                                    +91
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={handlePhoneChange}
                                                    placeholder="10-digit number"
                                                    maxLength={10}
                                                    className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all text-sm ${darkMode
                                                        ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10'
                                                        : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                                                        }`}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        {/* Send OTP Button */}
                                        <button
                                            onClick={handleSendOTP}
                                            disabled={loading || phoneNumber.length !== 10}
                                            className="w-full py-3 sm:py-4 rounded-xl bg-[#FFC42E] hover:bg-[#FFD700] text-gray-900 font-bold text-base sm:text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span className="text-sm sm:text-base">Sending...</span>
                                                </>
                                            ) : (
                                                'Send OTP'
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* OTP Verification Step */}
                            {step === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="relative w-full max-w-sm pointer-events-auto"
                                >
                                    <div className={`relative rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-xl ${darkMode
                                        ? 'bg-[#1a1f2e]/95 border-white/10'
                                        : 'bg-white/90 border-white/20'
                                        }`}>
                                        {/* Close & Back buttons */}
                                        <button
                                            onClick={() => setStep('phone')}
                                            className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                }`}
                                        >
                                            <X size={18} />
                                        </button>

                                        {/* Icon */}
                                        <div className="flex justify-center mb-4 mt-2">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFC42E] to-[#FFD700] flex items-center justify-center shadow-lg">
                                                <Smartphone size={28} className="text-gray-900" />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h2 className={`text-xl sm:text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            OTP Verification
                                        </h2>
                                        <p className={`text-xs sm:text-sm text-center mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Enter OTP sent to
                                        </p>
                                        <p className={`text-center mb-6 font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            +91 {phoneNumber}
                                        </p>

                                        {/* OTP Input */}
                                        <div className="flex gap-2 mb-4 justify-center">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl outline-none transition-all ${darkMode
                                                        ? 'bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E]'
                                                        : 'bg-gray-100 text-gray-900 focus:bg-gray-200 focus:ring-2 focus:ring-[#FFC42E]'
                                                        }`}
                                                    disabled={loading}
                                                />
                                            ))}
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        {/* Resend OTP */}
                                        <div className="text-center mb-4">
                                            <button
                                                onClick={handleSendOTP}
                                                disabled={loading}
                                                className={`text-xs sm:text-sm font-medium transition-colors ${darkMode ? 'text-[#FFC42E] hover:text-[#FFD700]' : 'text-blue-600 hover:text-blue-700'
                                                    } disabled:opacity-50`}
                                            >
                                                Resend OTP
                                            </button>
                                        </div>

                                        {loading && (
                                            <div className="flex justify-center">
                                                <Loader2 size={24} className="animate-spin text-[#FFC42E]" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Profile Completion Step */}
                            {step === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="relative w-full max-w-sm pointer-events-auto max-h-[90vh] overflow-y-auto"
                                >
                                    <div className={`relative rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-xl ${darkMode
                                        ? 'bg-[#1a1f2e]/95 border-white/10'
                                        : 'bg-white/90 border-white/20'
                                        }`}>
                                        {/* Title */}
                                        <h2 className={`text-xl sm:text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Complete Your Profile
                                        </h2>
                                        <p className={`text-xs sm:text-sm text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            One-time registration
                                        </p>

                                        {/* Profile Image Upload */}
                                        <div className="flex flex-col items-center mb-6">
                                            <div className="relative">
                                                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-100'
                                                    }`}>
                                                    {profilePreview ? (
                                                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User size={32} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                                                        </div>
                                                    )}
                                                </div>
                                                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FFC42E] flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#FFD700] transition-colors">
                                                    <Upload size={14} className="text-gray-900" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-3 mb-4">
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Full Name"
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all text-sm ${darkMode
                                                    ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10'
                                                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                                                    }`}
                                                disabled={loading}
                                            />

                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email Address"
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all text-sm ${darkMode
                                                    ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10'
                                                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                                                    }`}
                                                disabled={loading}
                                            />

                                            <input
                                                type="date"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl outline-none transition-all text-sm ${darkMode
                                                    ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10'
                                                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                                                    }`}
                                                disabled={loading}
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        {/* Complete Registration Button */}
                                        <button
                                            onClick={handleCompleteRegistration}
                                            disabled={loading || !fullName.trim()}
                                            className="w-full py-3 sm:py-4 rounded-xl bg-[#FFC42E] hover:bg-[#FFD700] text-gray-900 font-bold text-base sm:text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span className="text-sm sm:text-base">Completing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} />
                                                    <span className="text-sm sm:text-base">Complete Registration</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
