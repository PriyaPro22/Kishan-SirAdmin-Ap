import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PhoneInput from './PhoneInput';
import OTPInput from './OTPInput';
import RegistrationForm from './RegistrationForm';
import { sendOtp, verifyOtp, completeProfile, syncFcmToken } from '../../lib/auth';
import { useApp } from '../../context/AppContext';

type Step = 'phone' | 'otp' | 'register';

export default function AuthModal({ darkMode, location = '' }: { darkMode: boolean, location?: string }) {
    const { currentModal, openModal, closeModal } = useApp();
    const isOpen = currentModal === 'auth';
    const onClose = closeModal;

    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otpToken, setOtpToken] = useState('');

    // Check for incomplete registration on mount
    useEffect(() => {
        if (isOpen) {
            const checkIncompleteRegistration = async () => {
                const authToken = localStorage.getItem('authToken');
                const userId = localStorage.getItem('userId');
                const userData = localStorage.getItem('userData');

                if (authToken && userId) {
                    try {
                        const parsedData = userData ? JSON.parse(userData) : null;
                        if (!parsedData || !parsedData.name || parsedData.name.trim() === '') {
                            console.log('🔄 Incomplete registration detected - resuming...');
                            const savedPhone = localStorage.getItem('userPhone') || '';
                            setPhone(savedPhone);
                            setStep('register');
                        }
                    } catch (error) {
                        console.error('Error checking registration status:', error);
                    }
                }
            };
            checkIncompleteRegistration();
        }
    }, [isOpen]);

    const handleSendOtp = async (phoneNumber: string) => {
        const response = await sendOtp(phoneNumber);
        if (response.otpToken) {
            setOtpToken(response.otpToken);
            localStorage.setItem('otpToken', response.otpToken);
            localStorage.setItem('userPhone', phoneNumber);
        }
        setPhone(phoneNumber);
        setStep('otp');
    };

    const handleVerifyOtp = async (otp: string) => {
        const response = await verifyOtp(otpToken, otp);

        if (!response.success) {
            if (response.message === 'User not registered' || response.redirectTo === 'signup') {
                setStep('register');
                return;
            } else {
                throw new Error(response.message || 'Invalid OTP');
            }
        }

        localStorage.removeItem('otpToken');

        if (response.redirectTo === 'signup') {
            if (response.uid) localStorage.setItem('userId', response.uid);
            if (response.token) localStorage.setItem('authToken', response.token);
            setStep('register');
            return;
        }

        if (response.token) localStorage.setItem('authToken', response.token);
        const userIdValue = response.userId || response.uid;
        if (userIdValue) localStorage.setItem('userId', userIdValue);
        if (response.user) localStorage.setItem('userData', JSON.stringify(response.user));

        // Proactive FCM & Device Sync
        try {
            const token = response.token;
            const uid = userIdValue;
            if (token && uid) {
                syncFcmToken(uid, token).catch(e => console.error("Background FCM sync failed", e));
            }
        } catch (e) {
            console.error("Device sync skipped", e);
        }

        window.dispatchEvent(new Event('userLoggedIn'));
        onClose();
    };

    const handleRegistration = async (formData: FormData, newPhone: string) => {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) throw new Error('Authentication token missing. Please login again.');

            const response = await completeProfile(formData, authToken);
            if (response.success) {
                const userData = response.data || response.user;
                if (userData) localStorage.setItem('userData', JSON.stringify(userData));

                const userIdValue = response.uid || response.userId || (userData && (userData.uid || userData._id));
                if (userIdValue) localStorage.setItem('userId', userIdValue);

                // Sync Device Info
                try {
                    const uid = userIdValue;
                    if (authToken && uid) {
                        syncFcmToken(uid, authToken).catch(e => console.error("Background FCM sync failed", e));
                    }
                } catch (e) { }

                localStorage.removeItem('regDraft');
                window.dispatchEvent(new Event('userLoggedIn'));
                onClose();
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const handleBack = () => {
        if (step === 'otp' || step === 'register') setStep('phone');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 150) onClose();
                        }}
                        className="fixed bottom-0 left-0 right-0 z-[101] pointer-events-auto"
                    >
                        <div className={`relative w-full max-w-lg mx-auto rounded-t-3xl shadow-2xl ${darkMode ? 'bg-[#1a1f2e]' : 'bg-white'}`}>
                            <div className="flex justify-center pt-3 pb-2">
                                <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
                            </div>

                            <button
                                onClick={onClose}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg z-10 ${darkMode
                                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl'
                                    }`}
                            >
                                <X size={20} />
                            </button>

                            <div className="max-h-[85vh] overflow-y-auto pb-safe px-6 pb-6 mt-4">
                                <AnimatePresence mode="wait">
                                    {step === 'phone' && (
                                        <motion.div
                                            key="phone"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <PhoneInput onSubmit={handleSendOtp} darkMode={darkMode} onClose={onClose} />
                                        </motion.div>
                                    )}

                                    {step === 'otp' && (
                                        <motion.div
                                            key="otp"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <OTPInput
                                                phone={phone}
                                                onVerify={handleVerifyOtp}
                                                onResend={async () => { await sendOtp(phone); }}
                                                onBack={handleBack}
                                                darkMode={darkMode}
                                            />
                                        </motion.div>
                                    )}

                                    {step === 'register' && (
                                        <motion.div
                                            key="register"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <RegistrationForm
                                                phone={phone}
                                                location={location || 'Detecting location...'}
                                                onSubmit={handleRegistration}
                                                darkMode={darkMode}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
