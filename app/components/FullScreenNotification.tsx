"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, MessageSquare, PhoneCall, UserCheck } from 'lucide-react';

interface FullScreenNotificationProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'TECH_QUESTION' | 'TECH_ASSIGNED' | 'GENERAL';
    data?: any;
}

export default function FullScreenNotification({
    isOpen,
    onClose,
    title,
    message,
    type = 'GENERAL',
    data
}: FullScreenNotificationProps) {

    const getIcon = () => {
        switch (type) {
            case 'TECH_QUESTION': return <MessageSquare size={48} className="text-yellow-400" />;
            case 'TECH_ASSIGNED': return <UserCheck size={48} className="text-green-400" />;
            default: return <HelpCircle size={48} className="text-blue-400" />;
        }
    };

    const getGradient = () => {
        switch (type) {
            case 'TECH_QUESTION': return "from-yellow-400/20 to-black";
            case 'TECH_ASSIGNED': return "from-green-400/20 to-black";
            default: return "from-blue-400/20 to-black";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
                >
                    <div className={`absolute inset-0 bg-gradient-to-b ${getGradient()} opacity-50`} />

                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-sm bg-white/5 border border-white/10 rounded-[3rem] p-8 text-center shadow-2xl"
                    >
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-glow">
                            {getIcon()}
                        </div>

                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight italic">
                            {title}
                        </h2>

                        <p className="text-gray-300 text-lg font-medium leading-tight mb-10">
                            {message}
                        </p>

                        <div className="space-y-4">
                            {type === 'TECH_QUESTION' && (
                                <button
                                    onClick={() => {
                                        // Logic to open chat or reply
                                        onClose();
                                    }}
                                    className="w-full bg-[#FFC42E] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,196,46,0.3)]"
                                >
                                    REPLY NOW
                                    <MessageSquare size={18} />
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full bg-white/10 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10"
                            >
                                DISMISS
                                <X size={18} />
                            </button>
                        </div>

                        {/* Visual Ring Animation */}
                        <div className="absolute inset-0 border-2 border-white/5 rounded-[3rem] animate-ping pointer-events-none" />
                    </motion.div>

                    {/* Incoming Call Style Pulsing Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] animate-pulse pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
