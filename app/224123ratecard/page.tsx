'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Zap, Plus, Trash2, Save, ChevronDown, ChevronRight,
    ShieldCheck, Percent, IndianRupee, Clock, ArrowLeft,
    CheckCircle2, AlertCircle, Info, Image as ImageIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../components/Branding';
import { useRouter } from 'next/navigation';

interface SparePart {
    docId: string;
    partName: string;
    partPrice: number;
    gstPercent: number;
    gstType: 'Include GST' | 'Exclude GST';
    gstValue: number;
    finalPrice: number;
    warrantyDays: string;
    hasWarranty: boolean;
}

interface Subcategory {
    docId: string;
    docName: string;
    spareParts: Record<string, SparePart>;
}

interface RateCardData {
    _id: string;
    docId: string;
    docName: string;
    spareParts: Record<string, SparePart>;
    subcategory: Record<string, Subcategory>;
}

const API_BASE = 'https://api.bijliwalaaya.in';
const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'x-api-token': 'super_secure_token'
};

export default function RateCardDataEntryPage() {
    const router = useRouter();
    const mainId = 'ac_naman'; // Source of truth ID
    const [data, setData] = useState<RateCardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSubId, setActiveSubId] = useState<string | null>(null);
    const [entryMode, setEntryMode] = useState<'main' | 'sub'>('main');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/partner-rate-card/${mainId}`, {
                    headers: AUTH_HEADERS
                });
                const result = await res.json();
                if (result.success && result.data) {
                    setData(result.data);
                }
            } catch (err) {
                console.error('Fetch Error:', err);
                setMessage({ type: 'error', text: 'Failed to load data from server' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Form states for new spare part
    const [newPart, setNewPart] = useState<Partial<SparePart>>({
        partName: '',
        partPrice: 0,
        gstPercent: 18,
        gstType: 'Include GST',
        warrantyDays: '90',
        hasWarranty: true
    });

    // Auto-calculate GST and Final Price
    const calculations = useMemo(() => {
        const price = Number(newPart.partPrice) || 0;
        const percent = Number(newPart.gstPercent) || 0;
        let gstValue = 0;
        let finalPrice = 0;

        if (newPart.gstType === 'Include GST') {
            finalPrice = price;
            gstValue = Number((price - (price / (1 + percent / 100))).toFixed(2));
        } else {
            gstValue = Number((price * (percent / 100)).toFixed(2));
            finalPrice = price + gstValue;
        }

        return { gstValue, finalPrice };
    }, [newPart.partPrice, newPart.gstPercent, newPart.gstType]);

    const addSubcategory = async (id: string, name: string) => {
        const subId = id.toLowerCase().replace(/\s+/g, '_');
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/partner-rate-card/${mainId}/sub`, {
                method: 'POST',
                headers: AUTH_HEADERS,
                body: JSON.stringify({ subId, docName: name })
            });
            const result = await res.json();
            if (result.success) {
                setData(prev => prev ? ({
                    ...prev,
                    subcategory: {
                        ...prev.subcategory,
                        [subId]: result.data
                    }
                }) : null);
                setActiveSubId(subId);
                setEntryMode('sub');
                setMessage({ type: 'success', text: 'Subcategory added!' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to add subcategory' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const deleteSubcategory = async (subId: string) => {
        if (!confirm(`Delete subcategory "${subId}"?`)) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/partner-rate-card/${mainId}/sub/${subId}`, {
                method: 'DELETE',
                headers: AUTH_HEADERS
            });
            const result = await res.json();
            if (result.success) {
                setData(prev => {
                    if (!prev) return null;
                    const newData = { ...prev };
                    delete newData.subcategory[subId];
                    return newData;
                });
                if (activeSubId === subId) {
                    setActiveSubId(null);
                    setEntryMode('main');
                }
                setMessage({ type: 'success', text: 'Subcategory deleted!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const addSparePart = async () => {
        if (entryMode === 'sub' && !activeSubId) {
            setMessage({ type: 'error', text: 'Select a subcategory first!' });
            return;
        }
        if (!newPart.partName) return;

        const partId = newPart.partName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        const part: SparePart = {
            docId: partId,
            partName: newPart.partName,
            partPrice: Number(newPart.partPrice) || 0,
            gstPercent: Number(newPart.gstPercent) || 0,
            gstType: newPart.gstType as any,
            gstValue: calculations.gstValue,
            finalPrice: calculations.finalPrice,
            warrantyDays: newPart.warrantyDays || '90',
            hasWarranty: !!newPart.hasWarranty
        };

        setIsSaving(true);
        try {
            const url = entryMode === 'main'
                ? `${API_BASE}/api/partner-rate-card/${mainId}/spare-parts`
                : `${API_BASE}/api/partner-rate-card/${mainId}/sub/${activeSubId}/spare-part`;

            const res = await fetch(url, {
                method: 'POST',
                headers: AUTH_HEADERS,
                body: JSON.stringify(part)
            });
            const result = await res.json();

            if (result.success) {
                setData(prev => {
                    if (!prev) return null;
                    if (entryMode === 'main') {
                        return { ...prev, spareParts: { ...prev.spareParts, [partId]: result.data } };
                    } else {
                        return {
                            ...prev,
                            subcategory: {
                                ...prev.subcategory,
                                [activeSubId!]: {
                                    ...prev.subcategory[activeSubId!],
                                    spareParts: { ...prev.subcategory[activeSubId!].spareParts, [partId]: result.data }
                                }
                            }
                        };
                    }
                });
                setNewPart({ partName: '', partPrice: 0, gstPercent: 18, gstType: 'Include GST', warrantyDays: '90', hasWarranty: true });
                setMessage({ type: 'success', text: 'Part synced successfully!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to sync part' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const deletePart = async (target: string | 'main', partId: string) => {
        if (!confirm('Delete this part?')) return;
        setIsSaving(true);
        try {
            const url = target === 'main'
                ? `${API_BASE}/api/partner-rate-card/${mainId}/spare-parts/${partId}`
                : `${API_BASE}/api/partner-rate-card/${mainId}/sub/${target}/spare-parts/${partId}`;

            const res = await fetch(url, { method: 'DELETE', headers: AUTH_HEADERS });
            const result = await res.json();

            if (result.success) {
                setData(prev => {
                    if (!prev) return null;
                    const newData = { ...prev };
                    if (target === 'main') {
                        delete newData.spareParts[partId];
                    } else {
                        delete newData.subcategory[target].spareParts[partId];
                    }
                    return newData;
                });
                setMessage({ type: 'success', text: 'Part deleted!' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Delete failed' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-yellow-200 overflow-x-hidden relative">

            <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
                <div className="rotate-[-25deg] scale-150 flex flex-col items-center">
                    <img src="/bijli_logo.png" alt="Watermark" className="w-[800px] h-auto grayscale opacity-50" />
                    <h1 className="text-[12rem] font-black uppercase tracking-tighter -mt-20">Bijli Wala</h1>
                </div>
            </div>

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <BrandLogo size="sm" variant="minimal" />
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-none italic">224123<span className="text-yellow-500 underline decoration-2 underline-offset-4">RATECARD</span></h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live Management Portal</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isSaving && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-xl text-[10px] font-black text-yellow-600 animate-pulse">
                            <Zap size={14} className="animate-spin" /> SYNCING...
                        </div>
                    )}
                </div>
            </header>

            {isLoading ? (
                <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Fetching Rate Card...</p>
                </div>
            ) : (
                <main className="max-w-6xl mx-auto px-6 py-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-black/[0.02] border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Navigation</h3>
                                <button
                                    onClick={() => {
                                        const name = prompt('Subcategory Name?');
                                        if (name) addSubcategory(name, name);
                                    }}
                                    disabled={isSaving}
                                    title="Add Subcategory"
                                    className="p-2 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20 disabled:opacity-50"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setEntryMode('main'); setActiveSubId(null); }}
                                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border-2 ${entryMode === 'main'
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-xl'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <Zap size={16} className={entryMode === 'main' ? 'text-yellow-400' : 'text-gray-300'} />
                                    <span className="text-sm font-black uppercase">{data?.docName || 'MAIN'}</span>
                                    {entryMode === 'main' && <CheckCircle2 size={12} className="ml-auto text-yellow-400" />}
                                </button>

                                <div className="pl-6 space-y-2 relative mt-4">
                                    <div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 to-transparent rounded-full" />
                                    {Object.values(data?.subcategory || {}).map((sub) => (
                                        <div key={sub.docId} className="group relative">
                                            <button
                                                onClick={() => { setActiveSubId(sub.docId); setEntryMode('sub'); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${entryMode === 'sub' && activeSubId === sub.docId
                                                    ? 'bg-yellow-50 border-2 border-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/10'
                                                    : 'bg-white border border-gray-100 text-gray-500 hover:border-yellow-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ChevronRight size={14} className={activeSubId === sub.docId ? 'text-yellow-600' : 'text-gray-300'} />
                                                    <span className="text-xs font-black uppercase">{sub.docName}</span>
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${activeSubId === sub.docId ? 'bg-yellow-200' : 'bg-gray-100'}`}>
                                                    {Object.keys(sub.spareParts || {}).length}
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteSubcategory(sub.docId); }}
                                                className="absolute -right-2 -top-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                                            >
                                                <X size={10} strokeWidth={4} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <Zap className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-2">Inventory Stats</h4>
                            <div className="flex items-end gap-3">
                                <div className="text-4xl font-black italic">
                                    {(Object.values(data?.subcategory || {}).reduce((acc, curr) => acc + Object.keys(curr.spareParts || {}).length, 0)) + Object.keys(data?.spareParts || {}).length}
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase">Total Items</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-black/[0.03] border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h2 className="text-xl font-black italic mb-8 flex flex-col gap-1">
                                <div className="flex items-center gap-3 uppercase">
                                    <Plus className="text-yellow-500" />
                                    Entry in: <span className="text-yellow-500 underline underline-offset-4 decoration-2">
                                        {entryMode === 'main' ? (data?.docName || 'MAIN') : data?.subcategory[activeSubId!]?.docName}
                                    </span>
                                </div>
                                <div className="ml-8 mt-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${entryMode === 'main' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                        {entryMode === 'main' ? 'Direct Main Category Level' : 'Specific Subcategory Level'}
                                    </span>
                                </div>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Part Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. AC Capacitor Dual"
                                        value={newPart.partName}
                                        onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newPart.partPrice || ''}
                                        onChange={(e) => setNewPart({ ...newPart, partPrice: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST Percentage (%)</label>
                                    <select
                                        value={newPart.gstPercent}
                                        onChange={(e) => setNewPart({ ...newPart, gstPercent: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all appearance-none"
                                    >
                                        {[5, 12, 18, 28].map(v => <option key={v} value={v}>{v}%</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST Type</label>
                                    <div className="flex gap-2">
                                        {['Include GST', 'Exclude GST'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setNewPart({ ...newPart, gstType: type as any })}
                                                className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${newPart.gstType === type
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Warranty (Days)</label>
                                    <input
                                        type="text"
                                        placeholder="90"
                                        value={newPart.warrantyDays}
                                        onChange={(e) => setNewPart({ ...newPart, warrantyDays: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-4 pt-6">
                                    <button
                                        onClick={() => setNewPart({ ...newPart, hasWarranty: !newPart.hasWarranty })}
                                        className={`w-14 h-8 rounded-full transition-all relative ${newPart.hasWarranty ? 'bg-yellow-400 shadow-md' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${newPart.hasWarranty ? 'left-7' : 'left-1'}`} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Apply Warranty</span>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-wrap gap-10 items-center justify-between">
                                <div className="flex gap-10">
                                    <div className="space-y-1 text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">GST</p>
                                        <p className="text-lg font-black text-gray-900 italic">₹{calculations.gstValue}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">FINAL PRICE</p>
                                        <p className="text-3xl font-black text-yellow-500 italic flex items-center gap-1">
                                            <IndianRupee size={22} strokeWidth={3} /> {calculations.finalPrice}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={addSparePart}
                                    disabled={isSaving}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-10 py-5 rounded-[1.5rem] font-black text-sm shadow-xl shadow-yellow-400/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? <Zap size={18} className="animate-spin text-yellow-900" /> : <CheckCircle2 size={18} />}
                                    {isSaving ? 'SYNCING...' : 'CONFIRM ADD'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 italic">
                                    Inventory: {entryMode === 'main' ? (data?.docName || 'MAIN') : data?.subcategory[activeSubId!]?.docName}
                                </h3>
                                <div className="h-px flex-1 bg-gray-100 mx-6" />
                            </div>

                            {(() => {
                                const parts = entryMode === 'main'
                                    ? Object.values(data?.spareParts || {})
                                    : Object.values(data?.subcategory[activeSubId!]?.spareParts || {});

                                if (parts.length === 0) return (
                                    <div className="py-24 text-center border-4 border-dashed border-gray-100 rounded-[3rem] bg-white/50">
                                        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                            <Info size={32} className="text-gray-300" />
                                        </div>
                                        <h4 className="text-lg font-black text-gray-300 uppercase italic">no any dta</h4>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-10">Portal is connected. Add items to sync with live database.</p>
                                    </div>
                                );

                                return (
                                    <div className="grid grid-cols-1 gap-4">
                                        {parts.map((part) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={part.docId}
                                                className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-2xl hover:border-yellow-100 transition-all"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-300 group-hover:bg-yellow-400 group-hover:text-gray-900 transition-all rotate-3 group-hover:rotate-0">
                                                        <ShieldCheck size={28} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-800 text-lg group-hover:text-yellow-600 transition-colors uppercase italic">{part.partName}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                                                                {part.gstType} ({part.gstPercent}%)
                                                            </span>
                                                            {part.hasWarranty && (
                                                                <span className="text-[9px] font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full text-green-600 flex items-center gap-1.5">
                                                                    <Clock size={10} /> {part.warrantyDays} Days Warranty
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-10">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</p>
                                                        <p className="text-2xl font-black text-gray-900 italic">₹{part.finalPrice}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => deletePart(entryMode === 'main' ? 'main' : activeSubId!, part.docId)}
                                                        className="p-5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all"
                                                    >
                                                        <Trash2 size={24} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </main>
            )}

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border-2 ${message.type === 'success' ? 'bg-gray-900 border-yellow-400 text-white' : 'bg-red-600 border-red-500 text-white'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 className="text-yellow-400" /> : <AlertCircle />}
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
