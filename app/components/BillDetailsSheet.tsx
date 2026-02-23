import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Receipt, Tag, Info, ShoppingBag } from 'lucide-react';

interface BillItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | string;
    quantity: number;
    gst?: number;
    gstType?: string;
    discountValue?: number;
    discountType?: string;
}

interface BillDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    totals: {
        itemTotal: number;
        totalMRP: number;
        taxes: number;
        discount: number;
        couponDiscount: number;
        grandTotal: number;
        gstSummary?: string;
        totalSavings?: number;
        tipAmount?: number;
        taxableSubtotal?: number;
        includedTaxes?: number;
    };
    items: BillItem[];
    darkMode: boolean;
}

const BillDetailsSheet: React.FC<BillDetailsSheetProps> = ({ isOpen, onClose, totals, items, darkMode }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return '₹' + Math.round(amount).toLocaleString('en-IN');
    };

    const parseSafeNumber = (val: any) => {
        if (val === null || val === undefined || val === '') return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    };

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
                        className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                        className={`fixed bottom-0 left-0 right-0 z-[101] rounded-t-[2.5rem] overflow-hidden flex flex-col ${darkMode ? 'bg-[#111827] border-t border-gray-800' : 'bg-white'}`}
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing" onClick={onClose}>
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>

                        {/* Header */}
                        <div className={`px-6 py-4 flex justify-between items-center border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                                    <Receipt size={24} className="text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Bill</h3>
                                    <p className={`text-[10px] uppercase tracking-widest font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Invoice Summary</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2.5 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 scrollbar-hide">

                            {/* Items Breakdown Section */}
                            <div className="space-y-4">
                                <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <ShoppingBag size={14} /> Section 1: Service Items
                                </h4>
                                <div className={`overflow-hidden rounded-2xl border ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <th className="p-3 text-[10px] font-black uppercase text-gray-400">Description</th>
                                                <th className="p-3 text-[10px] font-black uppercase text-gray-400 text-center">Qty</th>
                                                <th className="p-3 text-[10px] font-black uppercase text-gray-400 text-right">Price</th>
                                                <th className="p-3 text-[10px] font-black uppercase text-gray-400 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                            {items.map((item, idx) => {
                                                const mrp = parseSafeNumber(item.originalPrice || item.price);
                                                const sellingPrice = parseSafeNumber(item.price);
                                                return (
                                                    <tr key={item.id} className="text-[12px] align-top">
                                                        <td className="p-3">
                                                            <p className={`font-bold leading-tight ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</p>
                                                            {item.gst !== undefined && item.gst > 0 && (
                                                                <p className={`text-[9px] mt-1 font-medium italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    GST: {item.gst}% {item.gstType?.toLowerCase() === 'exclusive' ? '(Extra)' : '(Incl.)'}
                                                                </p>
                                                            )}
                                                            {mrp > sellingPrice && (
                                                                <p className="text-[10px] mt-1 text-green-500 font-bold">Offer Applied</p>
                                                            )}
                                                        </td>
                                                        <td className={`p-3 text-center font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.quantity}</td>
                                                        <td className="p-3 text-right">
                                                            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-bold`}>{formatCurrency(sellingPrice)}</p>
                                                            {mrp > sellingPrice && (
                                                                <p className="text-[10px] line-through opacity-50">{formatCurrency(mrp)}</p>
                                                            )}
                                                        </td>
                                                        <td className={`p-3 text-right font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(sellingPrice * item.quantity)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Taxes & Fees Section */}
                            <div className="space-y-4">
                                <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <Tag size={14} /> Section 2: Summary & Taxes
                                </h4>
                                <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
                                    <div className="flex justify-between items-center px-1">
                                        <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Net Taxable Subtotal</span>
                                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.taxableSubtotal || totals.itemTotal || 0)}</span>
                                    </div>
                                    <div className="h-px w-full border-t border-dashed border-gray-200 dark:border-gray-800" />

                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-0.5">
                                            <span className={`text-xs font-bold leading-tight ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>GST / Taxes</span>
                                            {totals.includedTaxes && totals.includedTaxes > 0 ? (
                                                <span className={`text-[9px] opacity-70 font-medium italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    (Incl. {formatCurrency(totals.includedTaxes)} in base price)
                                                </span>
                                            ) : (
                                                <span className={`text-[9px] opacity-70 font-medium italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {totals.gstSummary || 'Additional GST Applied'}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.taxes)}</span>
                                    </div>
                                    {parseSafeNumber(totals.tipAmount) > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Technician Tip</span>
                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.tipAmount || 0)}</span>
                                        </div>
                                    )}
                                    <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Conveyance Protection</span>
                                        <span className="text-xs font-black text-green-500">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform Infrastructure</span>
                                        <span className="text-xs font-black text-green-500">FREE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Savings Summary Section */}
                            {(totals.discount > 0 || totals.couponDiscount > 0) && (
                                <div className="space-y-4">
                                    <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-green-600/70' : 'text-green-600/70'}`}>
                                        <CheckCircle size={14} /> Section 3: Your Savings
                                    </h4>
                                    <div className={`p-4 rounded-2xl border border-green-500/20 bg-green-500/5 space-y-3`}>
                                        {totals.discount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-green-600">Service Discount</span>
                                                <span className="text-xs font-black text-green-600">-{formatCurrency(totals.discount)}</span>
                                            </div>
                                        )}
                                        {totals.couponDiscount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-green-600">Coupon Code Savings</span>
                                                <span className="text-xs font-black text-green-600">-{formatCurrency(totals.couponDiscount)}</span>
                                            </div>
                                        )}
                                        <div className={`p-3 rounded-xl text-center text-[11px] font-black border border-green-500/30 ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                                            TOTAL SAVINGS: {formatCurrency(totals.totalSavings || (totals.discount + totals.couponDiscount))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Compliance Info */}
                            <div className={`flex items-start gap-3 p-4 rounded-2xl border ${darkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-100 bg-gray-50'}`}>
                                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className={`text-[10px] leading-relaxed ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    This is a system-generated preliminary bill.
                                    Prices include GST based on service category.
                                    Final invoice will be generated after service completion by our professional.
                                </p>
                            </div>
                        </div>

                        {/* Grand Total Bar */}
                        <div className={`p-6 border-t ${darkMode ? 'border-gray-800 bg-[#1f2937]' : 'border-gray-100 bg-gray-50'} safe-bottom`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={`text-[10px] uppercase tracking-tighter font-black ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Net Payable Amount</p>
                                    <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.grandTotal)}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-black text-sm transition-transform active:scale-95 shadow-xl"
                                >
                                    DONE
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BillDetailsSheet;
