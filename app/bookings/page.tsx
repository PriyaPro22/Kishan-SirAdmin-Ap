"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Search,
    Clock,
    CheckCircle2,
    Loader2,
    Star,
    ArrowRight,
    Calendar,
    Phone,
    MessageSquare,
    Navigation,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

type TabType = 'Upcoming' | 'History';

interface Booking {
    id: string;
    orderId: string;
    refId: string | null;
    serviceName: string;
    price: number;
    date: string;
    time: string;
    status: string;
    rawStatus: string;
    image: string;
    isOngoing: boolean;
    technician?: {
        name: string;
        image: string;
        rating: number;
        bikeNo: string;
        phone?: string;
    };
    paymentStatus?: string;
}

export default function BookingHistoryPage() {
    const router = useRouter();
    const { darkMode, setActiveNavIndex } = useApp();
    const [activeTab, setActiveTab] = useState<TabType>('Upcoming');
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        // Highlight Bookings in BottomNav (Index 1)
        setActiveNavIndex(1);
    }, [setActiveNavIndex]);

    useEffect(() => {
        const fetchBookings = async () => {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');

            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';
                const res = await axios.get(`${baseUrl}/api/service/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
                    }
                });

                const historyData = res.data?.data || res.data || {};
                const servicesMap = historyData.history?.Services || historyData.history || historyData.Services || historyData;

                if (!servicesMap || typeof servicesMap !== 'object') {
                    setBookings([]);
                    setLoading(false);
                    return;
                }

                const rawEntries = Object.entries(servicesMap).filter(([key]) => key !== 'Services');

                const mapped: Booking[] = rawEntries.map(([key, val]: [string, any]) => {
                    const meta = val.metaModels || val.bookingDetails || {};
                    const apiStatus = (meta.jobStatus || val.bookingStatus || 'pending').toLowerCase();
                    const statusLower = apiStatus.toLowerCase();

                    const isOngoing = statusLower.includes('finding') ||
                        statusLower.includes('assigned') ||
                        statusLower.includes('progress') ||
                        statusLower.includes('pending') ||
                        statusLower === 'accepted';

                    const techData = val.partnersDetails || {};
                    let technician = undefined;

                    if (techData && techData._id && (statusLower.includes('assigned') || statusLower.includes('progress') || statusLower === 'accepted')) {
                        technician = {
                            name: techData.name || "Technician",
                            image: techData.photo || techData.profileImage || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1935&auto=format&fit=crop",
                            rating: techData.rating || 4.8,
                            bikeNo: techData.bikeNo || techData.vehicleNo || "N/A",
                            phone: techData.phoneNumber || techData.mobile
                        };
                    }

                    const serviceDetails = val.serviceDetails || {};
                    const firstItem = Object.values(serviceDetails)[0] as any || {};

                    return {
                        id: key,
                        orderId: meta.orderId || key.substring(key.length - 8).toUpperCase(),
                        refId: meta.refId || null,
                        serviceName: firstItem.serviceName || meta.serviceName || 'Home Service',
                        price: Number(meta.totalAmount || meta.grandTotal || 0),
                        date: meta.scheduleDate || meta.bookDate || 'N/A',
                        time: meta.scheduleTime || meta.bookTime || '',
                        status: isOngoing ? (statusLower.includes('assigned') ? 'Assigned' : 'Finding Technician') : (statusLower.includes('completed') ? 'Completed' : 'Cancelled'),
                        rawStatus: apiStatus,
                        image: firstItem.imageUrl || firstItem.image || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
                        isOngoing: isOngoing,
                        technician: technician,
                        paymentStatus: val.paymentBeforeService?.toLowerCase() === 'paid' ? 'PAID' : 'PENDING'
                    };
                });

                // Sort by ID/Date descending
                mapped.sort((a, b) => b.id.localeCompare(a.id));

                setBookings(mapped);
            } catch (error) {
                console.error('❌ [FetchBookings] Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const ongoingBookings = bookings.filter(b => b.isOngoing);
    const historyBookings = bookings.filter(b => !b.isOngoing);

    const activeService = ongoingBookings[0];
    const otherOngoing = ongoingBookings.slice(1);

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-500 overflow-x-hidden ${darkMode ? 'bg-[#0B1222] text-white' : 'bg-[#F4F7FE] text-gray-900'}`}>

            {/* --- HEADER --- */}
            <div className={`sticky top-0 z-50 px-6 pt-8 pb-6 backdrop-blur-xl ${darkMode ? 'bg-[#0B1222]/80' : 'bg-[#F4F7FE]/80'}`}>
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.back()} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm hover:shadow-md'}`}>
                        <ChevronLeft size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">My Bookings</h1>
                    <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${darkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                        <Search size={22} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                {/* --- TABS --- */}
                <div className={`p-1.5 rounded-[20px] flex gap-1 ${darkMode ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm border border-gray-100'}`}>
                    {(['Upcoming', 'History'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3.5 rounded-[15px] text-sm font-bold transition-all duration-500 ${activeTab === tab
                                ? 'bg-[#FFC42E] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-6 space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30">
                        <Loader2 className="w-10 h-10 text-[#FFC42E] animate-spin mb-4" />
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase">Loading Services</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'Upcoming' ? (
                            <motion.div
                                key="upcoming"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                {/* --- ACTIVE SERVICE SECTION --- */}
                                {activeService ? (
                                    <section>
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <h2 className="text-lg font-bold">Active Service</h2>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-full">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500">{activeService.status}</span>
                                            </div>
                                        </div>

                                        <div className={`p-6 rounded-[32px] border relative overflow-hidden group ${darkMode ? 'bg-[#1D2639] border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-blue-500/5'}`}>
                                            {/* Glow effect */}
                                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFC42E]/10 blur-[80px] rounded-full pointer-events-none" />

                                            <div className="flex gap-4 mb-6 relative z-10">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-black/5 shadow-inner">
                                                    <img src={activeService.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">ID: #{activeService.orderId}</p>
                                                    <h3 className="text-lg font-black leading-snug mb-2 line-clamp-2">{activeService.serviceName}</h3>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                                        <Clock size={14} className="text-[#FFC42E]" />
                                                        <span>{activeService.date}, {activeService.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technician Card */}
                                            {activeService.technician ? (
                                                <div className={`p-4 rounded-2xl flex items-center gap-4 mb-6 relative z-10 ${darkMode ? 'bg-white/5 backdrop-blur-md' : 'bg-gray-50 border border-gray-100 text-gray-900'}`}>
                                                    <div className="relative">
                                                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#FFC42E]/30">
                                                            <img src={activeService.technician.image || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1935&auto=format&fit=crop"} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#1D2639] flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black mb-0.5">{activeService.technician.name}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{activeService.technician.bikeNo}</p>
                                                            <div className="flex items-center gap-1 text-[10px] font-black text-[#FFC42E]">
                                                                <Star size={10} className="fill-[#FFC42E]" />
                                                                {activeService.technician.rating}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a href={`tel:${activeService.technician.phone || "9999999999"}`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${darkMode ? 'bg-white/10 hover:bg-[#FFC42E]/20 text-white' : 'bg-white shadow-sm text-gray-700 border border-gray-100'}`}>
                                                            <Phone size={18} />
                                                        </a>
                                                        <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${darkMode ? 'bg-[#FFC42E] text-black shadow-lg shadow-yellow-500/20' : 'bg-[#FFC42E] text-black shadow-md'}`}>
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`p-6 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed relative z-10 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                                    <div className="flex flex-col items-center text-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                                            <Loader2 size={24} className="text-[#FFC42E] animate-spin" />
                                                        </div>
                                                        <p className="text-[11px] font-bold text-gray-400 italic">Assigning best technician for you...</p>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => router.push(`/bookings/${activeService.id}`)}
                                                className="w-full py-4 bg-[#FFC42E] text-black font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/20 transition-all hover:brightness-110 active:scale-[0.98] relative z-10"
                                            >
                                                <Navigation size={18} className="fill-black" />
                                                TRACK TECHNICIAN
                                            </button>
                                        </div>
                                    </section>
                                ) : (
                                    <div className="py-24 text-center opacity-30 px-12">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <Calendar size={48} />
                                        </div>
                                        <h3 className="font-black text-xl mb-2 italic">Nothing Scheduled</h3>
                                        <p className="text-xs font-bold leading-relaxed">{`Your upcoming journey is a blank canvas. Let's fill it with premium services.`}</p>
                                        <button
                                            onClick={() => router.push('/')}
                                            className="mt-8 px-8 py-3 bg-[#FFC42E] text-black font-black rounded-2xl shadow-lg active:scale-95"
                                        >
                                            BROWSE SERVICES
                                        </button>
                                    </div>
                                )}

                                {/* --- OTHER ONGOING --- */}
                                {otherOngoing.length > 0 && (
                                    <section>
                                        <h2 className="text-lg font-bold mb-4 px-1">Upcoming Services</h2>
                                        <div className="space-y-4">
                                            {otherOngoing.map(booking => (
                                                <BookingItem key={booking.id} booking={booking} darkMode={darkMode} router={router} />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="space-y-6 pb-20"
                            >
                                <section>
                                    <div className="flex items-center justify-between mb-6 px-1">
                                        <h2 className="text-lg font-bold">Previous Services</h2>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>
                                            {historyBookings.length} bookings
                                        </span>
                                    </div>

                                    {historyBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {historyBookings.map(booking => (
                                                <BookingItem key={booking.id} booking={booking} darkMode={darkMode} router={router} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-32 text-center opacity-30">
                                            <p className="font-black text-xl italic mb-1">The void is real.</p>
                                            <p className="text-xs font-bold uppercase tracking-widest">No history found</p>
                                        </div>
                                    )}
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* --- BOTTOM NAV --- */}
            <BottomNav />
        </div>
    );
}

const BookingItem = ({ booking, darkMode, router }: { booking: Booking, darkMode: boolean, router: any }) => (
    <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push(`/bookings/${booking.id}`)}
        className={`flex items-center gap-4 p-4 rounded-[28px] border transition-all cursor-pointer group ${darkMode ? 'bg-[#1D2639] border-white/5 hover:bg-white/[0.07]' : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-500/5'}`}
    >
        <div className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-inner ${darkMode ? 'bg-gray-800' : 'bg-gray-50 border border-gray-100'}`}>
            <img src={booking.image} alt="" className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black truncate pr-4">{booking.serviceName}</h3>
                <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shrink-0 ${booking.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                        booking.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                            'bg-blue-500/10 text-blue-500'
                    }`}>
                    {booking.status}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-[11px] font-black text-[#FFC42E]">₹{booking.price}</p>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <p className="text-[10px] font-bold text-gray-500">{booking.date}</p>
            </div>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
            <ArrowRight size={16} />
        </div>
    </motion.div>
);
