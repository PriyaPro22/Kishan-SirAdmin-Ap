"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X } from 'lucide-react';

export default function IOSInstallPrompt() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Detect if user is on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        // Check if app is NOT already in standalone mode (PWA mode)
        const isStandalone = (window.navigator as any).standalone === true;

        // Check if we already showed the prompt or user dismissed it
        const hasDismissed = localStorage.getItem('ios_prompt_dismissed') === 'true';

        if (isIOS && !isStandalone && !hasDismissed) {
            // Show prompt after a short delay
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismissPrompt = () => {
        setIsVisible(false);
        localStorage.setItem('ios_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-24 left-4 right-4 z-[9999] bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl border border-blue-500/20 p-5 overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={dismissPrompt}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X size={18} />
                </button>

                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                        <PlusSquare className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Install BijliWalaaya</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add to your home screen for quick access!</p>
                    </div>
                </div>

                <div className="mt-5 space-y-3 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">1</span>
                        <span>Tap the <Share size={16} className="inline text-blue-500 mx-1" /> **Share** button below</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">2</span>
                        <span>Scroll down and tap **'Add to Home Screen'**</span>
                    </div>
                </div>

                {/* Arrow Pointer (Centered at the bottom where share button usually is) */}
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1a1f2e] rotate-45 border-r border-b border-blue-500/10"
                />
            </motion.div>
        </AnimatePresence>
    );
}
