"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User, Mail, Calendar, Save, Loader2, Shield } from 'lucide-react';
import axios from 'axios';

interface EditProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    userData: any;
    darkMode: boolean;
    onUpdateSuccess?: (updatedUser: any) => void;
}

export default function EditProfileSheet({
    isOpen,
    onClose,
    userData,
    darkMode,
    onUpdateSuccess
}: EditProfileSheetProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        phoneNumber: '',
        photoUrl: ''
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                dob: userData.dob || '',
                phoneNumber: userData.phoneNumber || '',
                photoUrl: userData.photoUrl || ''
            });
            setImagePreview(userData.photoUrl || '');
        }
    }, [userData, isOpen]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxSize = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setImagePreview(compressedBase64);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            setProfileImage(compressedFile);
                        }
                    }, 'image/jpeg', 0.7);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const uid = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            if (!uid) {
                alert('User ID not found. Please login again.');
                return;
            }

            const updateForm = new FormData();
            updateForm.append('name', formData.name);
            updateForm.append('email', formData.email);
            if (formData.dob) updateForm.append('dob', formData.dob);

            if (profileImage) {
                updateForm.append('photoUrl', profileImage);
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            const response = await axios.patch(
                `${baseUrl}/api/auth/update-user/${uid}`,
                updateForm,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'multipart/form-data',
                        'x-api-token': apiToken
                    }
                }
            );

            if (response.data.success) {
                const updatedUser = {
                    ...userData,
                    ...response.data.user,
                    name: formData.name,
                    email: formData.email,
                    dob: formData.dob
                };
                if (onUpdateSuccess) {
                    onUpdateSuccess(updatedUser);
                }
                onClose();
            }
        } catch (error) {
            console.error("Profile update failed", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
                    />
                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed bottom-0 left-0 right-0 z-[151] rounded-t-[2.5rem] p-6 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-[#151C2F]' : 'bg-white'
                            }`}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-2 pb-4">
                            <div className={`w-12 h-1.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#111827]'}`}>Edit Profile</h2>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Setup your personal identity</p>
                            </div>
                            <button
                                onClick={onClose}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Profile Image Upload */}
                            <div className="flex flex-col items-center mb-4">
                                <div className="relative group">
                                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-2xl transition-transform group-hover:scale-[1.02] ${darkMode ? 'border-[#FFC42E]/20' : 'border-white'
                                        }`}>
                                        <img
                                            src={imagePreview || 'https://via.placeholder.com/150'}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <label className="absolute bottom-1 right-1 w-11 h-11 bg-[#FFC42E] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#FFD700] transition-all hover:scale-110 active:scale-95 border-4 border-white dark:border-[#151C2F]">
                                        <Camera size={20} className="text-black" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <p className={`text-xs font-bold mt-4 uppercase tracking-tighter ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Tap camera to change photo
                                </p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</label>
                                    <div className={`flex items-center px-4 py-4 rounded-2xl border-2 transition-all ${darkMode ? 'bg-white/5 border-white/5 focus-within:border-[#FFC42E]/50' : 'bg-gray-50 border-gray-100 focus-within:border-[#FFC42E]'
                                        }`}>
                                        <User size={18} className="text-gray-400 mr-3 shrink-0" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 w-full text-sm font-bold ${darkMode ? 'text-white' : 'text-[#111827]'}`}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                {/* Mobile (Read Only) */}
                                <div>
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Mobile Number</label>
                                    <div className={`flex items-center px-4 py-4 rounded-2xl border-2 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                                        } opacity-60`}>
                                        <Phone size={18} className="text-gray-400 mr-3 shrink-0" />
                                        <input
                                            type="text"
                                            value={formData.phoneNumber}
                                            readOnly
                                            className={`bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 w-full text-sm font-bold ${darkMode ? 'text-white' : 'text-[#111827]'}`}
                                        />
                                        <Shield size={16} className="text-green-500 ml-2" />
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-500 mt-2 px-1">🔒 Verified unique identifier</p>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Email Address</label>
                                    <div className={`flex items-center px-4 py-4 rounded-2xl border-2 transition-all ${darkMode ? 'bg-white/5 border-white/5 focus-within:border-[#FFC42E]/50' : 'bg-gray-50 border-gray-100 focus-within:border-[#FFC42E]'
                                        }`}>
                                        <Mail size={18} className="text-gray-400 mr-3 shrink-0" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 w-full text-sm font-bold ${darkMode ? 'text-white' : 'text-[#111827]'}`}
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>

                                {/* DOB */}
                                <div>
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Date of Birth</label>
                                    <div className={`flex items-center px-4 py-4 rounded-2xl border-2 transition-all ${darkMode ? 'bg-white/5 border-white/5 focus-within:border-[#FFC42E]/50' : 'bg-gray-50 border-gray-100 focus-within:border-[#FFC42E]'
                                        }`}>
                                        <Calendar size={18} className="text-gray-400 mr-3 shrink-0" />
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className={`bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 w-full text-sm font-bold ${darkMode ? 'text-white' : 'text-[#111827]'} [color-scheme:light] dark:[color-scheme:dark]`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className="w-full mt-4 py-5 rounded-2xl bg-[#FFC42E] hover:bg-[#EAB308] text-[#111827] font-black text-base shadow-xl shadow-yellow-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                SAVE CHANGES
                            </button>

                            {/* Spacer for bottom safe area/nav */}
                            <div className="h-10" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Internal icons needed
const Phone = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
