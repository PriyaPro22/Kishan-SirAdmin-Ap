"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Tablet, MonitorOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DesktopBlocker({ children }: { children: React.ReactNode }) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkScreen = () => {
            // Threshold for desktop is usually > 1024px
            // But user said "only for mobile and tab", so we block if width > 1024 (laptops/desktops)
            setIsDesktop(window.innerWidth > 1024);
        };

        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <AnimatePresence>
                {isDesktop && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#0b0f1a] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-500/10 blur-[100px] rounded-full delay-700" />

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10 max-w-md"
                        >
                            <div className="mb-8 relative inline-block">
                                <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                                    <MonitorOff size={48} className="text-red-500" />
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-[#0b0f1a]"
                                />
                            </div>

                            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
                                Mobile Experience Only
                            </h1>

                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                This application is optimized for <span className="text-yellow-400 font-bold">Mobile</span> and <span className="text-blue-400 font-bold">Tablet</span> devices only. Please switch to your phone for the best experience.
                            </p>

                            <div className="flex items-center justify-center gap-6 mb-12">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <Smartphone className="text-gray-300" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Mobile</span>
                                </div>
                                <div className="w-8 h-px bg-white/10" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <Tablet className="text-gray-300" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tablet</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                <p className="text-sm text-gray-500 font-medium">
                                    Scan QR code or open <br />
                                    <span className="text-[#FFC42E] font-bold">kishan.bijliwalaaya.in</span> <br />
                                    on your mobile browser.
                                </p>
                            </div>
                        </motion.div>

                        {/* Custom Cursor Decoration */}
                        <motion.div
                            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full blur-[1px]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={isDesktop ? "hidden" : "block"}>
                {children}
            </div>
        </>
    );
}
