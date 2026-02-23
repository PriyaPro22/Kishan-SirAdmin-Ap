'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import BillDetailsSheet from '../components/BillDetailsSheet';
import PaymentFailurePopup from '../components/PaymentFailurePopup';


export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cartItems, totalPrice, clearCart } = useCart();
    const { darkMode } = useApp();
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);

    // Check for success param to show animation directly
    const showSuccessInitially = searchParams.get('success') === 'true';
    const [isSuccess, setIsSuccess] = useState(showSuccessInitially);

    const [showBillDetails, setShowBillDetails] = useState(false);
    const [showPaymentFailure, setShowPaymentFailure] = useState(false);


    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            // TURNT ORDER ID GENERATION: Don't wait 2s if we can do it faster
            // Generate order ID logic can be integrated here or called immediately
            const locationKey = typeof window !== 'undefined' ? localStorage.getItem('selectedCityCode') || 'LKW' : 'LKW';

            // Trigger Order ID generation in parallel or immediately
            const orderRes = await fetch(`/api/order/generate-order-id?locationKey=${locationKey}`);
            const orderData = await orderRes.json();

            if (orderData.success) {
                console.log("Order ID generated immediately:", orderData.orderId);
                // Process order locally 
                // For now, keeping the success simulation but making it feel "instant"
                setIsProcessing(false);
                setIsSuccess(true);
                clearCart();
                // Store order ID for success page
                localStorage.setItem('lastOrderId', orderData.orderId);

                setTimeout(() => {
                    router.push('/booking-success');
                }, 1500); // Shorter redirect delay for "very very fast" feel
            } else {
                throw new Error("Failed to generate order id");
            }
        } catch (error) {
            console.error("Payment flow error:", error);
            setIsProcessing(false);
            setShowPaymentFailure(true);
        }
    };



    if (isSuccess) {
        // Optimized Falling Stars Animation: Use stable count and memoized stars
        const stars = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            size: 10 + Math.random() * 15
        })), []);



        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                {/* Falling Stars Animation */}
                <div className="absolute inset-0 pointer-events-none">
                    {stars.map((star: any) => (
                        <motion.div
                            key={`star-${star.id}`}
                            initial={{ y: -50, x: 0, opacity: 0, rotate: 0 }}
                            animate={{
                                y: '120vh',
                                opacity: [0, 1, 1, 0],
                                rotate: 360
                            }}
                            transition={{
                                duration: star.duration,
                                delay: star.delay,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                position: 'absolute',
                                left: `${star.left}%`,
                                fontSize: `${star.size}px`,
                                top: -50
                            }}
                            className="text-yellow-400"
                        >
                            ★
                        </motion.div>
                    ))}
                </div>



                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 z-10"
                >
                    <CheckCircle size={50} className="text-white" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="z-10 text-center"
                >
                    <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                    <p className={`text-center mb-8 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your service has been booked successfully.
                        <br />Redirecting to home...
                    </p>
                </motion.div>
            </div>
        );
    }

    // Calculate totals for the sheet - MEMOIZED for performance
    const totals = useMemo(() => {
        const totalMRP = cartItems.reduce((acc, item) => {
            const price = item.originalPrice || item.price;
            return acc + (price * item.quantity);
        }, 0);
        const discount = totalMRP - totalPrice;
        const taxes = totalPrice - (totalPrice / 1.18);
        return {
            itemTotal: totalPrice,
            totalMRP,
            discount,
            couponDiscount: 0,
            taxes,
            grandTotal: totalPrice,
            convenienceFee: 49
        };
    }, [cartItems, totalPrice]);

    return (
        <div className={`min-h-screen pb-24 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 px-4 py-4 flex items-center gap-4 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'} w-full max-w-[500px] left-1/2 -translate-x-1/2`}>
                <button
                    onClick={() => router.back()}
                    className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">Checkout</h1>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Order Summary */}
                <section className={`rounded-2xl p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold flex items-center gap-2">
                            <Wallet size={18} className="text-blue-500" />
                            Order Summary
                        </h2>
                        <button
                            onClick={() => setShowBillDetails(true)}
                            className="text-xs font-bold text-blue-500 hover:underline"
                        >
                            View Details
                        </button>
                    </div>

                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        {item.quantity}x
                                    </div>
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
                                </div>
                                <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className={`h-px my-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total Amount</span>
                            <span className="text-green-500">₹{totalPrice}</span>
                        </div>
                    </div>
                </section>

                {/* Removed Inline Bill Details as per new design using Sheet */}

                {/* Payment Methods - Simplified for Offline */}
                <section className="space-y-3">
                    <h2 className="font-bold ml-1 text-gray-400">Payment Method</h2>

                    <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${darkMode ? 'border-blue-500 bg-blue-500/5' : 'border-blue-500 bg-blue-50'}`}>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Banknote size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">Cash on Service</h3>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay after service is completed</p>
                        </div>
                    </div>
                </section>

                {/* Safety Note */}
                <div className={`p-3 rounded-lg flex items-start gap-3 text-xs ${darkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'}`}>
                    <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                    <p>Safe and secure payments. 100% money back guarantee if service is not delivered.</p>
                </div>
            </div>

            {/* Pay Button */}
            <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 border-t z-50 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <button
                    onClick={handlePayment}
                    disabled={isProcessing || cartItems.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/25'
                        }`}
                >
                    {isProcessing ? 'Processing...' : `Pay ₹${totalPrice}`}
                </button>
            </div>

            <BillDetailsSheet
                isOpen={showBillDetails}
                onClose={() => setShowBillDetails(false)}
                totals={totals}
                items={cartItems.map(item => ({ ...item, id: String(item.id) }))}
                darkMode={darkMode}
            />

            <PaymentFailurePopup
                isOpen={showPaymentFailure}
                onClose={() => setShowPaymentFailure(false)}
                onRetry={() => {
                    setShowPaymentFailure(false);
                    handlePayment();
                }}
                darkMode={darkMode}
            />
        </div>
    );
}

