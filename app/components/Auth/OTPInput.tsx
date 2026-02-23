import React, { useState, useRef, useEffect } from 'react';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface OTPInputProps {
    phone: string;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
    darkMode: boolean;
    otpToken?: string; // Optional for now, phone is kept for display
}

export default function OTPInput({ phone, onVerify, onResend, onBack, darkMode }: OTPInputProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(30);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first input
        refs.current[0]?.focus();

        const interval = setInterval(() => {
            setTimer((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            refs.current[index + 1]?.focus();
        }

        if (newOtp.every(d => d !== '') && index === 5) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpCode: string) => {
        setLoading(true);
        try {
            await onVerify(otpCode);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            refs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setTimer(30);
        setOtp(['', '', '', '', '', '']);
        refs.current[0]?.focus();
        setError('');
        try {
            await onResend();
        } catch (err: any) {
            setError('Failed to resend');
        }
    };

    // Paste Handler
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (!/^\d+$/.test(pastedData)) return;

        const digits = pastedData.split('').slice(0, 6);
        const newOtp = [...Array(6)].map((_, i) => digits[i] || '');
        setOtp(newOtp);

        if (digits.length === 6) {
            handleVerify(digits.join(''));
        }
    };

    // WebOTP API for Auto-Fill
    useEffect(() => {
        if ('OTPCredential' in window) {
            const ac = new AbortController();

            navigator.credentials.get({
                otp: { transport: ['sms'] },
                signal: ac.signal
            } as any)
                .then((otp: any) => {
                    const code = otp.code;
                    if (code) {
                        const newOtp = code.split('').slice(0, 6);
                        setOtp(newOtp);
                        handleVerify(code);
                    }
                })
                .catch(err => {
                    console.log('WebOTP Error:', err);
                });

            return () => {
                ac.abort();
            };
        }
    }, []);

    return (
        <div className={`relative rounded-3xl p-8 shadow-2xl border backdrop-blur-xl overflow-hidden ${darkMode ? 'bg-[#1a1f2e]/80 border-white/10' : 'bg-white/80 border-white/40'
            }`}>
            {/* Decorative Elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFC42E]/20 rounded-full blur-3xl pointer-events-none" />

            <button
                onClick={onBack}
                className={`absolute top-6 left-6 p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
            >
                <ArrowLeft size={20} />
            </button>

            <div className="text-center mb-8 mt-4 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC42E] to-[#FFD700] shadow-[0_8px_30px_rgb(255,196,46,0.3)] mb-4">
                    <Lock size={32} className="text-gray-900" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Verify OTP
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter the code sent to <span className="font-semibold text-[#FFC42E]">{phone.startsWith('+91') ? phone : `+91 ${phone}`}</span>
                </p>
            </div>


            <div className="mb-8">
                <label className={`block text-xs font-semibold mb-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ENTER 6-DIGIT CODE
                </label>
                <input
                    ref={el => { refs.current[0] = el }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp.join('')}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const digits = value.split('').slice(0, 6);
                        const newOtp = [...Array(6)].map((_, i) => digits[i] || '');
                        setOtp(newOtp);
                        setError('');

                        if (digits.length === 6) {
                            handleVerify(value);
                        }
                    }}
                    onPaste={handlePaste}
                    placeholder="000000"
                    className={`w-full px-6 py-4 text-center text-3xl font-bold tracking-[0.5em] rounded-xl outline-none transition-all shadow-sm ${darkMode
                        ? 'bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E] border border-white/10 placeholder-white/20'
                        : 'bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#FFC42E] border border-gray-200 placeholder-gray-300'
                        }`}
                />
                <p className={`text-xs text-center mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {otp.join('').length}/6 digits entered
                </p>
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
                onClick={() => handleVerify(otp.join(''))}
                disabled={loading || otp.some(d => !d)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFC42E] to-[#FFD700] text-gray-900 font-bold text-lg shadow-[0_4px_20px_rgb(255,196,46,0.3)] hover:shadow-[0_6px_25px_rgb(255,196,46,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Continue'}
            </button>

            <div className="text-center">
                {timer > 0 ? (
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Resend code in <span className="font-mono text-[#FFC42E]">{timer}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        className="text-sm font-semibold text-[#FFC42E] hover:underline"
                    >
                        Resend Code
                    </button>
                )}
            </div>
        </div>
    );
}
