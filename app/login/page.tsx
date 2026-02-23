'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, User, Mail, Calendar, Upload, Check, Loader2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

export default function LoginPage() {
    const router = useRouter();
    const { darkMode } = useApp();

    // States
    const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpToken, setOtpToken] = useState('');
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

    // Resume session if token exists but registration not complete
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const uid = localStorage.getItem('userId');
        const storedPhone = localStorage.getItem('phoneNumber');

        if (storedPhone) setPhoneNumber(storedPhone);

        if (token && !uid) {
            setStep('profile');
        }
    }, []);

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

            const response = await axios.post(`${baseUrl}/send-otp`, {
                mobile: phoneNumber
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': apiToken
                }
            });

            if (response.data.success) {
                if (response.data.otpToken) {
                    setOtpToken(response.data.otpToken);
                    localStorage.setItem('otpToken', response.data.otpToken);
                }
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

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all digits entered
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

            const response = await axios.post(`${baseUrl}/verify-otp`, {
                otpToken: otpToken,
                otp: otpCode,
                deviceId: localStorage.getItem('bwa_device_id') || 'UNKNOWN'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': apiToken
                }
            });

            if (response.data.success) {
                if (response.data.conflict) {
                    setError('This account is already active on another device.');
                    setLoading(false);
                    return;
                }
                localStorage.removeItem('otpToken');

                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }

                localStorage.setItem('phoneNumber', phoneNumber);

                const userId = response.data.uid || response.data.userId;
                if (userId) {
                    localStorage.setItem('userId', userId);
                }

                // If existing user, save user object
                if (response.data.user) {
                    localStorage.setItem('userData', JSON.stringify({
                        ...response.data.user,
                        uid: userId
                    }));
                }

                if (response.data.redirectTo === 'signup') {
                    setStep('profile');
                } else {
                    window.dispatchEvent(new Event('userLoggedIn'));
                    router.push('/');
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
        if (!fullName.trim() || !email.trim()) {
            setError('Please enter your full name and email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const authToken = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('name', fullName);
            formData.append('email', email);
            if (dob) formData.append('dob', dob);
            if (profileImage) {
                formData.append('photoUrl', profileImage);
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            const response = await axios.post(`${baseUrl}/create-user`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`,
                    'x-api-token': apiToken
                }
            });

            if (response.data.success) {
                const userId = response.data.uid || response.data.userId;
                if (userId) {
                    localStorage.setItem('userId', userId);
                }

                // Save formatted userData for the app to consume
                const userData = {
                    uid: userId,
                    name: fullName,
                    email: email,
                    dob: dob,
                    phoneNumber: phoneNumber,
                    photoUrl: response.data.photoUrl || profilePreview
                };
                localStorage.setItem('userData', JSON.stringify(userData));

                window.dispatchEvent(new Event('userLoggedIn'));
                router.push('/');
            } else {
                setError(response.data.message || 'Failed to create user');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 ${darkMode ? 'bg-[#050B14]' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
            }`}>
            {/* Background blur effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <AnimatePresence mode="wait">
                {/* Phone Number Step */}
                {step === 'phone' && (
                    <motion.div
                        key="phone"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-md"
                    >
                        <div className={`relative rounded-[2rem] p-8 shadow-2xl border backdrop-blur-xl ${darkMode
                            ? 'bg-[#1a1f2e]/90 border-white/10'
                            : 'bg-white/80 border-white/20'
                            }`}
                            style={{
                                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset'
                            }}>
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden p-2">
                                    <img src="/logo.png" alt="Bijli Wala Aya" className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className={`text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                WhatsApp Login
                            </h2>
                            <p className={`text-center mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Enter your mobile number to continue
                            </p>

                            {/* Phone Input */}
                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Mobile Number
                                </label>
                                <div className="flex gap-3">
                                    <div className={`px-4 py-3 rounded-xl font-medium ${darkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'
                                        }`}>
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="Enter 10-digit mobile number"
                                        maxLength={10}
                                        className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all ${darkMode
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
                                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Send OTP Button */}
                            <button
                                onClick={handleSendOTP}
                                disabled={loading || phoneNumber.length !== 10}
                                className="w-full py-4 rounded-xl bg-[#FFC42E] hover:bg-[#FFD700] text-gray-900 font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Sending OTP...
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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-md"
                    >
                        <div className={`relative rounded-[2rem] p-8 shadow-2xl border backdrop-blur-xl ${darkMode
                            ? 'bg-[#1a1f2e]/90 border-white/10'
                            : 'bg-white/80 border-white/20'
                            }`}
                            style={{
                                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset'
                            }}>
                            {/* Close button */}
                            <button
                                onClick={() => setStep('phone')}
                                className={`absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                            >
                                <X size={18} />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden p-2">
                                    <img src="/logo.png" alt="Bijli Wala Aya" className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className={`text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                OTP Verification
                            </h2>
                            <p className={`text-center mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Enter OTP sent to your mobile
                            </p>
                            <p className={`text-center mb-8 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                +91 {phoneNumber}
                            </p>

                            {/* OTP Input */}
                            <div className="flex gap-2 mb-6 justify-center">
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
                                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all ${darkMode
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
                                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Resend OTP */}
                            <div className="text-center mb-6">
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className={`text-sm font-medium transition-colors ${darkMode ? 'text-[#FFC42E] hover:text-[#FFD700]' : 'text-blue-600 hover:text-blue-700'
                                        } disabled:opacity-50`}
                                >
                                    Resend OTP
                                </button>
                            </div>

                            {/* Loading indicator */}
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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-md"
                    >
                        <div className={`relative rounded-[2rem] p-8 shadow-2xl border backdrop-blur-xl ${darkMode
                            ? 'bg-[#1a1f2e]/90 border-white/10'
                            : 'bg-white/80 border-white/20'
                            }`}
                            style={{
                                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset'
                            }}>
                            {/* Title */}
                            <h2 className={`text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Complete Your Profile
                            </h2>
                            <p className={`text-center mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                One-time registration
                            </p>

                            {/* Profile Image Upload */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-100'
                                        }`}>
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={40} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FFC42E] flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#FFD700] transition-colors">
                                        <Upload size={16} className="text-gray-900" />
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
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${darkMode
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
                                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${darkMode
                                        ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10'
                                        : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                                        }`}
                                    disabled={loading}
                                />

                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    placeholder="Date of Birth"
                                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${darkMode
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
                                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Complete Registration Button */}
                            <button
                                onClick={handleCompleteRegistration}
                                disabled={loading || !fullName.trim()}
                                className="w-full py-4 rounded-xl bg-[#FFC42E] hover:bg-[#FFD700] text-gray-900 font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Complete Registration
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
