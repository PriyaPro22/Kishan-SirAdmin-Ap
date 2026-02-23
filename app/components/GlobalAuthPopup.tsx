"use client";
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface GlobalAuthPopupProps {
    darkMode: boolean;
}

export default function GlobalAuthPopup({ darkMode }: GlobalAuthPopupProps) {
    const { openModal, currentModal } = useApp();
    const intervalTime = 10000; // 10 seconds reminder

    useEffect(() => {
        const checkAndShow = () => {
            const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!authToken && !currentModal) {
                console.log("⏰ [AuthReminder] Triggering login popup...");
                openModal('auth');
            }
        };

        const timer = setInterval(checkAndShow, intervalTime);
        return () => clearInterval(timer);
    }, [currentModal, openModal]);

    return null; // AuthModal is now managed globally in layout.tsx via openModal
}
