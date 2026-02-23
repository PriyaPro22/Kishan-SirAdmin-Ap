'use client';

import { useCart } from '@/app/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import cartAnimation from '@/app/assets/lottie/add-to-cart.json';
import arrowAnimation from '@/app/assets/lottie/scroll-arrow.json';

export default function FloatingCart() {
    const { cartItems } = useCart();
    const { showBottomNav } = useApp();
    const router = useRouter();
    const { openModal } = useApp();
    const pathname = usePathname();

    // Lottie Refs
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const arrowRef = useRef<LottieRefCurrentProps>(null);
    const directArrowRef = useRef<LottieRefCurrentProps>(null);
    const prevItemsCount = useRef(0);

    // Draggable & UI state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isExpanded, setIsExpanded] = useState(false);
    const [panelOrientation, setPanelOrientation] = useState<'top' | 'bottom' | 'left' | 'right'>('left');
    const cartRef = useRef<HTMLDivElement>(null);

    const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalPrice = cartItems.reduce((sum, item) => {
        const p = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
        const q = Number(item.quantity) || 0;
        return sum + (p * q);
    }, 0);

    // Handle initial position (Center Bottom as default)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const contentWidth = Math.min(window.innerWidth, 500);
            const startX = (window.innerWidth - contentWidth) / 2;
            const endX = startX + contentWidth;

            const bottomOffset = showBottomNav ? 110 : 60;
            const safeX = Math.min(Math.max(window.innerWidth / 2, startX + 50), endX - 50);
            const safeY = Math.min(Math.max(window.innerHeight - bottomOffset, 50), window.innerHeight - 50);
            setPosition({ x: safeX, y: safeY });
        }
    }, [showBottomNav]);

    // Handle Lottie Animation on Item Add (Particles Effect)
    useEffect(() => {
        if (totalItems > prevItemsCount.current) {
            // Play particles (daane) segment: 0 - 30
            lottieRef.current?.playSegments([0, 30], true);

            // Pulse effect for toolbox
            const timer = setTimeout(() => {
                lottieRef.current?.playSegments([24, 60], false); // Bounce loop
            }, 600);
            return () => clearTimeout(timer);
        }
        prevItemsCount.current = totalItems;
    }, [totalItems]);

    // Calculate orientation when opening/dragging
    const updateOrientation = (posX: number, posY: number) => {
        const h = window.innerHeight;
        const contentWidth = Math.min(window.innerWidth, 500);
        const startX = (window.innerWidth - contentWidth) / 2;
        const endX = startX + contentWidth;

        // Estimated panel width
        const panelWidth = 220;
        const padding = 20;

        // 1. Check Vertical Constraints
        const isNearBottom = (h - posY < 150);
        const isNearTop = (posY < 160);

        if (isNearTop) {
            setPanelOrientation('bottom');
            return;
        }

        // 2. Horizontal Space Checks
        const hasSpaceLeft = (posX - startX) > (panelWidth + padding);
        const hasSpaceRight = (endX - posX) > (panelWidth + padding);

        // User: "jyda item ho to ye cart ke upar khule"
        // Also: "kam hai or sirf cart ke samen hi khule"

        if (hasSpaceLeft && posX > (window.innerWidth / 2)) {
            setPanelOrientation('left');
        } else if (hasSpaceRight) {
            setPanelOrientation('right');
        } else {
            // No horizontal space -> Open TOP (unless near top, which is handled above)
            setPanelOrientation('top');
        }
    };

    // Drag handlers
    const handleMouseMove = (e: MouseEvent) => {
        if (dragStart.x !== 0 || dragStart.y !== 0) {
            let newX = e.clientX - dragStart.x;
            let newY = e.clientY - dragStart.y;

            const contentWidth = Math.min(window.innerWidth, 500);
            const startX = (window.innerWidth - contentWidth) / 2;
            const endX = startX + contentWidth;

            // Screen boundaries clamping (respecting 500px content area)
            const margin = 50;
            newX = Math.min(Math.max(newX, startX + margin), endX - margin);
            newY = Math.min(Math.max(newY, margin), window.innerHeight - margin);

            if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
                setIsDragging(true);
                setIsExpanded(false); // Close panel on drag
            }
            setPosition({ x: newX, y: newY });
            updateOrientation(newX, newY);
        }
    };

    const handleMouseUp = () => {
        setDragStart({ x: 0, y: 0 });
        setTimeout(() => setIsDragging(false), 100);
    };

    // Touch handlers
    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            let newX = touch.clientX - dragStart.x;
            let newY = touch.clientY - dragStart.y;

            const contentWidth = Math.min(window.innerWidth, 500);
            const startX = (window.innerWidth - contentWidth) / 2;
            const endX = startX + contentWidth;

            // Screen boundaries clamping (respecting 500px content area)
            const margin = 50;
            newX = Math.min(Math.max(newX, startX + margin), endX - margin);
            newY = Math.min(Math.max(newY, margin), window.innerHeight - margin);

            if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
                setIsDragging(true);
                setIsExpanded(false);
                if (e.cancelable) e.preventDefault();
            }
            setPosition({ x: newX, y: newY });
            updateOrientation(newX, newY);
        }
    };

    useEffect(() => {
        if (dragStart.x !== 0 || dragStart.y !== 0) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', () => setDragStart({ x: 0, y: 0 }));
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
            };
        }
    }, [dragStart]);

    const handleToolboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDragging) {
            updateOrientation(position.x, position.y);
            setIsExpanded(!isExpanded);
        }
    };

    const handleCheckout = (e: React.MouseEvent) => {
        e.stopPropagation();
        const userId = localStorage.getItem('userId');
        if (!userId) openModal('auth');
        else router.push('/booking-summary');
    };

    const latestItems = useMemo(() => {
        return [...cartItems].reverse().slice(0, 5);
    }, [cartItems]);

    useEffect(() => {
        if (isExpanded) {
            const timer = setTimeout(() => {
                arrowRef.current?.play();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    if (totalItems === 0 || pathname === '/booking-summary' || pathname.startsWith('/bookings/')) return null;

    return (
        <div
            className="fixed z-[9999] select-none touch-none"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
        >
            {/* PANEL (Smart Orientation & Boundary Clamping) */}
            <div
                className={`absolute rounded-[32px] p-2 flex items-center gap-3 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer bg-[#2E7D32]/95 backdrop-blur-xl border-2 border-white/30
                    ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
                    ${panelOrientation === 'left' ? 'right-full mr-4 top-1/2 -translate-y-1/2 origin-right' : ''}
                    ${panelOrientation === 'right' ? 'left-full ml-4 top-1/2 -translate-y-1/2 origin-left' : ''}
                    ${panelOrientation === 'top' ? 'bottom-full mb-4 left-1/2 -translate-x-1/2 origin-bottom' : ''}
                    ${panelOrientation === 'bottom' ? 'top-full mt-4 left-1/2 -translate-x-1/2 origin-top' : ''}
                `}
                onClick={handleCheckout}
                style={{
                    width: 'max-content',
                    minWidth: '150px',
                    maxWidth: 'calc(100vw - 40px)', // 🔥 Prevent Overflow on 320px screens
                }}
            >
                {/* Images Stack */}
                <div className="flex items-center -space-x-4 pl-1.5 overflow-hidden shrink-0">
                    {latestItems.slice(0, 4).map((item, i) => ( // Show max 4 on small screens
                        <div
                            key={i}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/40 bg-white overflow-hidden shadow-md shrink-0"
                            style={{
                                zIndex: 10 - i,
                                opacity: 1 - (i * 0.05)
                            }}
                        >
                            <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png';
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Text Section */}
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-white font-black text-xs sm:text-sm leading-tight truncate">View cart</span>
                    <span className="text-white/80 text-[10px] font-bold truncate">{totalItems} items</span>
                </div>

                {/* Arrow Section */}
                <div className="w-8 h-8 sm:w-12 sm:h-12 relative rotate-[-90deg] shrink-0">
                    <Lottie
                        lottieRef={arrowRef}
                        animationData={arrowAnimation}
                        loop={true}
                        autoplay={true}
                    />
                </div>
            </div>

            {/* TOOLBOX (The Main Trigger) */}
            <div
                ref={cartRef}
                className="relative group"
            >
                {/* Main Cart Trigger */}
                <div
                    onClick={handleToolboxClick}
                    onMouseDown={(e) => {
                        setIsDragging(false);
                        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
                    }}
                    onTouchStart={(e) => {
                        const touch = e.touches[0];
                        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
                    }}
                    className="relative cursor-grab active:cursor-grabbing transform group-hover:scale-105 transition-transform duration-300"
                >
                    {/* Item Count (Integrated Static Badge) */}
                    <div
                        className="absolute top-[16%] right-[12%] bg-[#4040ff] text-white w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] border border-white/20 z-10"
                        style={{ pointerEvents: 'none' }}
                    >
                        {totalItems}
                    </div>

                    {/* Lottie Animation (Toolbox) */}
                    <div className="w-24 h-24 min-[450px]:w-26 min-[450px]:h-26">
                        <Lottie
                            lottieRef={lottieRef}
                            animationData={cartAnimation}
                            loop={false}
                            autoplay={false}
                        />
                    </div>
                </div>

                {/* Direct Checkout Arrow (Points Right) */}
                {!isExpanded && (
                    <div
                        onClick={handleCheckout}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform active:scale-90"
                    >
                        <div className="w-10 h-10 rotate-[-90deg]">
                            <Lottie
                                lottieRef={directArrowRef}
                                animationData={arrowAnimation}
                                loop={true}
                                autoplay={true}
                                style={{ pointerEvents: 'none' }}
                            />
                        </div>
                    </div>
                )}

                {/* Total Price (Simple Slim Design Below) */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#0c0f14]/90 backdrop-blur-xl px-3 py-0.5 rounded-xl border border-white/10 shadow-[0_8px_25px_rgb(0,0,0,0.4)]">
                    <span className="text-yellow-400 font-black text-sm tracking-tight whitespace-nowrap">
                        ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Pulse Ring on Add */}
            <div className={`absolute inset-0 bg-yellow-400/20 rounded-full -z-10 transition-all duration-700 pointer-events-none ${totalItems > prevItemsCount.current ? 'scale-[2] opacity-0' : 'scale-0 opacity-100'}`} />
        </div>
    );
}

