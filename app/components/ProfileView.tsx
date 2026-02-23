import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronRight, Phone, CreditCard, Heart, HelpCircle, X, Save, Calendar, Mail, Loader2, Camera, Shield, Trash2, Monitor, Smartphone, Laptop, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import EditProfileSheet from './EditProfileSheet';

interface ProfileViewProps {
    userData: any;
    darkMode: boolean;
    onLoginClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ userData, darkMode, onLoginClick }) => {
    const router = useRouter();
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    // Edit Form State
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    }, [userData]);


    const handleLogout = async () => {
        try {
            const uid = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            const deviceId = localStorage.getItem('fcm_device_id');

            if (uid && authToken) {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
                const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

                // 1. Call dedicated remove-fcm endpoint
                try {
                    await axios.post(
                        `${baseUrl}/api/auth/user/remove-fcm/${uid}`,
                        { deviceId: deviceId },
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'x-api-token': apiToken
                            }
                        }
                    );
                    console.log(`✅ [LOGOUT] Token removed for device: ${deviceId}`);
                } catch (removeErr) {
                    console.error("❌ [LOGOUT] Failed to remove FCM token:", removeErr);
                }
            }
        } catch (error) {
            console.error("❌ [LOGOUT] Failed during FCM cleanup:", error);
        }

        localStorage.clear();
        sessionStorage.clear();
        // window.location.reload(); // REMOVED
        window.dispatchEvent(new Event('userLoggedOut'));
    };

    const handleDeleteAccount = async () => {
        try {
            const uid = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');

            if (!uid) {
                alert('User ID not found. Please login again.');
                return;
            }

            // Confirm deletion
            const confirmed = window.confirm(
                '⚠️ Are you sure you want to delete your account?\n\nThis action cannot be undone. All your data will be permanently deleted.'
            );

            if (!confirmed) return;

            setLoading(true);

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            // API: DELETE /api/auth/user/:uid
            await axios.delete(
                `${baseUrl}/api/auth/user/${uid}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'x-api-token': apiToken
                    }
                }
            );

            // Clear all data and redirect
            localStorage.clear();
            sessionStorage.clear();
            alert('✅ Account deleted successfully');
            // window.location.href = '/'; // REMOVED
            window.dispatchEvent(new Event('userLoggedOut'));
        } catch (error) {
            console.error('Delete account failed:', error);
            alert('Failed to delete account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeDevice = async (deviceId: string) => {
        if (!window.confirm('Are you sure you want to log out from this device?')) return;

        setLoading(true);
        try {
            const uid = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            await axios.post(
                `${baseUrl}/api/auth/user/remove-fcm/${uid}`,
                { deviceId },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'x-api-token': apiToken
                    }
                }
            );

            // Update local state and storage
            const updatedFcmTokens = (userData.fcmToken || []).filter((t: any) => t.deviceId !== deviceId);
            const updatedUser = { ...userData, fcmToken: updatedFcmTokens };
            localStorage.setItem('userData', JSON.stringify(updatedUser));

            // If it's the current device, we should probably log out locally too
            const currentDeviceId = localStorage.getItem('fcm_device_id');
            if (deviceId === currentDeviceId) {
                handleLogout();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error("❌ [REVOKE] Failed to remove device:", error);
            alert("Failed to remove device. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        {
            icon: User,
            label: 'Edit Profile',
            action: () => setIsEditSheetOpen(true), // Open Sheet
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
        { icon: Shield, label: 'Privacy Policy', path: '/privacy', color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { icon: HelpCircle, label: 'Help & Support', path: '/support', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    ];

    const themeClasses = darkMode
        ? {
            bg: 'bg-[#050B14]',
            cardBg: 'bg-[#151C2F]',
            text: 'text-white',
            subText: 'text-gray-400',
            border: 'border-white/10',
            hover: 'hover:bg-white/5',
            inputBg: 'bg-white/5',
            inputBorder: 'focus:border-[#FFC42E]'
        }
        : {
            bg: 'bg-[#F3F4F8]',
            cardBg: 'bg-white',
            text: 'text-gray-900',
            subText: 'text-gray-500',
            border: 'border-gray-100',
            hover: 'hover:bg-gray-50',
            inputBg: 'bg-gray-50',
            inputBorder: 'focus:border-[#FFC42E]'
        };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Compress image before upload
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Create canvas for compression
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Resize to max 400x400
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

                    // Convert to compressed base64 (0.7 quality)
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setImagePreview(compressedBase64);

                    // Create blob for file
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
                setLoading(false);
                return;
            }

            // Prepare update data using FormData for multipart support
            const updateForm = new FormData();
            updateForm.append('name', formData.name);
            updateForm.append('email', formData.email);
            if (formData.dob) updateForm.append('dob', formData.dob);

            // Critical: field name must be photoUrl for files
            if (profileImage) {
                updateForm.append('photoUrl', profileImage);
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token';

            // Correct API: PATCH /api/auth/update-user/:uid
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
                // Update local storage with new data from response or form
                const updatedUser = {
                    ...userData,
                    ...response.data.user,
                    name: formData.name,
                    email: formData.email,
                    dob: formData.dob
                };
                if (response.data.photoUrl) updatedUser.photoUrl = response.data.photoUrl;
                if (response.data.user?.photoUrl) updatedUser.photoUrl = response.data.user.photoUrl;

                localStorage.setItem('userData', JSON.stringify(updatedUser));
                setIsEditSheetOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error("Profile update failed", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    // If Guest User
    const isGuest = !userData || !userData.name || !localStorage.getItem('userId');
    if (isGuest) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${themeClasses.bg} text-center`}>
                <div className="w-24 h-24 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6">
                    <User size={48} className="text-[#FFC42E]" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text}`}>Guest Account</h2>
                <p className={`mb-8 ${themeClasses.subText}`}>Login to access your profile, bookings, and rewards.</p>
                <button
                    onClick={onLoginClick}
                    className="w-full max-w-xs py-4 rounded-xl bg-[#FFC42E] text-black font-bold text-lg shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
                >
                    Login / Sign Up
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-28 ${themeClasses.bg} transition-colors duration-300`}>
            {/* Header Section */}
            <div className="relative pt-12 pb-6 px-6">
                <div className="flex flex-col items-center">
                    {/* Profile Image with Glow */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative mb-4"
                    >
                        <div className={`absolute inset-0 rounded-full blur-xl bg-[#FFC42E]/30 scale-110`} />
                        <div className={`w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#FFC42E] to-[#FFD700] relative z-10`}>
                            <div className={`w-full h-full rounded-full overflow-hidden border-4 ${darkMode ? 'border-[#050B14]' : 'border-white'}`}>
                                <img
                                    src={userData?.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCLmWXlraVbthm0L63bpSRaJEydrEok7JE99ttRdVvx04q0hzVBUPyTlfnqEZMBTzgdro42ssZFDeGpmjYTZat_5_-Ej7xnxEjfEwYlSWBkftespCDEPrUdMscaBgmCNF1t88-fx2pvtj6HZh7bGv0b_hZ_qjKveKkHluqGyxomHTv1SMxRxa3JNG-ixegBx8KXmvhlX-SKEvvQavucOt1ghTKyC5OrczCZO7yM7EMKNzQsweAiePwO6hXGnzl-rSQycpwIcvSxmQIm"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {/* Camera Icon Trigger for Edit Sheet */}
                        <button
                            onClick={() => setIsEditSheetOpen(true)}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-[#FFC42E] rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20 active:scale-90 transition-transform"
                        >
                            <Camera size={14} className="text-black" />
                        </button>
                    </motion.div>

                    {/* User Info */}
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`text-2xl font-bold ${themeClasses.text} mb-1`}
                    >
                        {userData?.name || 'User'}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-sm ${themeClasses.subText} flex items-center gap-1`}
                    >
                        <Phone size={14} />
                        {userData?.phoneNumber || '+91 --'}
                    </motion.p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 px-6 mb-8">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-2xl ${themeClasses.cardBg} shadow-sm border ${themeClasses.border} flex flex-col items-center gap-2`}
                >
                    <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-[#FFC42E]">
                        <CreditCard size={20} />
                    </div>
                    <span className={`text-xs font-semibold ${themeClasses.subText} uppercase tracking-wider`}>Wallet Balance</span>
                    <span className={`text-xl font-bold ${themeClasses.text}`}>₹0.00</span>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-2xl ${themeClasses.cardBg} shadow-sm border ${themeClasses.border} flex flex-col items-center gap-2`}
                >
                    <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center text-red-500">
                        <Heart size={20} />
                    </div>
                    <span className={`text-xs font-semibold ${themeClasses.subText} uppercase tracking-wider`}>Saved Places</span>
                    <span className={`text-xl font-bold ${themeClasses.text}`}>2</span>
                </motion.div>
            </div>

            {/* Menu Options */}
            <div className="px-6 space-y-3">
                {menuItems.map((item: any, index) => (
                    <motion.button
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + (index * 0.1) }}
                        onClick={item.action || (() => router.push(item.path))}
                        className={`w-full p-4 rounded-2xl ${themeClasses.cardBg} border ${themeClasses.border} flex items-center justify-between group active:scale-[0.98] transition-all`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon size={22} />
                            </div>
                            <span className={`font-semibold ${themeClasses.text}`}>{item.label}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-50'} group-hover:bg-[#FFC42E] group-hover:text-black transition-colors`}>
                            <ChevronRight size={16} />
                        </div>
                    </motion.button>
                ))}

                {/* Logged-in Devices Section */}
                <div className="mt-8 mb-6">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-1 ${themeClasses.subText}`}>
                        Logged-in Devices
                    </h3>
                    <div className="space-y-3">
                        {userData?.fcmToken && Array.isArray(userData.fcmToken) && userData.fcmToken.length > 0 ? (
                            userData.fcmToken.map((device: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-2xl ${themeClasses.cardBg} border ${themeClasses.border} flex items-center justify-between group`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-50'} ${themeClasses.subText}`}>
                                            {device.platform === 'web' ? <Globe size={20} /> :
                                                device.deviceName?.toLowerCase().includes('windows') || device.deviceName?.toLowerCase().includes('mac') ? <Monitor size={20} /> :
                                                    device.deviceName?.toLowerCase().includes('iphone') || device.deviceName?.toLowerCase().includes('android') ? <Smartphone size={20} /> :
                                                        <Monitor size={20} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${themeClasses.text}`}>
                                                {device.deviceName || 'Unknown Device'}
                                                {localStorage.getItem('fcm_device_id') === device.deviceId && (
                                                    <span className="ml-2 text-[8px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Current</span>
                                                )}
                                            </p>
                                            <p className={`text-[10px] font-medium ${themeClasses.subText}`}>
                                                Last active: {device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleString() : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeDevice(device.deviceId)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={`p-4 rounded-2xl ${themeClasses.cardBg} border ${themeClasses.border} text-center`}>
                                <p className={`text-xs font-medium ${themeClasses.subText}`}>No other active sessions found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={handleLogout}
                    className={`w-full p-4 rounded-2xl mt-6 bg-red-500/10 border border-red-500/20 flex items-center justify-between group active:scale-[0.98] transition-all`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-red-500 text-white shadow-lg shadow-red-500/30`}>
                            <LogOut size={22} />
                        </div>
                        <span className="font-semibold text-red-500">Log Out</span>
                    </div>
                </motion.button>

                {/* Delete Account Button */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className={`w-full p-4 rounded-2xl mt-3 bg-gray-500/10 border border-gray-500/20 flex items-center justify-between group active:scale-[0.98] transition-all ${loading ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-700 text-white shadow-lg`}>
                            <X size={22} />
                        </div>
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Delete Account</span>
                    </div>
                </motion.button>

                <div className={`pt-8 text-center text-xs ${themeClasses.subText}`}>
                    <p>App Version 1.0.0</p>
                </div>
            </div>

            {/* 📝 EDIT PROFILE BOTTOM SHEET */}
            <EditProfileSheet
                isOpen={isEditSheetOpen}
                onClose={() => setIsEditSheetOpen(false)}
                userData={userData}
                darkMode={darkMode}
                onUpdateSuccess={(updatedUser) => {
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default ProfileView;
