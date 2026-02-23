'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, ShoppingCart, Minus, Plus, CheckCircle, Loader2, ArrowLeft, Play, Pause, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import Lottie from 'lottie-react';
import clockAnim from '../../public/animations/clock.json';
import warrantyAnim from '../../public/animations/safe-done.json';

interface ServiceDetailBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    service: any;
}

// Helper to fetch details (mocked or real)
const fetchFullDetails = async (serviceId: string) => {
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 800));
};

const ServiceDetailBottomSheet: React.FC<ServiceDetailBottomSheetProps> = ({ isOpen, onClose, service: initialService }) => {
    const { addToCart, removeFromCart, cartItems } = useCart();
    const { darkMode } = useApp();
    const [service, setService] = useState<any>(initialService);
    const [loading, setLoading] = useState(false);
    const [showAllFeatures, setShowAllFeatures] = useState(false);
    const [selectedDeepId, setSelectedDeepId] = useState<string | null>(null);
    const [selectedSubDeepId, setSelectedSubDeepId] = useState<string | null>(null);

    // Update internal state when prop changes or opens
    const getUnit = (title: string, cat?: string) => {
        const text = (cat || title || '').toLowerCase();

        // Priority 1: Direct machine matches
        if (text.includes('ac')) return 'AC';
        if (text.includes('washing')) return 'Washing Machine';
        if (text.includes('fan')) return 'Fan';
        if (text.includes('refrigerator') || text.includes('fridge')) return 'Fridge';
        if (text.includes('ro') || text.includes('purifier')) return 'RO';

        // Priority 2: Clean up generic terms
        let cleanCat = cat || 'Service';
        cleanCat = cleanCat.replace(/repair|installation|service|maintenance/gi, '').trim();

        return cleanCat || 'Service';
    };


    useEffect(() => {
        if (isOpen && initialService) {
            setService(initialService);
            // RESET SELECTIONS ON NEW OPEN
            setSelectedDeepId(null);
            setSelectedSubDeepId(null);

            // If essential details are missing (simulate dynamic check), fetch them
            if (!initialService.description || !initialService.features) {
                setLoading(true);
                fetchFullDetails(initialService.id).then(() => {
                    // Simulate enriching data
                    const enriched = {
                        ...initialService,
                        description: initialService.description || 'Premium service with expert technicians. We ensure top-quality safety and hygiene standards.',
                        brandsSupported: initialService.brandsSupported || 'All Major Brands',
                        features: initialService.features || [
                            'Deep cleaning of filters & coils',
                            'Expert technician service',
                            'Genuine parts usage',
                            '45-day post-service guarantee',
                            'Background verified partners'
                        ]
                    };
                    setService(enriched);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        }
    }, [isOpen, initialService?.id]); // Depend on ID specifically to trigger reset

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const variationsScrollRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll logic for offers
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: clientWidth / 2, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll logic for variations
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (variationsScrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = variationsScrollRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    variationsScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    variationsScrollRef.current.scrollBy({ left: 150, behavior: 'smooth' }); // Scroll by card width
                }
            }
        }, 2500); // Slightly faster than offers
        return () => clearInterval(interval);
    }, []);

    if (!service) return null;
    const currentId = String(selectedSubDeepId || selectedDeepId || service.id);
    const quantity = cartItems.find(i => String(i.id) === currentId)?.quantity || 0;

    const handleAdd = () => {
        let subDeepFirstTitle = "";

        // 🔥 dynamically resolve subDeep firstTitle
        if (
            selectedDeepId &&
            selectedSubDeepId &&
            service.deepChildCategory?.[selectedDeepId]
                ?.subDeepChildCategory?.[selectedSubDeepId]
                ?.firstTitle
        ) {
            subDeepFirstTitle =
                service.deepChildCategory[selectedDeepId]
                    .subDeepChildCategory[selectedSubDeepId]
                    .firstTitle;
        }

        // Determine IDs based on whether it's a variation or main service or deep data
        // If selectedSubDeepId is present, we are definitely in a deep nested variation
        // If selectedDeepId is present but no subDeep, likely a deep category item
        // If neither, fallback to service.id (standard item)

        const finalDeepId = selectedDeepId || (service.isDeepData ? service.id : (service.deepId || null));
        const finalSubDeepId = selectedSubDeepId || (service.subDeepId || null);

        // Ensure childKey is always present
        const finalChildKey = service.childKey || service.categoryType || 'Service';

        addToCart({
            // 🔑 basic identifiers
            id: selectedSubDeepId || selectedDeepId || service.id,
            mainId: service.mainId || localStorage.getItem('mainId') || '',
            subId: service.subId || localStorage.getItem('subId') || '',
            childKey: finalChildKey,

            // 🔑 ids - CRITICAL FOR SYNC
            deepId: finalDeepId,
            subDeepId: finalSubDeepId,

            // 🔥 titles (THIS FIXES EVERYTHING)
            name: service.title,                 // deep / base name
            subDeepFirstTitle,                   // only if subDeep selected

            // 🔑 pricing
            price: service.price,
            quantity: 1,

            // Pass full item details for transparency if needed by backend
            itemDetails: {
                ...service,
                deepId: finalDeepId,
                subDeepId: finalSubDeepId
            }
        });
    };

    const handleRemove = () => {
        removeFromCart(currentId);
    };



    const offers = [
        {
            title: "HDFC Offer",
            value: "15% OFF",
            desc: "Instant cashback",
            bg: "from-blue-600 to-blue-800",
            text: "text-blue-100"
        },
        {
            title: "New User",
            value: "FLAT ₹100",
            desc: "Code: FIRST100",
            bg: "from-green-600 to-green-800",
            text: "text-green-100"
        },
        {
            title: "Winter Special",
            value: "30% OFF",
            desc: "On Heater Repair",
            bg: "from-orange-500 to-red-600",
            text: "text-orange-100"
        },
        {
            title: "Combo Deal",
            value: "Save ₹299",
            desc: "AC + Fan Service",
            bg: "from-purple-600 to-indigo-700",
            text: "text-purple-100"
        }
    ];

    const features = service.features || [];
    const displayedFeatures = showAllFeatures ? features : features.slice(0, 3);

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
                        className="fixed inset-0 bg-black/60 z-[120] backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className={`fixed bottom-0 left-0 right-0 z-[120] rounded-t-[32px] overflow-hidden flex flex-col h-[92vh] ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
                    >
                        {/* Yellow Header Strip */}
                        <div className="bg-[#FFC42E] px-4 py-4 flex items-center justify-between gap-3 shrink-0 rounded-t-[32px] relative z-20">
                            {/* Back Button (Closes Sheet) */}
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-all text-black"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            {/* Search Bar (Visual) */}
                            <div className="flex-1 h-10 bg-white rounded-full flex items-center px-4 shadow-sm text-black">
                                <span className="text-gray-500 text-sm">Search services...</span>
                            </div>

                            {/* Rate Card Button */}
                            <button
                                onClick={() => window.location.href = '/rate-card'}
                                className="h-10 px-4 bg-black text-white rounded-full text-xs font-bold flex items-center shadow-sm active:scale-95 transition-transform"
                            >
                                Rate Card
                            </button>
                        </div>

                        {/* Content Scrollable Area */}
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={40} />
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading full details...</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pb-28">

                                {/* Dynamic Video Section - Shows if videoUrl exists, else mock/demo */}
                                {/* Dynamic Video Section */}
                                {(() => {
                                    // Helper to resolve video URL from various possible API structures
                                    const getVideoUrl = () => {
                                        if (service.videoUrl) return service.videoUrl;

                                        const deep = service.deepData;
                                        if (!deep) return null;

                                        // Try common patterns found in API responses
                                        if (deep.video?.url) return deep.video.url;
                                        if (deep.videoUrl) return deep.videoUrl;

                                        // Handle arrays (take first video)
                                        if (Array.isArray(deep.videoUrls) && deep.videoUrls.length > 0) {
                                            return typeof deep.videoUrls[0] === 'string' ? deep.videoUrls[0] : deep.videoUrls[0]?.url;
                                        }
                                        if (Array.isArray(deep.videos) && deep.videos.length > 0) {
                                            return typeof deep.videos[0] === 'string' ? deep.videos[0] : deep.videos[0]?.url;
                                        }

                                        return null;
                                    };

                                    const videoSrc = getVideoUrl();

                                    return (
                                        <div className="w-full h-[220px] bg-black relative shrink-0">
                                            <video
                                                src={videoSrc || 'https://www.w3schools.com/html/mov_bbb.mp4'} // Keep fallback or remove it if you want to hide video section when empty
                                                className="w-full h-full object-cover"
                                                controls
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                                                Preview
                                            </div>
                                            {!videoSrc && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                                                    <p className="text-white/50 text-xs">No preview available</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="p-5">
                                    {/* Title & Rating */}
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h2 className={`text-2xl font-black leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {service.title}
                                        </h2>
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                                            <Lottie animationData={warrantyAnim} loop={true} style={{ width: 32, height: 32 }} />
                                        </div>
                                    </div>

                                    {/* Rating Badge */}
                                    {service.rating && (
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                                                {service.rating} <Star size={10} fill="currentColor" />
                                            </div>
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>2k reviews</span>
                                        </div>
                                    )}

                                    {/* Offers Carousel */}
                                    <div className="mb-6 relative group">
                                        <div
                                            ref={scrollRef}
                                            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-1"
                                            style={{ scrollBehavior: 'smooth' }}
                                        >
                                            {offers.map((offer, i) => (
                                                <div
                                                    key={i}
                                                    className={`min-w-[48%] snap-start bg-gradient-to-br ${offer.bg} rounded-2xl p-3 text-white shadow-sm shrink-0`}
                                                >
                                                    <div className={`text-[9px] font-medium ${offer.text} mb-1 uppercase tracking-wide`}>{offer.title}</div>
                                                    <p className="font-extrabold text-xl whitespace-nowrap">{offer.value}</p>
                                                    <p className="text-[9px] opacity-90 mt-0.5">{offer.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Additional Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all hover:shadow-sm ${darkMode
                                            ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-200 border border-white/10'
                                            : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-700 border border-blue-100/50'}`}>
                                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                                <Lottie animationData={clockAnim} loop={true} style={{ width: 22, height: 22 }} />
                                            </div>
                                            <div>
                                                <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-blue-500'}`}>Est. Time</p>
                                                <p className={`text-xs font-bold leading-none mt-0.5`}>{service.serviceTime || '60 mins'}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="w-4.5 h-4.5 flex items-center justify-center">
                                            </div>
                                            <div>
                                                <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supported</p>
                                                <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{service.brandsSupported || 'All Brands'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {service.description && (
                                        <div className="mb-6">
                                            <h3 className={`font-bold text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Description</h3>
                                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {service.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Features */}
                                    <div className="space-y-4 mb-6">
                                        <h3 className={`font-bold text-sm uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>What's Included</h3>
                                        <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                            <ul className="space-y-3">
                                                {displayedFeatures.map((feature: string, index: number) => {
                                                    // Check if feature contains special formatting
                                                    if (feature.includes('|') || feature.includes('•') || feature.includes('~')) {
                                                        return (
                                                            <li key={index} className="block text-sm">
                                                                <div className={`text-[12px] font-normal flex flex-col gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                                                    {(() => {
                                                                        const textVal = feature.replace(/Description\s*\*\s*/, '');
                                                                        const parts = textVal.split(/([|•~])/);
                                                                        const elements: { type: 'bullet' | 'para', text: string }[] = [];

                                                                        for (let i = 0; i < parts.length; i++) {
                                                                            const part = parts[i];
                                                                            if (part === '|' || part === '•') {
                                                                                if (parts[i + 1]?.trim()) {
                                                                                    elements.push({ type: 'bullet', text: parts[i + 1] });
                                                                                    i++;
                                                                                }
                                                                            } else if (part === '~') {
                                                                                if (parts[i + 1]?.trim()) {
                                                                                    elements.push({ type: 'para', text: parts[i + 1] });
                                                                                    i++;
                                                                                }
                                                                            } else if (part.trim()) {
                                                                                // Default fallback for initial text (treat as paragraph if starts with non-bullet)
                                                                                elements.push({ type: 'para', text: part });
                                                                            }
                                                                        }

                                                                        return elements.map((item, idx) => (
                                                                            item.type === 'bullet' ? (
                                                                                <div key={idx} className="flex items-start gap-1.5">
                                                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${darkMode ? 'bg-gray-400' : 'bg-gray-900'}`} />
                                                                                    <span>{item.text.trim()}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <div key={idx} className="leading-relaxed opacity-90 block pt-1 pb-1 text-justify">
                                                                                    {item.text.trim()}
                                                                                </div>
                                                                            )
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            </li>
                                                        );
                                                    }

                                                    return (
                                                        <li key={index} className="flex gap-3 text-sm group">
                                                            <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                                                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{feature}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {features.length > 3 && (
                                                <button
                                                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                                                    className="w-full mt-4 py-2 text-xs font-bold text-blue-500 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                >
                                                    {showAllFeatures ? 'Show Less' : `View ${features.length - 3} More Items`}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Warranty Banner */}
                                    {(service.warranty) && (
                                        <div className={`flex items-center gap-3 p-4 rounded-xl shadow-sm border ${darkMode ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] border-white/10' : 'bg-gradient-to-r from-orange-50 to-orange-100/30 border-orange-100'}`}>
                                            <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-600 shrink-0">
                                                <Lottie animationData={warrantyAnim} loop={true} style={{ width: 28, height: 28 }} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-orange-800'}`}>Warranty Protection</p>
                                                <p className={`text-xs mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{service.warranty} included</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Variations Section - SubDeepChildCategory */}
                                    {service.deepData &&
                                        (() => {
                                            let allItems: any[] = [];
                                            const pushItems = (obj: any) => {
                                                if (!obj) return;
                                                const items = Array.isArray(obj) ? obj : Object.values(obj);
                                                items.forEach((item) => allItems.push(item));
                                            };

                                            const processObject = (data: any) => {
                                                if (!data) return;
                                                // Handle Direct subDeepChildCategory
                                                pushItems(data.subDeepChildCategory);
                                                pushItems(data.SubDeepChildCategory);

                                                // Handle deepChildCategory (Nested)
                                                if (data.deepChildCategory) {
                                                    const deeps = Array.isArray(data.deepChildCategory)
                                                        ? data.deepChildCategory
                                                        : Object.values(data.deepChildCategory);
                                                    deeps.forEach((deep: any) => {
                                                        pushItems(deep.subDeepChildCategory);
                                                        pushItems(deep.SubDeepChildCategory);
                                                    });
                                                }
                                                // Handle subDeepChildCategory nested within data values directly (JSON structure case)
                                                if (typeof data === "object" && !Array.isArray(data)) {
                                                    Object.values(data).forEach((val: any) => {
                                                        if (val && typeof val === "object") {
                                                            pushItems(val.subDeepChildCategory);
                                                            pushItems(val.SubDeepChildCategory);
                                                        }
                                                    });
                                                }
                                            };

                                            if (Array.isArray(service.deepData)) {
                                                service.deepData.forEach((item: any) => processObject(item));
                                            } else {
                                                processObject(service.deepData);
                                            }

                                            // Filter valid items
                                            const uniqueItems = allItems.filter(
                                                (item) =>
                                                    item &&
                                                    (item.imageUrl ||
                                                        item.image?.url ||
                                                        item.priceAfterGst ||
                                                        item.currentPrice ||
                                                        item.firstTitle ||
                                                        item.name)
                                            );

                                            if (uniqueItems.length === 0) return null;

                                            return (
                                                <div className="mb-6">
                                                    <h3 className={`font-bold text-sm mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                        Variations
                                                    </h3>
                                                    <div
                                                        ref={variationsScrollRef}
                                                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x px-1"
                                                        style={{ scrollBehavior: 'smooth' }}
                                                    >
                                                        {uniqueItems.map((sub: any, idx) => {
                                                            // Generate a unique ID for the variation if it doesn't have one
                                                            // We use a composite key of parent ID + variation details to ensure uniqueness
                                                            const uniqueSubId = sub.id || sub._id || `${service.id}_var_${idx}_${sub.name || sub.firstTitle || 'unknown'}`.replace(/\s+/g, '_');

                                                            return (
                                                                <div
                                                                    key={uniqueSubId}
                                                                    className={`w-[140px] shrink-0 snap-center rounded-2xl overflow-hidden border flex flex-col shadow-md ${darkMode
                                                                        ? "bg-gray-800 border-gray-700"
                                                                        : "bg-white border-gray-100"
                                                                        }`}
                                                                >
                                                                    {/* Image */}
                                                                    <div className="w-full h-24 bg-gray-200 relative">
                                                                        <img
                                                                            src={
                                                                                sub.imageUrl ||
                                                                                sub.image?.url ||
                                                                                "https://cdn-icons-png.flaticon.com/512/1089/1089129.png"
                                                                            }
                                                                            alt="Variation"
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = "none";
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="p-3 flex flex-col justify-between h-full">
                                                                        {/* Title */}
                                                                        {(sub.firstTitle || sub.name) && (
                                                                            <div
                                                                                className={`text-xs font-bold mb-1 line-clamp-2 ${darkMode ? "text-gray-200" : "text-gray-700"
                                                                                    }`}
                                                                            >
                                                                                {sub.firstTitle || sub.name}
                                                                            </div>
                                                                        )}
                                                                        {/* Price Section */}
                                                                        <div className="mb-2">
                                                                            <span
                                                                                className={`text-sm font-black ${darkMode ? "text-white" : "text-gray-900"
                                                                                    }`}
                                                                            >
                                                                                ₹{Math.round(sub.currentPrice || 0)}
                                                                            </span>
                                                                            {sub.originalPrice && (
                                                                                <span className="ml-2 text-[10px] line-through opacity-60 font-medium">
                                                                                    ₹{sub.originalPrice}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {/* Add Button (Always at Bottom) */}
                                                                        {(() => {
                                                                            // Check cart using the robust unique ID
                                                                            const qtyV = cartItems.find((c) => c.id === uniqueSubId)?.quantity || 0;

                                                                            const onMinus = () => removeFromCart(uniqueSubId);
                                                                            const onPlus = () => {
                                                                                addToCart({
                                                                                    id: uniqueSubId,
                                                                                    name: sub.name || sub.firstTitle || "Variation",
                                                                                    price: sub.currentPrice || sub.price || 0,
                                                                                    image: sub.imageUrl || sub.image?.url || null,
                                                                                    deepId: sub.id || sub._id,
                                                                                    subDeepId: sub.id || sub._id,
                                                                                    mainId: service.mainId || localStorage.getItem('mainId') || '',
                                                                                    subId: service.subId || localStorage.getItem('subId') || '',
                                                                                    childKey: service.childKey || service.categoryType || 'Service'
                                                                                });
                                                                            };

                                                                            return qtyV > 0 ? (
                                                                                <div className={`qty-box flex items-center justify-between rounded-lg border p-1 mt-auto ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                                                                    <button
                                                                                        onClick={onMinus}
                                                                                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-white text-gray-900 shadow-sm'}`}
                                                                                    >
                                                                                        <Minus size={14} />
                                                                                    </button>
                                                                                    <span className={`text-xs font-bold px-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                                        {qtyV}
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={onPlus}
                                                                                        className={`w-7 h-7 flex items-center justify-center rounded-md bg-black text-white transition-transform active:scale-95`}
                                                                                    >
                                                                                        <Plus size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={onPlus}
                                                                                    className="w-full mt-auto py-2 rounded-lg font-bold text-sm shadow-sm active:scale-95 transition-all bg-blue-500 text-white hover:bg-blue-600"
                                                                                >
                                                                                    Add
                                                                                </button>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                    {/* Our Process Section */}
                                    <div className="mt-6">
                                        <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>How it Works</h3>
                                        <div className={`rounded-xl p-5 border relative overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                            {/* Connecting Line */}
                                            <div className={`absolute top-5 bottom-5 left-[29px] w-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

                                            <div className="space-y-6 relative z-10">
                                                {/* Step 1 */}
                                                <div className="flex gap-4">
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 ring-4 ring-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Technician Arrival</h4>
                                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Expert arrives at your scheduled time with all necessary tools.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Step 2 */}
                                                <div className="flex gap-4">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${darkMode ? 'bg-gray-900 border-blue-500' : 'bg-white border-blue-500'}`}>
                                                        <span className={`text-[10px] font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>2</span>
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Diagnosis & Setup</h4>
                                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Initial inspection (~10-15 mins) and safety setup.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Step 3 */}
                                                <div className="flex gap-4">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${darkMode ? 'bg-gray-900 border-blue-500' : 'bg-white border-blue-500'}`}>
                                                        <span className={`text-[10px] font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>3</span>
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{service.title || 'Service Execution'}</h4>
                                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Professional service execution ({service.serviceTime || '45-60 mins'}).
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Step 4 */}
                                                <div className="flex gap-4">
                                                    <div className="w-5 h-5 rounded-full bg-green-500 ring-4 ring-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                        <CheckCircle size={10} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Post-Service Cleanup</h4>
                                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Area cleanup and final functionality check.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Price Breakdown */}
                                    <div className="mt-6 mb-2">
                                        <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Price Breakdown</h3>
                                        <div className={`rounded-xl p-4 space-y-1.5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                            {/* Original Price */}
                                            {service.originalPrice && service.price && Number(service.originalPrice) > Number(service.price) && (
                                                <div className="flex justify-between items-center text-[13px] font-bold">
                                                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Original Price</span>
                                                    <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} line-through`}>₹{Number(service.originalPrice).toLocaleString()}</span>
                                                </div>
                                            )}

                                            {/* Main Price */}
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Price</span>
                                                <span className={`font-black text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{Number(service.price).toLocaleString()}</span>
                                            </div>

                                            {/* Compact Badge */}
                                            {service.originalPrice && service.price && Number(service.originalPrice) > Number(service.price) && (
                                                <div className="flex">
                                                    <div className={`mt-0.5 px-2.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 font-black shadow-sm whitespace-nowrap text-[9px] uppercase tracking-tighter border shrink-0 min-w-max ${darkMode ? 'bg-green-500/10 text-[#00c88a] border-green-500/30' : 'bg-green-50 text-[#00a36c] border-green-500/20'}`}>
                                                        <Tag size={12} fill="currentColor" className="shrink-0" />
                                                        <span className="leading-none">
                                                            {(() => {
                                                                const orig = Number(service.originalPrice);
                                                                const dVal = Number(service.discountValue || 0);
                                                                const dType = service.discountType || 'fixed';
                                                                let savedAmount = 0;

                                                                if (dType === 'percentage' || dType === 'percentage ' || dType.trim() === 'percentage') {
                                                                    savedAmount = orig * (dVal / 100);
                                                                } else {
                                                                    savedAmount = dVal || (orig - Number(service.price));
                                                                }

                                                                return `₹${Math.round(savedAmount).toLocaleString()} PER `;
                                                            })()}{(() => {
                                                                const text = (service.categoryType || service.title || '').toLowerCase();
                                                                if (text.includes('ac')) return 'AC';
                                                                if (text.includes('washing')) return 'Washing';
                                                                if (text.includes('fan')) return 'Fan';
                                                                if (text.includes('refrigerator') || text.includes('fridge')) return 'Fridge';
                                                                if (text.includes('ro') || text.includes('purifier')) return 'RO';
                                                                return 'SERVICE';
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tax Info */}
                                            <div className="flex flex-col gap-1 mt-1">
                                                <div className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-wider opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                                                    <span>GST ({service.gst || service.gstRate || 0}%) - {service.gstType === 'exclude' || service.gstType === 'exclusive' ? 'Extra' : 'Included'}</span>
                                                </div>
                                                <div className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                                                    <span>Incl. all taxes</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Action Bar */}
                        <div className={`p-4 border-t absolute bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col gap-0">
                                    {service.originalPrice && service.price && Number(service.originalPrice) > Number(service.price) && (
                                        <span className="text-[12px] text-gray-500 line-through font-bold ml-1">₹{Number(service.originalPrice).toLocaleString()}</span>
                                    )}
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{service.price}</span>
                                    </div>
                                </div>
                                {quantity > 0 && <span className="text-green-500 font-bold text-sm">{quantity} in cart</span>}
                            </div>

                            {quantity > 0 ? (
                                <div className={`flex items-center rounded-xl overflow-hidden border h-14 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} w-full`}>
                                    <button
                                        onClick={handleRemove}
                                        className={`flex-1 h-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-50 active:bg-gray-100'}`}
                                    >
                                        <Minus size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                                    </button>
                                    <div className={`w-px h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                    <span className={`w-14 text-center font-black text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{quantity}</span>
                                    <div className={`w-px h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                    <button
                                        onClick={handleAdd}
                                        className="flex-1 h-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAdd}
                                    className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    Add to Cart
                                </button>
                            )}
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceDetailBottomSheet;
