import React from 'react';
import { motion } from 'framer-motion';

interface LocationHeaderProps {
    label?: string;
    address?: string;
    onClick?: () => void;
    darkMode?: boolean;
}

export default function LocationHeader({
    label = 'Home',
    address = 'Select Location',
    onClick,
    darkMode = false,
}: LocationHeaderProps) {
    return (
        <div
            onClick={onClick}
            className="flex-1 flex flex-col items-start justify-center cursor-pointer ml-1.5 min-w-0" // Reduced margin for tighter fit with logo
        >
            <div className="flex items-center gap-0.5">
                <h2 className={`text-[15px] sm:text-lg font-extrabold leading-tight flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {label}
                    <span className={`material-symbols-outlined text-xl ${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                        keyboard_arrow_down
                    </span>
                </h2>
            </div>
            <p className={`text-[11px] sm:text-xs font-bold max-w-[200px] sm:max-w-[300px] truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {address}
            </p>
        </div>
    );
}
