"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Zap, MessageSquare, ShieldCheck, ChevronLeft, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function TestNotificationPage() {
    const [fcmToken, setFcmToken] = useState<string>("");
    const [title, setTitle] = useState("Technician Assigned 🛠️");
    const [message, setMessage] = useState("Bhai, aapka technician (Kartik) nikal chuka hai. 10 min me pahunchega!");
    const [type, setType] = useState<'TECH_ASSIGNED' | 'TECH_QUESTION' | 'GENERAL'>('TECH_ASSIGNED');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        // Get token from localStorage where FCMHandler saves it
        const checkToken = () => {
            const token = localStorage.getItem('fcm_token');
            if (token) setFcmToken(token);
        };

        checkToken();
        const interval = setInterval(checkToken, 2000); // Check every 2 seconds

        // Listen for storage changes just in case
        window.addEventListener('storage', checkToken);
        return () => {
            window.removeEventListener('storage', checkToken);
            clearInterval(interval);
        };
    }, []);

    const sendTestNotification = async () => {
        if (!fcmToken) {
            setStatus("Error: FCM Token nahi mila. Pehle Home page pe jaake notification allow karo!");
            return;
        }

        setSending(true);
        setStatus(null);

        try {
            // Direct FCM send logic using your VAPID/Server credentials 
            // Note: Real project should use a backend (Node.js/Firebase Admin)
            // This is a direct simulation for testing on the same device

            const payload = {
                notification: {
                    title,
                    body: message,
                },
                data: {
                    type,
                    click_action: "FLUTTER_NOTIFICATION_CLICK"
                }
            };

            // Since we are in the same browser, we can dispatch a broadcast event 
            // or trigger the internal messaging handler if possible.
            // But for a REAL test of the FCM system, we print it for use in Postman/Console.

            console.log("📤 Sending Test Payload:", payload);

            // Simulate foreground trigger for the UI we built
            const event = new CustomEvent('fcm_test_trigger', { detail: payload });
            window.dispatchEvent(event);

            setStatus("✅ Test Triggered! Check your screen.");
        } catch (err: any) {
            setStatus("❌ Error: " + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-white p-6 font-sans">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-black italic tracking-tighter">FCM TEST PANEL</h1>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Bell size={100} />
                    </div>

                    <div className="relative z-10">
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block">Your FCM Token</label>
                                <button
                                    onClick={() => {
                                        window.dispatchEvent(new Event('fcm_force_reset'));
                                        setStatus("🔄 Force Resetting FCM state...");
                                    }}
                                    className="text-[9px] font-bold text-red-500 hover:text-red-400 underline underline-offset-2"
                                >
                                    RESET
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if (fcmToken) {
                                        navigator.clipboard.writeText(fcmToken);
                                        setStatus("✅ Token copied to clipboard!");
                                    }
                                }}
                                className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 break-all text-[10px] font-mono text-yellow-400 text-left hover:bg-black/60 transition-all group relative"
                            >
                                {fcmToken || "Token not found. Please visit Home page first."}
                                {fcmToken && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] bg-yellow-400 text-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        COPY
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block mb-3">Notification Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'TECH_ASSIGNED', label: 'Assigned', icon: <ShieldCheck size={14} /> },
                                        { id: 'TECH_QUESTION', label: 'Question', icon: <MessageSquare size={14} /> },
                                        { id: 'GENERAL', label: 'Normal', icon: <Bell size={14} /> }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id as any)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${type === t.id ? "bg-yellow-400 border-yellow-400 text-black font-bold" : "bg-white/5 border-white/10 text-gray-400"}`}
                                        >
                                            {t.icon}
                                            <span className="text-[10px] uppercase">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block mb-3">Custom Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 block mb-3">Message Body</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-yellow-400 outline-none transition-all h-24 resize-none"
                                />
                            </div>

                            {status && (
                                <div className={`p-4 rounded-2xl text-xs font-bold ${status.startsWith('✅') ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
                                    {status}
                                </div>
                            )}

                            <button
                                onClick={sendTestNotification}
                                disabled={sending}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(255,196,46,0.3)] mt-6"
                            >
                                {sending ? "SENDING..." : "FIRE TEST NOTIFICATION"}
                                <Zap size={20} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-yellow-500">
                        <Zap size={16} />
                        Debug Status:
                    </h3>
                    <div className="text-[10px] space-y-2 font-mono">
                        <p>VAPID Key: {process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? "✅ Loaded" : "❌ MISSING"}</p>
                        <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ " + process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID : "❌ MISSING"}</p>
                        <p>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Loaded" : "❌ MISSING"}</p>

                        {(fcmToken === "" || !fcmToken) && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-red-400 font-bold mb-2 uppercase tracking-tighter">⚠️ Possible Fix for 401 Error:</p>
                                <ul className="list-disc ml-4 space-y-1 text-red-300">
                                    <li>Enable <b>"Firebase Installations API"</b> in Google Cloud Console.</li>
                                    <li>Check context for "Request is missing required authentication credential".</li>
                                    <li>Clear "Site Data" (Application Tab &gt; Clear Storage) if nothing works.</li>
                                </ul>
                            </div>
                        )}
                        <p className="text-gray-500 mt-4 italic">Tip: Agar "MISSING" dikh raha hai to server restart karo terminal me Ctrl+C fir npx next dev.</p>
                    </div>
                </div>





                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-green-400">Background Testing (V1 API)</h2>
                    <p className="text-gray-400 mb-4 text-sm">
                        ✅ Server is configured with <b>Service Account</b>.
                        <br />
                        Click below and minimize the app immediately.
                    </p>

                    <button
                        onClick={async () => {
                            const token = localStorage.getItem('fcm_token');

                            if (!token) {
                                toast.error("Token nahi mila!");
                                return;
                            }

                            toast.loading("Sending via V1 API... Minimize App NOW!", { duration: 5000 });

                            setTimeout(async () => {
                                try {
                                    const res = await fetch('/api/send-fcm', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            token,
                                            // server-side service-account.json will be used
                                            title: "Background Success! 🌙",
                                            body: "Notification via Firebase V1 API (Server File)!"
                                        })
                                    });
                                    const data = await res.json();
                                    if (data.success || data.message_id) {
                                        toast.success("Sent! Check notification tray.");
                                    } else {
                                        toast.error("Failed: " + (data.error || "Unknown error"));
                                        console.error(data);
                                    }
                                } catch (e: any) {
                                    toast.error("Network Error: " + e.message);
                                }
                            }, 5000);
                        }}
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                    >
                        <span>🚀 Test Background (V1 Configured)</span>
                    </button>

                    <p className="text-xs text-gray-500 mt-3 text-center border-t border-white/5 pt-3">
                        Tip: App minimize karne ke baad 5 second wait karna.
                        <br />
                        Server: {typeof window !== 'undefined' ? window.location.hostname : 'Loading...'}
                    </p>
                </div>

                <div className="mt-6 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-400">
                        <PhoneCall size={16} />
                        Testing Instructions:
                    </h3>
                    <ul className="text-xs text-gray-400 space-y-3 leading-relaxed">
                        <li>1. **Home Page** par jaakar pehle permission **Allow** karein.</li>
                        <li>2. Wahan console me token aate ही is page ko refresh karein.</li>
                        <li>3. **"Assigned"** ya **"Question"** select karke test karein. Hamara custom **Full Screen UI** open ho jayega.</li>
                        <li>4. Mobile Webview me head-up notification check karne ke liye is page se test bhej sakte hain.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
