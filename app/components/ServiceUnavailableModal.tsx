"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, Bell, Star } from "lucide-react";

interface ServiceUnavailableModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName?: string;
    darkMode?: boolean;
}

const ServiceUnavailableModal: React.FC<ServiceUnavailableModalProps> = ({
    isOpen,
    onClose,
    serviceName,
    darkMode = false,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl ${darkMode
                                ? "bg-[#111827]/90 border border-white/10"
                                : "bg-white/95 border border-white/40"
                            }`}
                    >
                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                        {/* Decorative Icon Background */}
                        <div className="absolute -top-10 -right-10 opacity-10">
                            <Wrench size={160} className={darkMode ? "text-white" : "text-gray-900"} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Main Icon */}
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                                <Wrench className="text-white" size={36} strokeWidth={2.5} />
                            </div>

                            {/* Text Content */}
                            <h2 className={`text-2xl font-black mb-2 tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                                Coming Soon!
                            </h2>
                            <p className={`text-sm font-medium mb-8 leading-relaxed opacity-70 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                The <span className="font-bold text-orange-500 uppercase">{serviceName || "Requested Task"}</span> service is under maintenance or launching soon in your area.
                            </p>

                            {/* Action Buttons */}
                            <div className="w-full space-y-3">
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                                >
                                    <Bell size={18} />
                                    Notify Me
                                </button>
                                <button
                                    onClick={onClose}
                                    className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 ${darkMode
                                            ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    Go Back
                                </button>
                            </div>

                            {/* Badge */}
                            <div className="mt-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                                <Star size={12} className="text-yellow-500 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-yellow-500">
                                    Priority Access
                                </span>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${darkMode ? "hover:bg-white/10 text-white/40" : "hover:bg-black/5 text-black/20"
                                }`}
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ServiceUnavailableModal;
