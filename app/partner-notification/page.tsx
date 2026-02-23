'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    X,
    MapPin,
    Clock,
    Check,
    ChevronRight,
    Sun,
    Moon,
    Zap,
    MoreVertical,
    IndianRupee,
    Menu as MenuIcon,
    Navigation
} from 'lucide-react';

const SAMPLE_LEADS = [
    {
        id: "#ORD-8821",
        title: "AC Deep Cleaning",
        description: "Heavy dust buildup in compressor",
        price: 450,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4-q-LejNXc0dAeiq8F6H5KDAv3kAMrHyB088eF4XMGS8_YbMv5q_iD5TUxDwzaAbXPIvSnzRwMNuwLzKRiunvidSsY5aiKbFYYcz7D2bvp8VVx6qhlwxYkdtknpZ0QH_4R6XKN3-MVZ0ElBhQY7zgiWunC6xGo51tqb2D2e6U414k3mZMIVfnICjMLC-45lJko9-ntTusLHERjtR8F8NYmObQeEtBdJaHWo8MJ5noB1L3B9-rshRfw7mQ11px3mA8SBghVgsVaA",
        distance: "5.2 km"
    },
    {
        id: "#ORD-8822",
        title: "AC Deep Cleaning",
        description: "Heavy dust buildup in compressor",
        price: 450,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4-q-LejNXc0dAeiq8F6H5KDAv3kAMrHyB088eF4XMGS8_YbMv5q_iD5TUxDwzaAbXPIvSnzRwMNuwLzKRiunvidSsY5aiKbFYYcz7D2bvp8VVx6qhlwxYkdtknpZ0QH_4R6XKN3-MVZ0ElBhQY7zgiWunC6xGo51tqb2D2e6U414k3mZMIVfnICjMLC-45lJko9-ntTusLHERjtR8F8NYmObQeEtBdJaHWo8MJ5noB1L3B9-rshRfw7mQ11px3mA8SBghVgsVaA",
        distance: "5.2 km"
    },
    {
        id: "#ORD-9022",
        title: "Washing Machine Repair",
        description: "Water leakage from bottom tray",
        price: 820,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4-q-LejNXc0dAeiq8F6H5KDAv3kAMrHyB088eF4XMGS8_YbMv5q_iD5TUxDwzaAbXPIvSnzRwMNuwLzKRiunvidSsY5aiKbFYYcz7D2bvp8VVx6qhlwxYkdtknpZ0QH_4R6XKN3-MVZ0ElBhQY7zgiWunC6xGo51tqb2D2e6U414k3mZMIVfnICjMLC-45lJko9-ntTusLHERjtR8F8NYmObQeEtBdJaHWo8MJ5noB1L3B9-rshRfw7mQ11px3mA8SBghVgsVaA",
        distance: "5.2 km"
    },
    {
        id: "#ORD-7712",
        title: "Refrigerator Checkup",
        description: "Not cooling properly, gas refill",
        price: 300,
        icon: "fridge",
        distance: "5.2 km"
    },
    {
        id: "#ORD-5541",
        title: "Electrical Fitting",
        description: "Multiple fan point installations",
        price: 550,
        icon: "light",
        distance: "5.2 km"
    }
];

export default function PartnerNotificationPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15);
    const [accepted, setAccepted] = useState(false);
    const [rejected, setRejected] = useState(false);

    // Slider animation
    const x = useMotionValue(0);
    const xInput = [-80, 0, 80];
    const bgTransform = useTransform(x, xInput, [
        "rgba(239, 68, 68, 1)",
        "rgba(0, 0, 0, 0)",
        "rgba(34, 197, 94, 1)"
    ]);

    const rejectOpacity = useTransform(x, [-60, -20], [1, 0]);
    const acceptOpacity = useTransform(x, [20, 60], [0, 1]);

    useEffect(() => {
        if (timeLeft <= 0 || accepted || rejected) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, accepted, rejected]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 60) setAccepted(true);
        else if (info.offset.x < -60) setRejected(true);
        else x.set(0);
    };

    const themeClasses = isDarkMode
        ? "bg-[#050B18] text-white"
        : "bg-[#F7F8FA] text-[#1A202C]";

    const cardClasses = isDarkMode
        ? "bg-[#112236] border-white/5 shadow-2xl shadow-black/20"
        : "bg-white border-slate-200 shadow-lg shadow-slate-200/50";

    return (
        <div className={`fixed inset-0 z-[10000] ${themeClasses} font-display overflow-hidden select-none transition-colors duration-500 flex flex-col`}>

            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDarkMode ? 'bg-amber-500/10' : 'bg-amber-200/5'}`} />
            </div>

            <div className="relative h-full flex flex-col pt-8">

                {/* THEME & STATUS */}
                <div className="px-6 flex justify-between items-center mb-6 shrink-0">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'border-white/10 bg-white/5 text-amber-400' : 'border-slate-200 bg-white text-blue-600 shadow-sm'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <div className={`flex items-center gap-2 px-6 py-2 rounded-full border ${isDarkMode ? 'bg-white text-blue-900 border-white/20' : 'bg-white border-slate-200 text-blue-900 shadow-sm'}`}>
                        <Zap size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Incoming Instant Leads</span>
                    </div>
                    <div className="w-10 h-10" />
                </div>

                {/* HEADER: ID & TIMER */}
                <div className="px-8 flex justify-between items-end mb-8 shrink-0">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Booking Reference</span>
                        <h1 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SERLKW00001</h1>
                    </div>

                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" className={`${isDarkMode ? 'stroke-white/10' : 'stroke-slate-200'} fill-none stroke-[6px]`} />
                            <motion.circle
                                cx="32" cy="32" r="28"
                                className="stroke-amber-400 fill-none stroke-[6px]"
                                strokeDasharray="176"
                                animate={{ strokeDashoffset: 176 - (176 * timeLeft) / 15 }}
                                transition={{ duration: 1, ease: 'linear' }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                00:{String(timeLeft).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* USER INFO BAR */}
                <div className="px-8 flex items-center justify-between mb-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 p-0.5">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                                className="w-full h-full rounded-full bg-slate-800"
                                alt="avatar"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h2 className={`font-black text-xl leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Alex Thompson</h2>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lead Technician</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10">
                            <MapPin size={12} fill="currentColor" />
                            <span className="text-[12px] font-black">{SAMPLE_LEADS[0].distance || '5.2 km'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10">
                            <Clock size={12} fill="currentColor" />
                            <span className="text-[12px] font-black">10 min</span>
                        </div>
                    </div>
                </div>

                {/* SCROLLABLE JOB CARDS */}
                <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-40 hide-scrollbar">
                    {SAMPLE_LEADS.map((lead, idx) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`w-full rounded-[2rem] border p-6 pt-10 flex items-center gap-5 relative group ${cardClasses}`}
                        >
                            <div className={`absolute top-4 left-6 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${isDarkMode ? 'bg-blue-600/20 text-blue-400 border-blue-600/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {lead.id}
                            </div>

                            <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                                {lead.image ? (
                                    <>
                                        <img src={lead.image} className="w-full h-full object-cover opacity-60 scale-150" alt="map" />
                                        <div className="absolute inset-0 bg-blue-500/10" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_#FBBF24]" />
                                        </div>
                                    </>
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                                        <Zap size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pr-10">
                                <h3 className={`text-lg font-black leading-tight mb-1 truncate ${isDarkMode ? 'text-white/90' : 'text-slate-800'}`}>
                                    {lead.title}
                                </h3>
                                <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {lead.description}
                                </p>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                                <div className="flex items-center gap-0.5">
                                    <span className={`text-lg font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>₹</span>
                                    <span className={`text-2xl font-black tracking-tighter italic ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>
                                        {lead.price}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="flex flex-col items-center py-6 opacity-20">
                        <MoreVertical size={20} />
                    </div>
                </div>

                {/* FOOTER: Sticky Total & Slider */}
                <div className={`mt-auto shrink-0 p-6 pb-12 ${isDarkMode ? 'bg-gradient-to-t from-[#050B18] via-[#050B18] to-transparent' : 'bg-gradient-to-t from-white via-white to-transparent'}`}>
                    <div className="max-w-md mx-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                Potential Total
                            </span>
                            <div className={`flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>
                                <span className="text-xl font-black">₹</span>
                                <span className="text-4xl font-black tracking-tighter italic">450.00</span>
                            </div>
                        </div>

                        {/* Swipe Action Toggle */}
                        <div className={`relative w-48 h-14 rounded-full p-1.5 flex items-center justify-center overflow-hidden transition-all shadow-sm ${isDarkMode ? 'bg-[#112236] border border-white/5' : 'bg-slate-200 border border-slate-300'}`}>

                            {/* Background Color Feedback */}
                            <motion.div
                                style={{ backgroundColor: bgTransform }}
                                className="absolute inset-0 opacity-20 pointer-events-none"
                            />

                            {/* Labels */}
                            <motion.div
                                style={{ opacity: rejectOpacity }}
                                className="absolute left-4 flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest pointer-events-none"
                            >
                                <X size={12} /> Reject
                            </motion.div>

                            <motion.div
                                style={{ opacity: acceptOpacity }}
                                className="absolute right-4 flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-widest pointer-events-none"
                            >
                                Accept <Check size={12} />
                            </motion.div>

                            {/* Central Handle */}
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: -75, right: 75 }}
                                dragElastic={0.05}
                                onDragEnd={handleDragEnd}
                                style={{ x }}
                                className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl transition-all ${isDarkMode ? 'bg-slate-200 text-[#050B18]' : 'bg-slate-900 text-white'}`}
                            >
                                <MenuIcon size={18} strokeWidth={3} />
                            </motion.div>

                            {/* Hint Dots */}
                            <div className="absolute inset-0 flex items-center justify-between px-10 pointer-events-none opacity-10">
                                <div className="w-1 h-1 rounded-full bg-current" />
                                <div className="w-1 h-1 rounded-full bg-current" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Overlays */}
            <AnimatePresence>
                {(accepted || rejected) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[10001] flex flex-col items-center justify-center p-12 text-center backdrop-blur-3xl ${accepted ? 'bg-green-600/95' : 'bg-red-600/95'}`}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
                        >
                            {accepted ? <Check size={44} strokeWidth={4} className="text-green-600" /> : <X size={44} strokeWidth={4} className="text-red-600" />}
                        </motion.div>
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">
                            {accepted ? 'Confirmed!' : 'Dismissed'}
                        </h2>
                        <p className="text-white/80 font-bold mb-10">
                            {accepted ? 'Connecting you to the customer now...' : 'Looking for other available jobs...'}
                        </p>
                        <button
                            onClick={() => { setAccepted(false); setRejected(false); x.set(0); }}
                            className="px-14 h-16 bg-white text-black font-black rounded-full shadow-2xl uppercase tracking-widest text-xs active:scale-95 transition-transform"
                        >
                            Continue
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                /* Suppress global UI */
                nav, .floating-cart, .BottomNav_container, [id*="Cart"] {
                    display: none !important;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
