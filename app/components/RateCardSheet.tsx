'use client';

import React from 'react';
import { X, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from './Branding';
import { Skeleton } from './Skeleton';

interface RateCardSheetProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
    subId?: string | null;
    mainId?: string | null;
    categoryName?: string;
}

const RateCardSheet: React.FC<RateCardSheetProps> = ({ isOpen, onClose, darkMode, subId, mainId, categoryName }) => {
    const [rates, setRates] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchRates = async () => {
            if (!isOpen) return;

            // Normalize and determine targetId
            const sId = (subId && subId !== 'undefined' && subId !== 'null') ? subId : null;
            const mId = (mainId && mainId !== 'undefined' && mainId !== 'null') ? mainId : null;
            const targetId = sId || mId;

            if (!targetId) {
                setRates([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch('https://api.bijliwalaaya.in/api/partner-rate-card', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-token': 'super_secure_token'
                    },
                    body: JSON.stringify({
                        subCategoryId: targetId,
                        mainId: mId || 'ac_naman',
                        docName: categoryName || 'Service'
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => 'No details available');
                    console.error('API Error Response:', response.status, errorText);
                    throw new Error(`Technical Issue (${response.status})`);
                }

                const data = await response.json();
                const rateData = data.data || data;
                setRates(Array.isArray(rateData) ? rateData : []);
            } catch (err: any) {
                console.error('Rate Card Fetch Error:', err);
                setError(err.message);
                setRates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, [isOpen, subId, mainId]);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className={`fixed bottom-0 left-0 right-0 z-[101] mx-auto w-full max-w-[500px] min-[500px]:left-1/2 min-[500px]:-translate-x-1/2 ${darkMode ? 'bg-gray-900 border-t border-white/10' : 'bg-white border-t border-gray-100'
                            } rounded-t-[2.5rem] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-500`}
                    >
                        {/* Watermark Logo Background - Crucial for Brand Protection in Screenshots */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none z-0">
                            <div className="flex flex-col items-center rotate-[-15deg]">
                                <Zap size={400} />
                                <h1 className="text-8xl font-black uppercase tracking-tighter -mt-10">Bijli Wala</h1>
                            </div>
                        </div>

                        {/* Drag Handle */}
                        <div className="flex justify-center pt-4 pb-2 relative z-10">
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-2 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <BrandLogo size="sm" variant="minimal" />
                                <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Standard Rate Card</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-100'
                                    }`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-12 relative z-10">
                            {/* Info Banner */}
                            <div className="mt-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-5 text-gray-900 shadow-lg mb-8 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                                        <ShieldCheck size={28} className="text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg mb-1 tracking-tight">Transparent Pricing</h3>
                                        <p className="text-sm font-medium opacity-90 leading-tight">
                                            All prices are standard and inclusive of taxes. No hidden charges.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rate Table / Loader / Error */}
                            {loading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex justify-between items-center px-4 py-4 border-b border-gray-100 dark:border-white/5">
                                            <div className="flex flex-col gap-2 w-2/3">
                                                <Skeleton variant="text" width="80%" height={16} darkMode={darkMode} />
                                                <Skeleton variant="text" width="30%" height={10} darkMode={darkMode} />
                                            </div>
                                            <Skeleton variant="rectangular" width={60} height={20} borderRadius="6px" darkMode={darkMode} />
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="py-16 text-center bg-red-500/5 rounded-[2.5rem] border border-red-500/10 backdrop-blur-sm">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                        <Zap size={36} className="text-red-500" strokeWidth={3} />
                                    </div>
                                    <p className="text-red-500 font-black text-lg mb-1">Failed to connect</p>
                                    <p className="text-[10px] text-red-400/60 font-black uppercase tracking-[0.2em] mb-8">{error}</p>
                                    <button
                                        onClick={() => { setError(null); setLoading(true); onClose(); }}
                                        className="bg-red-500 text-white px-10 py-4 rounded-[1.5rem] text-xs font-black shadow-xl shadow-red-500/30 active:scale-95 transition-all uppercase tracking-widest"
                                    >
                                        RETRY FETCH
                                    </button>
                                </div>
                            ) : rates.length > 0 ? (
                                <div className={`rounded-[2.5rem] overflow-hidden border ${darkMode ? 'bg-gray-800/50 border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-black/[0.03]'}`}>
                                    <div className="overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className={darkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'}>
                                                <tr>
                                                    <th className="px-4 min-[380px]:px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em]">Service Name</th>
                                                    <th className="px-4 min-[380px]:px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-right">Standard Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                                                {rates.map((item, index) => (
                                                    <tr key={index} className={`transition-all duration-300 group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'}`}>
                                                        <td className="px-4 min-[380px]:px-6 py-5">
                                                            <div className={`text-[14px] min-[380px]:text-[15px] font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} group-hover:text-yellow-500 transition-colors`}>
                                                                {item.service || item.name || item.title}
                                                            </div>
                                                            <div className={`text-[10px] font-black uppercase tracking-tighter mt-1 opacity-50 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {item.type || 'Standard'}
                                                            </div>
                                                        </td>
                                                        <td className={`px-4 min-[380px]:px-6 py-5 text-sm min-[380px]:text-base font-black text-right ${darkMode ? 'text-yellow-400' : 'text-gray-900'}`}>
                                                            {typeof item.price === 'string' && item.price.startsWith('₹') ? item.price : `₹${item.price}`}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 text-center px-8 bg-yellow-400/5 rounded-[3.5rem] border border-dashed border-yellow-400/30 backdrop-blur-sm">
                                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <Zap size={48} className="text-yellow-500 fill-yellow-500" strokeWidth={1} />
                                    </div>
                                    <h4 className={`text-xl font-black mb-4 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Tension Na Lo, Hum Hai Na!
                                    </h4>
                                    <p className={`text-sm font-bold leading-relaxed max-w-[280px] mx-auto opacity-80 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Bhut jald data ayega, hum saari chizen <span className="text-yellow-600 dark:text-yellow-400 font-black underline decoration-yellow-500/30 underline-offset-4">smartly</span> set kar rahe hain taaki aapko best experience mile.
                                    </p>
                                </div>
                            )}

                            {/* Footer Note */}
                            <div className="mt-12 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 opacity-20">
                                    <BrandLogo size="sm" variant="minimal" />
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bijli Wala Aya</span>
                                </div>
                                <p className={`text-[10px] font-black text-center opacity-40 uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    &copy; 2026 VERIFIED &bull; PROTECTED PRICING
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RateCardSheet;
