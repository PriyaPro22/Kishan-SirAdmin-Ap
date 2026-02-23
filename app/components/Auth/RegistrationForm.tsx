import React, { useState, useEffect } from 'react';
import { User, Upload, Check, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegistrationFormProps {
    phone: string;
    location: string;
    onSubmit: (formData: FormData, phone: string) => Promise<void>;
    darkMode: boolean;
}

export default function RegistrationForm({ phone, location, onSubmit, darkMode }: RegistrationFormProps) {
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('regDraft');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setFullName(draft.fullName || '');
            } catch (e) {
                console.error("Error parsing draft", e);
            }
        }
    }, []);

    // Save draft on change
    useEffect(() => {
        const draft = { fullName };
        localStorage.setItem('regDraft', JSON.stringify(draft));
    }, [fullName]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Compress before upload
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;
                    const maxSize = 400;

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
                    setPreview(compressedBase64);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            // API expects: name, location, photoUrl
            formData.append('name', fullName);
            formData.append('location', location);

            // Add compressed image if uploaded  
            if (preview) {
                formData.append('photoUrl', preview);
                console.log('📸 Sending image to database (length:', preview.length, ')');
            } else {
                formData.append('photoUrl', '');
                console.log('⚠️ No image uploaded');
            }

            await onSubmit(formData, phone);

            // Clear draft on success
            localStorage.removeItem('regDraft');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative rounded-3xl p-8 shadow-2xl border backdrop-blur-xl overflow-hidden ${darkMode ? 'bg-[#1a1f2e]/80 border-white/10' : 'bg-white/80 border-white/40'
            }`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFC42E] to-[#FFD700]" />

            <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Finish Setting Up
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Complete your profile to get started
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Profile Image */}
                <div className="flex justify-center mb-8">
                    <div className="relative group">
                        <div className={`w-28 h-28 rounded-full overflow-hidden border-4 shadow-xl ${darkMode ? 'border-[#FFC42E]/20 bg-white/5' : 'border-white bg-gray-50'}`}>
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} className={darkMode ? 'text-white/20' : 'text-gray-300'} />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#FFC42E] flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#FFD700] transition-transform hover:scale-110 active:scale-95">
                            <Upload size={18} className="text-gray-900" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Full Name */}
                    <div>
                        <label className={`block text-xs font-semibold mb-2 ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            FULL NAME *
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3.5 rounded-xl outline-none transition-all ${darkMode
                                ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#FFC42E]/50'
                                : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#FFC42E]/50 border border-gray-200'
                                }`}
                        />
                    </div>

                    {/* Location (Read-only, Auto-filled) */}
                    <div>
                        <label className={`block text-xs font-semibold mb-2 ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            LOCATION (AUTO-DETECTED)
                        </label>
                        <div className={`flex items-center px-4 py-3.5 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50 border border-gray-200'}`}>
                            <MapPin size={18} className="text-[#FFC42E] mr-2" />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {location || 'Detecting location...'}
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading || !fullName.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FFC42E] to-[#FFD700] text-gray-900 font-bold text-lg shadow-[0_4px_20px_rgb(255,196,46,0.3)] hover:shadow-[0_6px_25px_rgb(255,196,46,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Check size={20} />
                            <span>Complete Registration</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
