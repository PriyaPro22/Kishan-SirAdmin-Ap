"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Check } from 'lucide-react';

interface LocationEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: string;
    onConfirm: (location: string) => void;
    onRefreshGPS: () => void;
    darkMode: boolean;
}

export default function LocationEditModal({
    isOpen,
    onClose,
    currentLocation,
    onConfirm,
    onRefreshGPS,
    darkMode
}: LocationEditModalProps) {
    const [editedLocation, setEditedLocation] = useState(currentLocation);

    // Update edited location when current location changes
    useEffect(() => {
        if (isOpen) {
            setEditedLocation(currentLocation);
        }
    }, [isOpen, currentLocation]);

    const handleConfirm = () => {
        if (editedLocation.trim()) {
            onConfirm(editedLocation.trim());
        }
    };

    const handleUseGPS = () => {
        onRefreshGPS();
        // Modal will close automatically after GPS refresh
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleConfirm();
        }
    };

    if (!isOpen) return null;

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 150) {
                                onClose();
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 z-[101]"
                    >
                        <div className={`relative w-full max-w-lg mx-auto rounded-t-3xl shadow-2xl ${darkMode ? 'bg-[#1a1f2e]' : 'bg-white'
                            }`}>
                            {/* Drag Handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-white/20' : 'bg-gray-300'
                                    }`} />
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg z-10 ${darkMode
                                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl'
                                    }`}
                            >
                                <X size={20} />
                            </button>

                            {/* Scrollable Content with safe area padding for mobile keyboard */}
                            <div className="max-h-[70vh] overflow-y-auto px-6 pb-8 pt-4">
                                {/* Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin size={24} className={darkMode ? "text-yellow-400" : "text-yellow-600"} />
                                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            Edit Location
                                        </h2>
                                    </div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        Confirm your address or edit it manually
                                    </p>
                                </div>

                                {/* Location Input */}
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Your Location
                                    </label>
                                    <textarea
                                        value={editedLocation}
                                        onChange={(e) => setEditedLocation(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your complete address..."
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-2xl border-2 transition-all outline-none resize-none ${darkMode
                                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-yellow-400/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-yellow-500'
                                            }`}
                                    />
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        Example: 114 Street, Rajeev Nagar, Ayodhya, UP, 224001
                                    </p>
                                </div>

                                {/* GPS Refresh Button */}
                                <button
                                    onClick={handleUseGPS}
                                    className={`w-full mb-4 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${darkMode
                                        ? 'bg-white/5 border-2 border-white/10 text-white hover:bg-white/10'
                                        : 'bg-blue-50 border-2 border-blue-100 text-blue-700 hover:bg-blue-100'
                                        }`}
                                >
                                    <Navigation size={18} />
                                    <span className="font-medium">Use Current GPS Location</span>
                                </button>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${darkMode
                                            ? 'bg-white/5 text-white hover:bg-white/10'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!editedLocation.trim()}
                                        className={`flex-1 py-3 px-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${darkMode
                                            ? 'bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                            : 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        <Check size={18} />
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
