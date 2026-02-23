"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, RefreshCw, Smartphone } from "lucide-react";

interface PaymentFailurePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onRetry?: () => void;
    errorMsg?: string;
    darkMode?: boolean;
}

const PaymentFailurePopup: React.FC<PaymentFailurePopupProps> = ({
    isOpen,
    onClose,
    onRetry,
    errorMsg,
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl ${darkMode
                            ? "bg-[#111827]/95 border border-white/10"
                            : "bg-white/95 border border-white/40"
                            }`}
                    >
                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />

                        {/* Decorative Background Icon */}
                        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                            <AlertCircle size={160} className={darkMode ? "text-white" : "text-gray-900"} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Failure Icon */}
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                                <AlertCircle className="text-white" size={36} strokeWidth={2.5} />
                            </div>

                            {/* Text Content */}
                            <h2 className={`text-2xl font-black mb-3 tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                                Payment Failed
                            </h2>
                            <p className={`text-sm font-medium mb-8 leading-relaxed opacity-70 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {errorMsg || "We couldn't process your payment. Please check your bank details or try another method."}
                            </p>

                            {/* Action Buttons */}
                            <div className="w-full space-y-3">
                                {onRetry && (
                                    <button
                                        onClick={onRetry}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={18} />
                                        Try Again
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 ${darkMode
                                        ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    Close
                                </button>
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

export default PaymentFailurePopup;
