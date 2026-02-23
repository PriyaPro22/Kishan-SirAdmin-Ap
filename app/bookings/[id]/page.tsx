'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    HelpCircle,
    AlertCircle,
    Phone,
    MessageSquare,
    Star,
    CheckCircle2,
    MapPin,
    Calendar,
    Clock,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Navigation,
    Bike,
    Headphones,
    X,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp } from '../../context/AppContext';
import { io } from 'socket.io-client';
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    DirectionsService,
    DirectionsRenderer
} from '@react-google-maps/api';
import toast from 'react-hot-toast';

import { GOOGLE_MAPS_LOADER_CONFIG } from '../../lib/googleMapsConfig';

const MAP_OPTIONS = {
    disableDefaultUI: true,
    clickableIcons: false,
    styles: [
        { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#8e9acc" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
        { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] }
    ]
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

const playNotificationSound = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Sound play blocked:', e));
    } catch (e) {
        console.error('Audio play error:', e);
    }
};

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { darkMode } = useApp();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [partnerLoc, setPartnerLoc] = useState<any>(null);
    const [userLoc, setUserLoc] = useState<any>(null);
    const [directions, setDirections] = useState<any>(null);
    const [hasNotifiedProximity, setHasNotifiedProximity] = useState(false);

    const socketRef = useRef<any>(null);

    const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_CONFIG);

    const steps = [
        { title: 'Confirmed', desc: 'Order received', status: 'completed' },
        { title: 'On the way', desc: 'Partner is arriving', status: 'current' },
        { title: 'Started', desc: 'Work in progress', status: 'upcoming' },
        { title: 'Finished', desc: 'Job completed', status: 'upcoming' },
    ];

    useEffect(() => {
        const fetchBooking = async () => {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');

            if (!userId || !bookingId) {
                setError("Authentication or Booking ID missing");
                setLoading(false);
                return;
            }

            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';
                const apiUrl = `${baseUrl}/api/service/${userId}/${bookingId}`;

                const res = await axios.get(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
                    }
                });

                const data = res.data?.data || res.data;

                if (data) {
                    const meta = data.metaModels || data.bookingDetails || {};
                    const details = data.serviceDetails || {};
                    const firstItem = Object.values(details)[0] as any;
                    const address = data.addressDetails || meta.addressDetails || {};

                    let apiStatus = (meta.jobStatus || data.bookingStatus || "pending").toLowerCase();
                    let mappedStatus = "Pending";
                    if (apiStatus.includes('finding')) mappedStatus = "Finding Technician";
                    else if (apiStatus.includes('assigned')) mappedStatus = "Assigned";
                    else if (apiStatus.includes('progress')) mappedStatus = "In Progress";
                    else if (apiStatus.includes('completed') || apiStatus.includes('finished')) mappedStatus = "Completed";
                    else if (apiStatus.includes('cancelled')) mappedStatus = "Cancelled";

                    const normalized = {
                        ...data,
                        id: bookingId,
                        serviceName: firstItem?.serviceName || meta.serviceName || data.serviceName || "Service",
                        status: mappedStatus,
                        orderId: meta.orderId || data.bookingRefId || bookingId,
                        addressDetails: {
                            ...address,
                            fullAddress: address.fullAddress || address.area || "Address not specified"
                        }
                    };

                    setBooking(normalized);

                    // Set initial locations if available
                    if (address.lat && address.lng) {
                        setUserLoc({ lat: parseFloat(String(address.lat)), lng: parseFloat(String(address.lng)) });
                    }

                    // Try to get partner location from live_status first, then fallback to partnersDetails root
                    const pLoc = data.partnersDetails?.live_status?.location || data.partnersDetails;
                    if (pLoc?.lat && pLoc?.lng) {
                        setPartnerLoc({ lat: parseFloat(String(pLoc.lat)), lng: parseFloat(String(pLoc.lng)) });
                    }

                } else {
                    setError("Booking not found.");
                }
            } catch (err: any) {
                console.error("❌ [BookingDetail] Error:", err.message);
                if (!booking) setError("Failed to load booking details.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();

        // Auto-refresh only when in "Finding" state to detect assignment
        let interval: any;
        if (booking?.status === "Finding Technician" || booking?.status === "Pending") {
            interval = setInterval(fetchBooking, 5000); // Check every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [bookingId, booking?.status]);

    // Socket Connection
    useEffect(() => {
        if (!booking || (!booking.partnersDetails?._id && !booking.partnerId)) return;

        const partnerId = booking.partnersDetails?.partnerId || booking.partnerId;
        const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.bijliwalaaya.in";

        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log("Connected to Tracking Socket");
            socketRef.current.emit('joinPartner', partnerId);
        });

        socketRef.current.on('locationUpdated', (data: any) => {
            console.log("Partner Location Update:", data);
            if (data.lat && data.lng) {
                setPartnerLoc({ lat: parseFloat(data.lat), lng: parseFloat(data.lng) });
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [booking]);

    // Proximity Alert
    useEffect(() => {
        if (partnerLoc && userLoc && !hasNotifiedProximity) {
            const distance = getDistance(partnerLoc.lat, partnerLoc.lng, userLoc.lat, userLoc.lng);
            if (distance <= 100) {
                setHasNotifiedProximity(true);
                playNotificationSound();
                toast.success('Technician is arriving soon! (Within 100m)', {
                    duration: 6000,
                    icon: '🚀',
                });
            }
        }
    }, [partnerLoc, userLoc, hasNotifiedProximity]);

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-[#0F172A] text-white' : 'bg-gray-50'}`}>
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Opening tracking console...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className={`min-h-screen p-6 flex flex-col items-center justify-center text-center ${darkMode ? 'bg-[#0F172A] text-white' : 'bg-gray-50'}`}>
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Booking</h2>
                <p className="text-gray-500 mb-6">{error || "Could not find booking details."}</p>
                <button onClick={() => router.back()} className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-lg">
                    Go Back
                </button>
            </div>
        );
    }

    const isAssigned = booking.status === 'Assigned' || booking.status === 'In Progress';
    const isCompleted = booking.status === 'Completed';
    const isCancelled = booking.status === 'Cancelled';
    const isFinding = booking.status === 'Finding Technician' || booking.status === 'Pending';

    const technician = booking.technician || {
        name: booking.partnersDetails?.personal_details?.name || booking.partnersDetails?.name || 'Expert Partner',
        image: booking.partnersDetails?.personal_details?.profile_url || booking.partnersDetails?.profile_url || '/logo.png',
        rating: booking.partnersDetails?.rating || 4.9,
        bikeNo: booking.partnersDetails?.vehicle?.reg_no || booking.partnersDetails?.bikeNo || 'LUCKNOW-BWA',
        phone: booking.partnersDetails?.personal_details?.phone || booking.partnersDetails?.phone || '9369456696'
    };

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#030617] text-white' : 'bg-gray-50 text-black'} overflow-x-hidden w-full max-w-[500px] mx-auto relative`}>
            {/* Premium Glass Header */}
            <div className="absolute top-0 left-0 right-0 z-[100] px-5 pt-8 flex justify-between items-center pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className={`w-12 h-12 rounded-[20px] flex items-center justify-center shadow-2xl backdrop-blur-2xl border pointer-events-auto active:scale-90 transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-100 text-black'}`}
                >
                    <ChevronLeft size={24} />
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-2xl border flex items-center gap-3 pointer-events-auto ${darkMode ? 'bg-[#0f172a]/80 border-white/10' : 'bg-white/90 border-gray-100'}`}
                >
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping absolute inset-0" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 relative" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-[2px] ${darkMode ? 'text-white/40' : 'text-gray-400'} leading-none mb-1`}>Status</span>
                        <span className="text-[11px] font-black tracking-tight leading-none text-yellow-500 uppercase">
                            {isFinding ? 'Finding Expert' : isAssigned ? 'Partner Assigned' : booking.status}
                        </span>
                    </div>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`w-12 h-12 rounded-[20px] flex items-center justify-center shadow-2xl backdrop-blur-2xl border pointer-events-auto active:scale-90 transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-100 text-black'}`}
                >
                    <HelpCircle size={22} />
                </motion.button>
            </div>

            {/* Main Area: Conditional Rendering */}
            <div className="relative w-full h-screen overflow-hidden">
                <AnimatePresence mode="wait">
                    {isFinding ? (
                        /* PREMIUM SEARCHING STATE */
                        <motion.div
                            key="searching"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#030617] to-[#0f172a] p-10 text-center relative overflow-hidden"
                        >
                            {/* Animated Background Pulses */}
                            <div className="absolute inset-0 z-0">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 2, opacity: [0, 0.1, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-yellow-400"
                                    />
                                ))}
                            </div>

                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="relative z-10"
                            >
                                <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 p-1 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
                                    <div className="w-full h-full rounded-full bg-[#030617] flex items-center justify-center overflow-hidden">
                                        <motion.img
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            src="/logo.png"
                                            alt="Logo"
                                            className="w-24 h-24 object-contain brightness-125"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <div className="mt-12 relative z-10 space-y-4">
                                <motion.h3
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-2xl font-black italic tracking-tighter text-white"
                                >
                                    FINDING YOUR EXPERT...
                                </motion.h3>
                                <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-[280px]">
                                    We are filtering the best technicians near your location.
                                </p>
                            </div>

                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [12, 24, 12], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1.5 rounded-full bg-yellow-500"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (isAssigned || isCompleted) && isLoaded ? (
                        /* PREMIUM MAP & TRACKING STATE */
                        <motion.div
                            key="tracking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full relative"
                        >
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={partnerLoc || userLoc || { lat: 28.6273, lng: 77.3725 }}
                                zoom={15}
                                options={MAP_OPTIONS}
                            >
                                {userLoc && (
                                    <Marker
                                        position={userLoc}
                                        icon={{
                                            url: 'https://cdn-icons-png.flaticon.com/512/1216/1216733.png',
                                            scaledSize: new window.google.maps.Size(40, 40)
                                        }}
                                    />
                                )}
                                {partnerLoc && (
                                    <Marker
                                        position={partnerLoc}
                                        icon={{
                                            url: '/logo.png',
                                            scaledSize: new window.google.maps.Size(50, 50),
                                            anchor: new window.google.maps.Point(25, 25)
                                        }}
                                    />
                                )}
                                {userLoc && partnerLoc && (
                                    <DirectionsService
                                        options={{
                                            destination: userLoc,
                                            origin: partnerLoc,
                                            travelMode: google.maps.TravelMode.DRIVING
                                        }}
                                        callback={(result, status) => {
                                            if (status === 'OK' && result) {
                                                setDirections(result);
                                            }
                                        }}
                                    />
                                )}
                                {directions && (
                                    <DirectionsRenderer
                                        options={{
                                            directions: directions,
                                            suppressMarkers: true,
                                            polylineOptions: {
                                                strokeColor: '#3b82f6',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 8
                                            }
                                        }}
                                    />
                                )}
                            </GoogleMap>

                            {/* Floating Premium Action Card */}
                            {isAssigned && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="absolute bottom-0 left-0 right-0 p-6 pb-12 z-50 backdrop-blur-3xl rounded-t-[40px] border-t border-white/10 bg-[#030617]/80 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

                                        <div className="flex items-center gap-6">
                                            <div className="relative shrink-0">
                                                <div className="w-24 h-24 rounded-[32px] overflow-hidden border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                                    <img src={technician.image} alt={technician.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white w-8 h-8 rounded-2xl flex items-center justify-center border-4 border-[#030617] shadow-xl">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded-md bg-yellow-400 text-[8px] font-black text-black tracking-widest uppercase italic">Expert</span>
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-white/50">
                                                        <Star size={10} className="fill-yellow-500 text-yellow-500" />
                                                        {technician.rating}
                                                    </div>
                                                </div>
                                                <h2 className="text-2xl font-black tracking-tighter truncate leading-tight uppercase italic">{technician.name}</h2>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                                                        <Bike size={14} className="text-blue-500" />
                                                        {technician.bikeNo}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <motion.a
                                                    whileTap={{ scale: 0.9 }}
                                                    href={`tel:${technician.phone}`}
                                                    className="w-14 h-14 rounded-[22px] bg-green-500 text-white flex items-center justify-center shadow-[0_10px_20px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
                                                >
                                                    <Phone size={24} />
                                                </motion.a>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-14 h-14 rounded-[22px] bg-white/10 border border-white/10 flex items-center justify-center text-blue-400 backdrop-blur-xl shadow-xl"
                                                >
                                                    <MessageSquare size={24} />
                                                </motion.button>
                                            </div>
                                        </div>

                                        {directions && (
                                            <div className="mt-8 flex items-center gap-4 p-4 rounded-[24px] bg-white/5 border border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                    <Navigation size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[2px]">Arriving in</p>
                                                    <p className="text-lg font-black text-white italic">{directions?.routes[0]?.legs[0]?.duration?.text || '--'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[2px]">Distance</p>
                                                    <p className="text-lg font-black text-white italic">{directions?.routes[0]?.legs[0]?.distance?.text || '--'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Details (Timeline & ID) */}
                                        <div className="mt-8 space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {/* Service Status Timeline */}
                                            <div className="space-y-6">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px] mb-4">Service Status</p>
                                                <div className="space-y-6">
                                                    {steps.map((step, idx) => {
                                                        let status = 'upcoming';
                                                        if (isCompleted) status = 'completed';
                                                        else if (isAssigned) {
                                                            if (idx === 0) status = 'completed';
                                                            else if (idx === 1) status = 'current';
                                                        } else if (isFinding && idx === 0) status = 'current';

                                                        return (
                                                            <div key={idx} className="flex gap-5">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : status === 'current' ? 'bg-yellow-500 border-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                                                        {status === 'completed' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                                    </div>
                                                                    {idx !== steps.length - 1 && <div className={`w-0.5 h-10 my-1 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-white/5'}`} />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={`text-sm font-black italic tracking-tight uppercase ${status === 'upcoming' ? 'text-white/20' : 'text-white'}`}>{step.title}</p>
                                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide">{step.desc}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Info Summary */}
                                            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[2px] mb-1">Total Amount</p>
                                                    <p className="text-xl font-black text-yellow-500 italic">₹{Math.round(booking.metaModels?.totalAmount || 0)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[2px] mb-1">Booking ID</p>
                                                    <p className="text-xs font-black text-white/60 tracking-widest uppercase">#{booking.orderId || 'BWA-000'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </motion.div>
                    ) : (
                        /* CANCELLED / COMPLETED STATES */
                        <motion.div
                            key="status"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex items-center justify-center flex-col p-10 text-center bg-[#030617]"
                        >
                            {isCompleted ? (
                                <>
                                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                                        <CheckCircle2 size={56} className="text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">SERVICE COMPLETED</h3>
                                    <p className="text-gray-500 font-bold max-w-[250px]">Thank you for your trust in Bijli Wala Aaya!</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                        <X size={56} className="text-red-500" />
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">BOOKING CANCELLED</h3>
                                    <p className="text-gray-500 font-bold">This request is no longer active.</p>
                                </>
                            )}

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/bookings')}
                                className="mt-12 px-10 py-4 bg-white/5 border border-white/10 rounded-[20px] text-white font-black italic tracking-widest text-sm uppercase"
                            >
                                GO TO HISTORY
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

