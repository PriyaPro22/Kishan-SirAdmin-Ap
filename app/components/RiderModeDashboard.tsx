"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bike,
    Map as MapIcon,
    Wallet,
    Star,
    LogOut,
    ChevronRight,
    Zap,
    ShieldCheck,
    LayoutDashboard,
    Clock,
    Navigation,
    ArrowRight,
    TrendingUp,
    X
} from 'lucide-react';

interface RiderModeDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
}

export default function RiderModeDashboard({ isOpen, onClose, darkMode }: RiderModeDashboardProps) {
    const [isOnline, setIsOnline] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden"
                >
                    {/* HEADER */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
                            <button
                                onClick={() => setIsOnline(false)}
                                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!isOnline ? "bg-red-500 text-white" : "text-white/60"}`}
                            >
                                OFFLINE
                            </button>
                            <button
                                onClick={() => setIsOnline(true)}
                                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${isOnline ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]" : "text-white/60"}`}
                            >
                                ONLINE
                            </button>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-yellow-400">
                            <Star size={20} fill="currentColor" />
                        </div>
                    </div>

                    {/* BACKGROUND MAP MOCK */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
                            className="w-full h-full object-cover opacity-40 grayscale"
                            alt="map"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 mt-24 mb-32 px-6 z-10 overflow-y-auto hide-scrollbar">
                        {/* STATS SECTION */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                                        <Wallet size={16} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">Earnings Today</span>
                                </div>
                                <h3 className="text-2xl font-black text-white">₹0.00</h3>
                                <div className="flex items-center gap-1 mt-1 text-green-400 text-[10px]">
                                    <TrendingUp size={12} />
                                    <span>+0%</span>
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-400">
                                        <Clock size={16} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">Total Hours</span>
                                </div>
                                <h3 className="text-2xl font-black text-white">0.0h</h3>
                                <div className="flex items-center gap-1 mt-1 text-white/40 text-[10px]">
                                    <span>Ready to ride</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* TASKS SECTION */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h2 className="text-lg font-black text-white">Upcoming Tasks</h2>
                                <button className="text-[10px] uppercase font-bold text-yellow-400">View All</button>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Bike size={32} className="text-white/20" />
                                </div>
                                <p className="text-white font-bold mb-1">No active tasks</p>
                                <p className="text-white/40 text-xs">Go online to start receiving orders in your area.</p>
                            </div>
                        </div>

                        {/* PROMOTIONS / NEWS */}
                        <div className="mb-6">
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <span className="bg-black/20 backdrop-blur-md text-black/80 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-3 inline-block">
                                        Incentive
                                    </span>
                                    <h3 className="text-xl font-black text-black mb-1">Earn ₹500 Extra</h3>
                                    <p className="text-black/70 text-xs font-medium">Complete 10 orders before 6 PM today.</p>
                                </div>
                                <Zap size={80} className="absolute -right-4 -bottom-4 text-black/10 -rotate-12" />
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM CONTROLS */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
                        <div className="flex gap-4">
                            <button className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                                My Dashboard
                                <LayoutDashboard size={18} />
                            </button>
                            <button className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white">
                                <Navigation size={24} />
                            </button>
                        </div>
                    </div>

                    {/* COMING SOON OVERLAY */}
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 text-center max-w-sm pointer-events-auto shadow-2xl"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-yellow-400 flex items-center justify-center mx-auto mb-6 shadow-[0_10px_40px_rgba(255,196,46,0.4)]">
                                <Bike size={40} className="text-black" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">Bhai, thoda sabar karo!</h2>
                            <div className="h-1 w-12 bg-yellow-400 mx-auto mb-6 rounded-full" />
                            <p className="text-gray-300 text-lg font-medium leading-relaxed mb-8">
                                Rider Mode ekdam Rapido jaisa ban raha hai. Bas kuch hi din me launch hoga!
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                                    <ShieldCheck className="text-green-400 shrink-0" size={20} />
                                    <span className="text-white/80 text-sm font-bold uppercase tracking-wider">Secure Earnings</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                                    <Navigation className="text-blue-400 shrink-0" size={20} />
                                    <span className="text-white/80 text-sm font-bold uppercase tracking-wider">Instant Navigation</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full mt-10 bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group transition-all active:scale-95"
                            >
                                GOT IT, BHAI
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
