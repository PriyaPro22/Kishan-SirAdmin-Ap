"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning';
    read: boolean;
}

interface NotificationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    darkMode: boolean;
}

export default function NotificationSheet({ isOpen, onClose, notifications, darkMode }: NotificationSheetProps) {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed bottom-0 left-0 right-0 z-[151] max-h-[80vh] rounded-t-[2.5rem] flex flex-col shadow-2xl overflow-hidden ${darkMode ? 'bg-[#0F172A] border-t border-white/10' : 'bg-white border-t border-gray-100'
                            }`}
                    >
                        {/* Handle */}
                        <div className="w-full flex justify-center pt-4 pb-2">
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                                    <Bell className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#111827]'}`}>Notifications</h2>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stay updated with yours services</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 hide-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                        <Bell className={`w-10 h-10 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                                    </div>
                                    <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No New Notifications</h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-[200px]`}>
                                        We'll let you know when something important happens!
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`relative p-4 rounded-2xl border transition-all ${darkMode
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                : 'bg-white border-gray-100 hover:border-yellow-200 hover:shadow-lg hover:shadow-yellow-500/5'
                                            }`}
                                    >
                                        {!notif.read && (
                                            <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-500 rounded-full" />
                                        )}
                                        <div className="flex gap-4">
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notif.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                                    notif.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {notif.type === 'success' ? <CheckCircle size={20} /> :
                                                    notif.type === 'warning' ? <AlertTriangle size={20} /> :
                                                        <Info size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold truncate pr-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className={`text-[10px] whitespace-nowrap ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-6 border-t border-gray-100 dark:border-white/5">
                                <button
                                    className="w-full py-4 rounded-2xl bg-yellow-500 text-[#111827] font-bold text-sm shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        )}
                        <div className="pb-safe" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
