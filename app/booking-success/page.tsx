'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Copy, AlertCircle, Wallet, Smartphone, CreditCard, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import PaymentModeSheet from '../components/PaymentModeSheet';
import toast from 'react-hot-toast';

function BookingSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { darkMode } = useApp();
    const [serviceId, setServiceId] = useState('');
    const [bookingData, setBookingData] = useState<any>(null);
    const [isLoadingBooking, setIsLoadingBooking] = useState(true);
    const [showPaymentSheet, setShowPaymentSheet] = useState(false);

    // Generate stars for the "Star Shower" effect
    const [stars] = useState(() => Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
        size: 8 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.7
    })));

    useEffect(() => {
        const fetchBooking = async (orderId: string) => {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            if (!userId) return;

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';
                const res = await axios.get(`${baseUrl}/api/service/${userId}/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
                    }
                });
                const data = res.data?.data || res.data;
                setBookingData(data);
            } catch (err) {
                console.error("Failed to fetch booking details:", err);
            } finally {
                setIsLoadingBooking(false);
            }
        };

        const paramId = searchParams.get('orderId');
        if (paramId) {
            setServiceId(paramId);
            fetchBooking(paramId);
        } else {
            const storedServiceId = localStorage.getItem('lastServiceId');
            if (storedServiceId) {
                setServiceId(storedServiceId);
                fetchBooking(storedServiceId);
            } else {
                setIsLoadingBooking(false);
            }
        }
    }, [searchParams]);

    const handlePaymentModeConfirm = async (mode: 'FULL' | 'ADVANCE' | 'CASH') => {
        if (mode === 'CASH') {
            try {
                setBookingData((prev: any) => ({
                    ...prev,
                    paymentBeforeService: {
                        ...prev?.paymentBeforeService,
                        paymentMode: "PAYAFTER"
                    }
                }));
                setShowPaymentSheet(false);
                toast.success("Payment method updated to Pay After Service", { duration: 3000 });
            } catch (err) {
                console.error("Update failed", err);
                toast.error("Failed to update payment method");
            }
        } else {
            toast.success(`Processing ${mode} Payment...`);
            setShowPaymentSheet(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#00A36C] flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* ✨ Star Shower Animation ✨ */}
            <div className="absolute inset-0 pointer-events-none">
                {stars.map((star) => (
                    <motion.div
                        key={`star-${star.id}`}
                        initial={{ y: -100, x: 0, opacity: 0, scale: 0 }}
                        animate={{
                            y: '110vh',
                            x: (Math.random() - 0.5) * 100,
                            opacity: [0, star.opacity, star.opacity, 0],
                            scale: [0.5, 1.5, 1, 0.5],
                            rotate: [0, 180, 360]
                        }}
                        transition={{
                            duration: star.duration,
                            delay: star.delay,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            left: `${star.left}%`,
                            fontSize: `${star.size}px`,
                            top: -100
                        }}
                        className="text-yellow-300 drop-shadow-[0_0_15px_rgba(255,255,0,0.9)]"
                    >
                        ★
                    </motion.div>
                ))}
            </div>

            {/* Content Container */}
            <div className="w-full max-w-sm flex flex-col items-center relative z-10">

                {/* Big Checkmark Hero */}
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 150 }}
                    className="w-32 h-32 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <CheckCircle size={80} className="text-white" strokeWidth={3} />
                    </motion.div>
                </motion.div>

                {/* Big Celebration Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-black tracking-tighter leading-[0.9] text-white italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                        YOUR ORDER IS <br />
                        <span className="text-yellow-300">SUCCESSFULLY</span> <br />
                        GENERATED!
                    </h1>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Sparkles className="text-yellow-300 w-4 h-4" />
                        <p className="text-[10px] font-black uppercase tracking-[5px] text-white/90">
                            Professional Assigned
                        </p>
                        <Sparkles className="text-yellow-300 w-4 h-4" />
                    </div>
                </motion.div>

                {/* Booking Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full mt-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-8 shadow-2xl relative"
                >
                    {/* Corner Accent */}
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center rotate-12 shadow-lg">
                        <CheckCircle size={24} className="text-green-700" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-black uppercase tracking-[4px] text-white/60 mb-2">Booking Reference ID</p>
                            <h2 className="text-2xl font-mono font-black tracking-tighter text-white bg-white/10 px-6 py-2 rounded-2xl">
                                {serviceId || "LOADING..."}
                            </h2>
                        </div>

                        <div className="h-px bg-white/10 w-full" />

                        {/* Interactive Payment Switch Box */}
                        <div
                            onClick={() => setShowPaymentSheet(true)}
                            className="bg-white/10 hover:bg-white/20 p-4 rounded-3xl transition-all cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <CreditCard size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">Payment Mode</p>
                                    <p className="text-xs font-black uppercase italic text-white flex items-center gap-1">
                                        {bookingData?.paymentBeforeService?.paymentMode === "PAYAFTER" ? "Pay After Service" : "Online Success"}
                                        <ChevronRight size={14} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full mt-8 space-y-4"
                >
                    <button
                        onClick={() => router.push(`/bookings/${serviceId}`)}
                        className="w-full bg-white text-green-700 font-extrabold italic py-5 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 uppercase tracking-widest transition-all active:scale-95 hover:bg-yellow-50"
                    >
                        <span>Track Your Expert</span>
                        <ChevronRight size={20} strokeWidth={4} />
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-2 text-[10px] font-black uppercase tracking-[5px] text-white/70 hover:text-white transition-colors"
                    >
                        Return to Home
                    </button>
                </motion.div>
            </div>

            {/* Final Info Strip */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 px-10 text-center pointer-events-none"
            >
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-relaxed italic">
                    Confirmation tokens shared via <br /> WhatsApp & Email
                </p>
            </motion.div>

            {/* Switch Sheet */}
            <PaymentModeSheet
                isOpen={showPaymentSheet}
                onClose={() => setShowPaymentSheet(false)}
                onConfirm={handlePaymentModeConfirm}
                totals={{ grandTotal: bookingData?.metaModels?.totalAmount || 0 }}
                darkMode={true}
            />
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={null}>
            <BookingSuccessContent />
        </Suspense>
    );
}
