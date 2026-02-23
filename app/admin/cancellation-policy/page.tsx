"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    ShieldCheck,
    AlertCircle,
    Loader2,
    ChevronRight,
    FileText,
    Save,
    Trash
} from 'lucide-react';
import axios from 'axios';
import { useApp } from '../../context/AppContext';

interface Policy {
    _id: string;
    title: string;
    description: string;
    createdAt?: string;
}

export default function CancellationPolicyAdmin() {
    const { darkMode } = useApp();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const [newPolicy, setNewPolicy] = useState({
        title: '',
        description: ''
    });

    const API_BASE = 'https://api.bijliwalaaya.in/api/cancellation-policy';
    const AUTH_HEADERS = {
        'x-api-token': 'super_secure_token'
    };

    // Fetch Policies
    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_BASE, { headers: AUTH_HEADERS });

            let data = response.data;
            if (data && data.success && data.data) {
                data = data.data;
            } else if (data && data.data && Array.isArray(data.data)) {
                data = data.data;
            }

            if (Array.isArray(data)) {
                setPolicies([...data].reverse()); // Show latest first
            } else if (data && typeof data === 'object') {
                setPolicies([data as Policy]);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // Handle Create
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPolicy.title.trim() || !newPolicy.description.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await axios.post(API_BASE, newPolicy, { headers: AUTH_HEADERS });
            if (response.data) {
                setNewPolicy({ title: '', description: '' });
                fetchPolicies();
            }
        } catch (error) {
            console.error("Create Error:", error);
            alert("Failed to create policy. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this policy?")) return;

        try {
            setIsDeleting(id);
            await axios.delete(`${API_BASE}/${id}`, { headers: AUTH_HEADERS });
            setPolicies(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Failed to delete. Check console.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className={`min-h-screen p-6 sm:p-12 ${darkMode ? 'bg-[#0F172A] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Policy Management</h1>
                            <p className={`text-sm font-medium opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Manage Cancellation & Refund Policies
                            </p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${darkMode ? 'bg-white/5 border-white/10 text-yellow-500' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                        Admin Access Verified
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Create Section */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-6 rounded-3xl border shadow-xl sticky top-8 ${darkMode ? 'bg-gray-800/50 border-white/5' : 'bg-white border-gray-100'}`}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                    <Plus size={20} />
                                </div>
                                <h2 className="text-xl font-bold">Add New Policy</h2>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-5">
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 opacity-60`}>Policy Title</label>
                                    <input
                                        type="text"
                                        value={newPolicy.title}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g. Standard Cancellation"
                                        className={`w-full p-4 rounded-xl border text-sm font-medium transition-all focus:ring-2 focus:ring-yellow-500/50 outline-none ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 opacity-60`}>Description</label>
                                    <textarea
                                        value={newPolicy.description}
                                        onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the rules, timings and refund amounts..."
                                        rows={8}
                                        className={`w-full p-4 rounded-xl border text-sm font-medium transition-all focus:ring-2 focus:ring-yellow-500/50 outline-none resize-none ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                            PUBLISH POLICY
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Existing Policies
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                    {policies.length}
                                </span>
                            </h2>
                            <button
                                onClick={fetchPolicies}
                                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className={`h-32 rounded-3xl animate-pulse ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                                ))
                            ) : policies.length === 0 ? (
                                <div className={`p-12 rounded-3xl border border-dashed flex flex-col items-center text-center ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                                    <FileText className="text-gray-400 mb-4" size={48} />
                                    <p className="text-sm font-medium opacity-60">No policies found. Start by creating one.</p>
                                </div>
                            ) : (
                                policies.map((policy, idx) => (
                                    <motion.div
                                        key={policy._id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`group relative p-6 rounded-3xl border transition-all hover:shadow-2xl ${darkMode ? 'bg-gray-800/40 border-white/5 hover:bg-gray-800/60' : 'bg-white border-gray-100 hover:border-yellow-200'}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                                                        <FileText size={16} />
                                                    </div>
                                                    <h3 className="font-bold text-lg">{policy.title}</h3>
                                                </div>
                                                <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {policy.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        ID: {policy._id?.slice(-8) || 'Local'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(policy._id)}
                                                disabled={isDeleting === policy._id}
                                                className={`p-3 rounded-xl transition-all ${darkMode ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                                            >
                                                {isDeleting === policy._id ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Styles */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap');
        
        body {
          font-family: 'Manrope', sans-serif;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}

// Simple icons not in lucide
const Clock = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);
