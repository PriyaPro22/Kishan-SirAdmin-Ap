import React, { useState, useEffect } from 'react';
import { Smartphone, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PhoneInputProps {
    onSubmit: (phone: string) => Promise<void>;
    darkMode: boolean;
    onClose: () => void;
}

export default function PhoneInput({ onSubmit, darkMode, onClose }: PhoneInputProps) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load saved phone number on mount
    useEffect(() => {
        const savedPhone = localStorage.getItem('phoneInputDraft');
        if (savedPhone) {
            setPhone(savedPhone);
        }
    }, []);

    // Auto-save phone number on change
    useEffect(() => {
        if (phone) {
            localStorage.setItem('phoneInputDraft', phone);
        }
    }, [phone]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setPhone(value);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }
        setLoading(true);
        try {
            await onSubmit(phone);
            // Clear draft on successful submission
            localStorage.removeItem('phoneInputDraft');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative rounded-3xl p-8 shadow-2xl border backdrop-blur-xl overflow-hidden ${darkMode ? 'bg-[#1a1f2e]/80 border-white/10' : 'bg-white/80 border-white/40'
            }`}>
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFC42E]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC42E] to-[#FFD700] shadow-[0_8px_30px_rgb(255,196,46,0.3)] mb-4">
                    <Smartphone size={32} className="text-gray-900" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Welcome Back
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter your WhatsApp number to continue
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="mb-6">
                    <label className={`block text-xs font-semibold mb-2 ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        MOBILE NUMBER
                    </label>
                    <div className="relative flex items-center">
                        <div className={`absolute left-0 pl-4 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="text-lg font-medium">🇮🇳 +91</span>
                            <div className={`h-6 w-px mx-3 ${darkMode ? 'bg-white/10' : 'bg-gray-300'}`} />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={handleChange}
                            placeholder="98765 43210"
                            className={`w-full py-4 pl-[90px] pr-4 rounded-xl text-lg font-medium outline-none transition-all placeholder:text-opacity-50 ${darkMode
                                ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E]/50'
                                : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFC42E]/50 border border-transparent focus:border-[#FFC42E]'
                                }`}
                        />
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="group w-full py-4 rounded-xl bg-gradient-to-r from-[#FFC42E] to-[#FFD700] text-gray-900 font-bold text-lg shadow-[0_4px_20px_rgb(255,196,46,0.3)] hover:shadow-[0_6px_25px_rgb(255,196,46,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Sending OTP...</span>
                        </>
                    ) : (
                        <>
                            <span>Get OTP</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className={`mt-6 text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                By continuing, you agree to our Terms of Service & Privacy Policy
            </p>
        </div>
    );
}
