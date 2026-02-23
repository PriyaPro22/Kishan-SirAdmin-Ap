import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, Zap, Lock } from 'lucide-react';

interface PaymentModeSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (mode: 'ADVANCE' | 'CASH') => void;
    totals: {
        grandTotal: number;
    };
    advancePercentage?: number;
    darkMode: boolean;
    appliedOffer?: any;
}

const PaymentModeSheet: React.FC<PaymentModeSheetProps> = ({
    isOpen,
    onClose,
    onConfirm,
    totals,
    advancePercentage = 0,
    darkMode,
    appliedOffer,
}) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return '₹' + Math.round(amount).toLocaleString('en-IN');
    };

    const advanceAmount = Math.round((totals.grandTotal * advancePercentage) / 100);
    const pendingAmount = totals.grandTotal - advanceAmount;

    // Check for payment mode restrictions
    const isFullMandatory = appliedOffer &&
        appliedOffer.payment_via?.includes('ONLINE') &&
        !appliedOffer.payment_via?.includes('CASH');

    const isAdvanceMandatory = advancePercentage > 0;

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
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white'}`}
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-6 flex items-center justify-center pt-2" onClick={onClose}>
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>

                        {/* Header */}
                        <div className={`px-5 py-4 flex justify-between items-center border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                            <div>
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Select Payment Mode
                                </h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Choose how you want to pay
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4 pb-8 overflow-y-auto max-h-[75vh]">

                            {/* Option 1: Pay Advance (Conditional) */}
                            {advancePercentage > 0 && (
                                <button
                                    onClick={() => onConfirm('ADVANCE')}
                                    className={`w-full text-left p-4 rounded-xl border relative overflow-hidden transition-all active:scale-[0.98] ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-yellow-500/50' : 'bg-white border-gray-200 hover:border-yellow-500 shadow-sm'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                                            <Zap size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pay Advance ({advancePercentage}%)</h4>
                                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(advanceAmount)}</span>
                                            </div>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Rest {formatCurrency(pendingAmount)} after service completion
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {/* Option 2: Pay After Service (Cash/UPI) */}
                            <button
                                onClick={() => !isFullMandatory && !isAdvanceMandatory && onConfirm('CASH')}
                                disabled={isFullMandatory || isAdvanceMandatory}
                                className={`w-full text-left p-4 rounded-xl border relative overflow-hidden transition-all active:scale-[0.98] ${(isFullMandatory || isAdvanceMandatory) ? 'opacity-40 grayscale-[0.5] cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-500 shadow-sm'}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <Banknote size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{advancePercentage > 0 ? 'Pay Remaining on Service' : 'Pay After Service (Cash)'}</h4>
                                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.grandTotal)}</span>
                                        </div>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay via Cash or UPI after service is done</p>
                                        {isFullMandatory && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-yellow-600 font-bold">
                                                <Lock size={10} />
                                                LOCKED BY OFFER
                                            </div>
                                        )}
                                        {!isFullMandatory && isAdvanceMandatory && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-500 font-bold uppercase tracking-tight">
                                                <Lock size={10} />
                                                Advance Required for this Service
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>

                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                100% Safe & Secure Bookings
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PaymentModeSheet;
