"use client";

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import SessionLockSheet from './SessionLockSheet';
import axios from 'axios';

export default function SessionHandler() {
    const router = useRouter();
    const [showConflict, setShowConflict] = useState(false);
    const socketRef = useRef<any>(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');

        if (!userId || !authToken) return;

        const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.bijliwalaaya.in";
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log("🛡️ Session Socket Connected");
            socketRef.current.emit('join_user_room', { userId }); // Correctly join user room
        });

        // 🚨 Conflict Detected (Someone else trying to login)
        socketRef.current.on('session_conflict', (data: any) => {
            console.warn("⚠️ [Session] Conflict detected:", data);
            setShowConflict(true);
            toast.error("Security Alert: New login attempt detected!", { icon: '🛡️' });
        });

        // 💀 Forced Kick (Someone else successfully logged in)
        socketRef.current.on('session_kick', (data: any) => {
            console.error("❌ [Session] Kicked by new device:", data);
            toast.error("Logged out: You have been logged in on another device.", { duration: 5000 });

            // Cleanup and Redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');

            setTimeout(() => {
                router.push('/login');
                window.location.reload();
            }, 2000);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleStay = async () => {
        const userId = localStorage.getItem('userId');
        if (socketRef.current && userId) {
            // Option 1: Via Socket
            socketRef.current.emit('session_stay', { userId });

            // Option 2: Via HTTP Fallback
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in/api/auth';
                const authToken = localStorage.getItem('authToken');
                await axios.patch(`${baseUrl}/protect-session/${userId}`,
                    { protected: true },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
            } catch (e) {
                console.error("Failed to protect session via HTTP", e);
            }

            setShowConflict(false);
            toast.success("Protected: Your session is now locked.", { icon: '🛡️' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        router.push('/login');
        window.location.reload();
    };

    return (
        <SessionLockSheet
            isOpen={showConflict}
            onClose={() => setShowConflict(false)}
            onStay={handleStay}
            onLogout={handleLogout}
        />
    );
}
