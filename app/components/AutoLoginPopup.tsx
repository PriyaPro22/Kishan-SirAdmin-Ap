'use client';

import { useState, useEffect } from 'react';
import AuthModal from './Auth/AuthModal';
import { useApp } from '../context/AppContext';

export default function AutoLoginPopup() {
    const [showPopup, setShowPopup] = useState(false);
    const { darkMode } = useApp();

    useEffect(() => {
        // Check if already shown in this session
        const alreadyShown = sessionStorage.getItem('loginPopupShown');
        const authToken = localStorage.getItem('authToken');

        // Show popup after 10 seconds if not logged in and not already shown
        if (!authToken && !alreadyShown) {
            const timer = setTimeout(() => {
                setShowPopup(true);
                sessionStorage.setItem('loginPopupShown', 'true');
            }, 10000); // 10 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setShowPopup(false);
    };

    return showPopup ? (
        <AuthModal
            darkMode={darkMode}
        />
    ) : null;
}
