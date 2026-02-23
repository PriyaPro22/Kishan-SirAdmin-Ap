import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, CheckCircle, Info, Loader2 } from 'lucide-react';

interface OffersSheetProps {
    isOpen: boolean;
    onClose: () => void;
    offers: any[];
    onApply: (code: string) => void;
    darkMode: boolean;
    isApplying: boolean;
    appliedOfferId?: string;
}

const OffersSheet: React.FC<OffersSheetProps> = ({ isOpen, onClose, offers, onApply, darkMode, isApplying, appliedOfferId }) => {
    if (!isOpen) return null;

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
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl overflow-hidden flex flex-col ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white'}`}
                        style={{ maxHeight: '85vh' }}
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-6 flex items-center justify-center pt-2" onClick={onClose}>
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>

                        {/* Header */}
                        <div className={`px-5 py-3 flex justify-between items-center border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                            <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                <Tag size={20} className="text-yellow-500" />
                                Available Offers
                            </h3>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4 overflow-y-auto pb-10">
                            {offers.length === 0 ? (
                                <div className="py-10 text-center">
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No offers available at the moment.</p>
                                </div>
                            ) : (
                                offers.map((offer) => {
                                    const isApplied = appliedOfferId === offer._id;
                                    const discountValue = offer.discountType?.discountValue || 0;
                                    const discountType = offer.discountType?.type || 'FLAT';

                                    return (
                                        <div
                                            key={offer._id}
                                            className={`p-4 rounded-2xl border-2 transition-all ${isApplied
                                                ? 'border-green-500 bg-green-500/5'
                                                : (darkMode ? 'border-gray-800 bg-gray-800/50 hover:border-gray-700' : 'border-gray-100 bg-gray-50 hover:border-gray-200')
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'bg-yellow-500/20 text-yellow-500' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {discountType === 'PERCENTAGE' || discountType === 'PERCENT' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}
                                                    </span>
                                                    <h4 className={`text-base font-bold mt-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{offer.title}</h4>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg border-2 border-dashed font-mono font-bold text-sm ${darkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}>
                                                    {offer.promocode}
                                                </div>
                                            </div>

                                            <p className={`text-xs mb-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {offer.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-600/20">
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                    <Info size={12} />
                                                    <span>Min. spend ₹{offer.min_spend || 0}</span>
                                                </div>

                                                <button
                                                    onClick={() => !isApplied && onApply(offer.promocode)}
                                                    disabled={isApplying || isApplied}
                                                    className={`px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${isApplied
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                        : 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg shadow-yellow-500/10'
                                                        } disabled:opacity-70 flex items-center gap-2`}
                                                >
                                                    {isApplying ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" />
                                                            Checking...
                                                        </>
                                                    ) : isApplied ? (
                                                        <>
                                                            <CheckCircle size={14} />
                                                            Applied
                                                        </>
                                                    ) : 'TAP TO APPLY'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OffersSheet;
