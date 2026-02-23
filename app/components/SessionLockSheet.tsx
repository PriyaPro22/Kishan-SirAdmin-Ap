"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SessionLockSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onStay: () => void;
    onLogout: () => void;
}

export default function SessionLockSheet({ isOpen, onClose, onStay, onLogout }: SessionLockSheetProps) {
    const { darkMode } = useApp();

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
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed bottom-0 left-0 right-0 z-[201] w-full max-w-md mx-auto rounded-t-[32px] border-t p-8 shadow-2xl ${darkMode ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-gray-100'
                            }`}
                    >
                        <div className="w-12 h-1.5 bg-gray-400/20 rounded-full mx-auto mb-8" />

                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
                                <ShieldAlert size={40} className="text-red-500" />
                            </div>

                            <h3 className={`text-2xl font-black italic tracking-tight uppercase mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Security Alert
                            </h3>
                            <p className={`text-sm font-medium mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                A new device is trying to login to your account. What do you want to do?
                            </p>

                            <div className="w-full space-y-4">
                                <button
                                    onClick={onStay}
                                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black italic tracking-widest uppercase shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                >
                                    <CheckCircle2 size={20} />
                                    Keep Local Session
                                </button>

                                <button
                                    onClick={onLogout}
                                    className={`w-full py-4 rounded-2xl font-black italic tracking-widest uppercase flex items-center justify-center gap-3 active:scale-95 transition-all ${darkMode ? 'bg-white/5 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-100'
                                        }`}
                                >
                                    <LogOut size={20} />
                                    Logout Everywhere
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
