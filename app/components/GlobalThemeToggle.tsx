"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useApp } from "../context/AppContext";

import { usePathname } from "next/navigation";

const GlobalThemeToggle = () => {
    const { darkMode, toggleDarkMode } = useApp();
    const pathname = usePathname();

    // Hide on Home Page as it has its own header toggle
    if (pathname === '/') return null;

    return (
        <button
            onClick={toggleDarkMode}
            className={`fixed top-20 right-4 z-[9999] w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 ${darkMode
                ? "bg-[#1E2536] text-yellow-400 border border-gray-700"
                : "bg-white text-gray-600 border border-gray-200"
                }`}
            aria-label="Toggle Theme"
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

export default GlobalThemeToggle;
