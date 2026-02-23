"use client";

import { useEffect, useRef } from 'react';
import { updateLocation } from '../lib/auth';

export default function LiveLocationSync() {
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');

        if (userId && authToken && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log(`📡 [LiveLocation] One-time Sync: ${latitude}, ${longitude}`);
                    try {
                        await updateLocation(userId, authToken, latitude, longitude);
                    } catch (e) {
                        console.error("Location sync failed", e);
                    }
                },
                (error) => {
                    console.warn("Location permission denied", error.message);
                },
                { enableHighAccuracy: true }
            );
        }
    }, []);

    return null; // Invisible component
}
