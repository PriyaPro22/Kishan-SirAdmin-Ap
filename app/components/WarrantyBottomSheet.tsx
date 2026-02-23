'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { BrandLogo } from './Branding';
import Lottie from 'lottie-react';
import warrantyAnim from '../../public/animations/safe-done.json';

interface WarrantyBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
}

const WarrantyBottomSheet: React.FC<WarrantyBottomSheetProps> = ({ isOpen, onClose, darkMode }) => {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className={`fixed bottom-0 left-0 right-0 z-[111] mx-auto w-full max-w-[500px] min-[500px]:left-1/2 min-[500px]:-translate-x-1/2 ${darkMode ? 'bg-gray-900 border-t border-white/10' : 'bg-white border-t border-gray-100'
                            } rounded-t-[2.5rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-500`}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <Lottie animationData={warrantyAnim} loop={true} style={{ width: 40, height: 40 }} />
                                </div>
                                <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Service Warranty</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-12 pt-4">
                            {/* Main Banner */}
                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[2rem] p-6 text-gray-900 shadow-xl mb-8 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Bijli Wala Trusted</div>
                                        <div className="text-3xl font-black italic tracking-tighter">45 DAYS</div>
                                        <div className="text-xs font-bold uppercase tracking-widest -mt-1">Full Service Warranty</div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    {
                                        title: 'What is Covered?',
                                        desc: 'Any issues directly related to the service provided will be fixed free of charge within 45 days.',
                                        icon: CheckCircle2,
                                        color: 'text-green-500'
                                    },
                                    {
                                        title: 'Genuine Parts',
                                        desc: 'We use 100% genuine spare parts. If a part fails, it falls under the respective manufacturer warranty.',
                                        icon: Zap,
                                        color: 'text-yellow-500'
                                    },
                                    {
                                        title: 'Expert Technicians',
                                        desc: 'All services are performed by background-verified and expert Bijli Wala partners.',
                                        icon: ShieldCheck,
                                        color: 'text-blue-500'
                                    },
                                    {
                                        title: 'Hassle-Free Claim',
                                        desc: 'Just call our support or raise a re-service request from the app history within the warranty period.',
                                        icon: Clock,
                                        color: 'text-purple-500'
                                    }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className={`p-5 rounded-[1.5rem] border ${darkMode ? 'bg-gray-800/50 border-white/5' : 'bg-gray-50 border-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 ${item.color}`}>
                                                <item.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-black uppercase tracking-wide mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {item.title}
                                                </h4>
                                                <p className={`text-xs font-medium leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Note */}
                            <div className={`mt-8 p-4 rounded-2xl text-center ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                                <p className={`text-[10px] font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    * Warranty does not cover issues caused by external factors (power surge, physical damage) after the service.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WarrantyBottomSheet;
