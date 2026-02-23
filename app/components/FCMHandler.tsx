"use client";

import { useEffect, useState } from 'react';
import { messaging } from '../lib/firebase';
import { onMessage, getToken } from 'firebase/messaging';
import axios from 'axios';
import FullScreenNotification from './FullScreenNotification';

export default function FCMHandler() {
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'TECH_QUESTION' | 'TECH_ASSIGNED' | 'GENERAL';
        data?: any;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'GENERAL'
    });

    // Sync Token to Backend
    const syncTokenToDatabase = async (token: string) => {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';
        let payload: any = null;

        try {
            // Comprehensive check for valid strings
            if (!userId || userId === 'null' || userId === 'undefined' || !token) {
                console.warn("⚠️ [FCM] Skipping sync: missing userId or token", { userId, hasToken: !!token });
                return;
            }

            if (!authToken || authToken === 'null' || authToken === 'undefined') {
                console.warn("⚠️ [FCM] Skipping sync: missing authToken");
                return;
            }

            // 1. Get/Generate persistent Device ID
            let deviceId = localStorage.getItem('fcm_device_id');
            if (!deviceId) {
                deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                localStorage.setItem('fcm_device_id', deviceId);
            }

            console.log(`📡 [FCM] Syncing token for device: ${deviceId}`);

            const getDeviceOS = () => {
                const ua = navigator.userAgent;
                const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);

                if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ipad';
                if (isTablet) return 'tablet';
                if (/Android/i.test(ua)) return 'android';
                if (/iPhone|iPod/i.test(ua)) return 'ios';
                if (/Windows/i.test(ua)) return 'windows';
                if (/Mac/i.test(ua)) return 'macos';
                if (/Linux/i.test(ua)) return 'linux';
                return 'web';
            };

            const os = getDeviceOS();
            const deviceType = (os === 'android' || os === 'ios' || os === 'ipad' || os === 'tablet') ? (os === 'ipad' ? 'ios' : (os === 'tablet' ? 'android' : os)) : 'web';

            // Generate a more descriptive device name like "Chrome on Windows"
            const getDeviceName = () => {
                const ua = navigator.userAgent;
                let browser = "Unknown Browser";

                // Browser Detection
                if (/Brave/i.test(ua)) browser = "Brave";
                else if (/Edg/i.test(ua)) browser = "Edge";
                else if (/Chrome/i.test(ua)) browser = "Chrome";
                else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
                else if (/Firefox/i.test(ua)) browser = "Firefox";
                else if (/MSIE|Trident/i.test(ua)) browser = "Internet Explorer";
                else if (/Opera|OPR/i.test(ua)) browser = "Opera";

                // OS Pretty Names
                let osName = "Unknown OS";
                if (os === 'android') osName = "Android";
                else if (os === 'ios') osName = "iOS";
                else if (os === 'ipad') osName = "iPad";
                else if (os === 'tablet') osName = "Android Tablet";
                else if (os === 'windows') osName = "Windows";
                else if (os === 'macos') osName = "MacOS";
                else if (os === 'linux') osName = "Linux";

                return `${browser} on ${osName}`;
            };

            const deviceName = getDeviceName();
            const platform = deviceType;

            payload = {
                token: token,
                deviceId: deviceId,
                deviceName: deviceName,
                platform: platform
            };

            const url = `${baseUrl}/api/auth/add-fcm/${userId}`;

            console.group("🚀 [FCM] API SYNC ATTEMPT");
            console.log("🔗 URL:", url);
            console.log("📦 Payload (Object):", payload);
            console.log("📝 Payload (JSON):", JSON.stringify(payload));
            console.log("🔑 Auth Token:", authToken.substring(0, 15) + "...");
            console.log("🔐 API Token:", apiToken);
            console.groupEnd();

            const response = await axios.patch(url, payload, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-api-token': apiToken
                }
            });

            console.log("✅ [FCM] Sync Success Response:", response.data);

            // Update local userData with latest fcmTokens
            if (response.data.success && response.data.fcmTokens) {
                const storedUserData = localStorage.getItem('userData');
                if (storedUserData) {
                    const userData = JSON.parse(storedUserData);
                    userData.fcmToken = response.data.fcmTokens; // Update with latest array
                    localStorage.setItem('userData', JSON.stringify(userData));
                    console.log("💾 [FCM] Local userData updated with latest fcmTokens");
                }
            }

            console.log(`✅ [FCM] Token synced for device: ${deviceId}`);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error("❌ [FCM] Token sync failed:", errorMsg);
            if (error.response?.status === 500) {
                console.warn("🔥 [FCM] 500 Server Error - Possibly backend schema/controller crash.");
                console.log("🛠️ Diagnostic Info:", {
                    url: `${baseUrl}/api/auth/add-fcm/${userId}`,
                    payloadSize: payload ? JSON.stringify(payload).length : 0,
                    hasAuth: !!authToken
                });
            }
        }
    };

    // Check for Notification Click (Deep Link)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('fcm_notification') === 'true') {
                console.log("🔔 App opened via Notification Click!");

                // Clear the param from URL without reload
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);

                // Delay slightly to ensure UI is ready
                setTimeout(() => {
                    setNotification({
                        isOpen: true,
                        title: "New Incoming Request",
                        message: "You tapped the notification. Viewing details...",
                        type: 'TECH_ASSIGNED' // Shows Green 'Call' style icon
                    });
                    // Play a sound if you want? 
                }, 500);
            }
        }
    }, []);

    useEffect(() => {
        const setupFCM = async () => {
            try {
                const msg = await messaging();
                if (!msg) return;

                const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
                console.log("🛠️ [FCM] API Key Check:", apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}` : "NOT FOUND");

                // 🛡️ [ZEPTO-STYLE] Request permission only on user gesture
                console.log("🔔 (Gesture Guard) Notification permission logic loaded...");
                if (typeof Notification !== 'undefined') {
                    // const permission = await Notification.requestPermission();
                    const permission = Notification.permission;
                    console.log("📊 [FCM] Current Permission status:", permission);

                    if (permission === 'granted') {
                        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

                        if (!vapidKey) {
                            console.error("❌ [FCM] VAPID Key is MISSING in .env files!");
                            return;
                        }

                        // Validate VAPID key format
                        if (vapidKey.length < 87 || vapidKey.length > 88) {
                            console.error("❌ [FCM] VAPID Key length invalid:", vapidKey.length, "(should be 87-88 characters)");
                            alert(`🔥 VAPID Key Error: Key length is ${vapidKey.length} but should be 87-88 characters. Please copy the EXACT key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates`);
                            return;
                        }

                        console.log("🔑 [FCM] Requesting token with VAPID Key:", `${vapidKey.substring(0, 5)}...${vapidKey.substring(vapidKey.length - 5)}`);
                        console.log("📏 [FCM] VAPID Key length:", vapidKey.length);

                        try {
                            // Explicit service worker registration
                            const swUrl = '/firebase-messaging-sw.js';
                            await navigator.serviceWorker.register(swUrl);
                            const registration = await navigator.serviceWorker.ready;

                            if (!registration.pushManager) {
                                console.warn("⚠️ [FCM] PushManager not available on this browser/registration.");
                                return;
                            }

                            console.log("🛠️ [FCM] Service Worker READY:", registration.scope);

                            const token = await getToken(msg, {
                                vapidKey: vapidKey,
                                serviceWorkerRegistration: registration
                            });

                            if (token) {
                                console.log('✅ [FCM] Token generated');
                                localStorage.setItem('fcm_token', token);

                                // Sync to Database
                                await syncTokenToDatabase(token);

                                // Sync to mobile WebView if needed
                                if ((window as any).ReactNativeWebView) {
                                    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'FCM_TOKEN',
                                        token: token
                                    }));
                                }
                            } else {
                                console.warn("⚠️ [FCM] Token is empty.");
                            }
                        } catch (tokenError: any) {
                            console.error("❌ [FCM] Token retrieval failed:", tokenError);

                            if (tokenError.message?.includes("API key not valid")) {
                                alert("🔥 Firebase Error: API Key invalid hai. Please check your .env file and Firebase Console settings.");
                            } else if (tokenError.message?.includes("messaging/token-subscribe-failed") || tokenError.message?.includes("401")) {
                                alert("🚨 FCM Error (401): Please enable 'Firebase Installations API' in your Google Cloud Console for this project.");
                                console.error("💡 TIP: Visit https://console.cloud.google.com/apis/library/firebaseinstallations.googleapis.com and click ENABLE.");
                            } else {
                                alert("FCM Error: " + tokenError.message);
                            }
                        }
                    } else {
                        console.warn("❌ [FCM] Permission not granted.");
                        // alert("Permission Not Granted. Please allow notifications.");
                    }
                }

                // Handle foreground messages
                onMessage(msg, (payload) => {
                    console.log('📩 [FCM] Message received in foreground:', payload);

                    const { title, body } = payload.notification || {};
                    const type = payload.data?.type as any || 'GENERAL';

                    if (type === 'TECH_QUESTION' || type === 'TECH_ASSIGNED') {
                        setNotification({
                            isOpen: true,
                            title: title || 'New Notification',
                            message: body || '',
                            type,
                            data: payload.data
                        });
                    } else if (typeof Notification !== 'undefined') {
                        new Notification(title || 'BijliWalaAya', {
                            body,
                            icon: '/favicon.ico'
                        });
                    }
                });

                window.addEventListener('fcm_retry_setup', setupFCM);
                return () => window.removeEventListener('fcm_retry_setup', setupFCM);

            } catch (error: any) {
                console.error('❌ [FCM] Setup Error:', error);
                localStorage.setItem('fcm_last_error', error.message || "Unknown error");
            }
        };

        if (typeof window !== 'undefined') {
            setupFCM();

            // Local Testing Trigger (Bhai ke liye panel testing)
            const handleTest = (e: any) => {
                const payload = e.detail;
                const { title, body } = payload.notification || {};
                const type = payload.data?.type || 'GENERAL';

                if (type === 'TECH_QUESTION' || type === 'TECH_ASSIGNED') {
                    setNotification({
                        isOpen: true,
                        title: title || 'Test Alert',
                        message: body || '',
                        type,
                        data: payload.data
                    });
                } else if (typeof Notification !== 'undefined') {
                    new Notification(title || 'Test Notification', { body });
                }
            };

            const handleForceReset = async () => {
                console.log("🧨 [FCM] Force Reset triggered...");
                localStorage.removeItem('fcm_token');
                localStorage.removeItem('fcm_last_error');

                // Clear Firebase IndexedDB
                try {
                    const dbs = await indexedDB.databases();
                    for (const db of dbs) {
                        if (db.name?.includes("firebase")) {
                            console.log("🧹 [FCM] Deleting DB:", db.name);
                            indexedDB.deleteDatabase(db.name);
                        }
                    }
                } catch (e) {
                    console.error("❌ [FCM] Reset DB error:", e);
                }

                // Unregister Workers
                try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const reg of registrations) {
                        if (reg.active?.scriptURL.includes("firebase-messaging-sw.js")) {
                            console.log("🛰️ [FCM] Unregistering Service Worker");
                            await reg.unregister();
                        }
                    }
                } catch (e) {
                    console.error("❌ [FCM] Reset Worker error:", e);
                }

                alert("✅ FCM State Cleared! Page will reload.");
                window.location.reload();
            };

            window.addEventListener('fcm_test_trigger', handleTest);
            window.addEventListener('fcm_force_reset', handleForceReset);

            // Also sync token when user logs in
            const handleUserLogin = () => {
                const token = localStorage.getItem('fcm_token');
                if (token) syncTokenToDatabase(token);
            };
            window.addEventListener('userLoggedIn', handleUserLogin);

            return () => {
                window.removeEventListener('fcm_test_trigger', handleTest);
                window.removeEventListener('fcm_force_reset', handleForceReset);
                window.removeEventListener('userLoggedIn', handleUserLogin);
            };
        }
    }, []);

    return (
        <FullScreenNotification
            isOpen={notification.isOpen}
            onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            data={notification.data}
        />
    );
}
