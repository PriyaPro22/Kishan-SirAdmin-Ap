import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { motion, AnimatePresence } from 'framer-motion';

import { GOOGLE_MAPS_LOADER_CONFIG } from '../lib/googleMapsConfig';

const libraries = GOOGLE_MAPS_LOADER_CONFIG.libraries;

interface AddAddressSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAddress: (address: any) => void;
    onAddNewAddress: (address: any) => void;
    onEditAddress?: (address: any) => void;
    onDeleteAddress?: (id: string) => void;
    savedAddresses: any[];
    darkMode: boolean;
    editingAddress?: any;
}

export default function AddAddressSheet({ isOpen, onClose, onSelectAddress, onAddNewAddress, onEditAddress, onDeleteAddress, savedAddresses, darkMode, editingAddress }: AddAddressSheetProps) {
    const { setShowBottomNav } = useApp();

    // Selected saved address ID (for highlighting)
    const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Map & Location State  
    const [mapCenter, setMapCenter] = useState({ lat: 26.8467, lng: 80.9462 });
    const [selectedLocation, setSelectedLocation] = useState({ lat: 26.8467, lng: 80.9462 });
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
    const [gpsLoading, setGpsLoading] = useState(false);

    // Address Details State
    const [addressLine, setAddressLine] = useState('');
    const [details, setDetails] = useState({
        houseNo: '',
        landmark: '',
        label: 'Home' as 'Home' | 'Office' | 'Other'
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const formRef = useRef<HTMLDivElement | null>(null);

    const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_CONFIG);

    useEffect(() => {
        if (isOpen) {
            setShowBottomNav(false);
        } else {
            setShowBottomNav(true);
        }
    }, [isOpen, setShowBottomNav]);

    // Handle editing mode from parent
    useEffect(() => {
        if (isOpen && editingAddress) {
            setIsEditMode(true);
            setEditingId(editingAddress.id);
            setSelectedSavedId(editingAddress.id);
            setAddressLine(editingAddress.address || editingAddress.area || editingAddress.fullAddress || '');
            setDetails({
                houseNo: editingAddress.houseNo || '',
                landmark: editingAddress.landmark || editingAddress.landMark || '',
                label: editingAddress.label || 'Home'
            });
            setSelectedLocation({ lat: Number(editingAddress.lat) || 26.8467, lng: Number(editingAddress.lng) || 80.9462 });
            setMapCenter({ lat: Number(editingAddress.lat) || 26.8467, lng: Number(editingAddress.lng) || 80.9462 });
        } else if (isOpen) {
            setIsEditMode(false);
            setEditingId(null);
            // Auto select first saved address if exists
            if (savedAddresses.length > 0 && !selectedSavedId) {
                const first = savedAddresses[0];
                handleSelectSaved(first);
            } else if (savedAddresses.length === 0) {
                // No saved, get user location and scroll to form
                getUserLocation(true);
            }
        }
    }, [isOpen, editingAddress]);

    // --- Places Autocomplete ---
    const { value, suggestions: { status, data }, setValue, clearSuggestions, init } = usePlacesAutocomplete({
        debounce: 300,
        requestOptions: {
            locationBias: { lat: selectedLocation.lat, lng: selectedLocation.lng, radius: 5000 }
        },
        initOnMount: false
    });

    useEffect(() => {
        if (isLoaded && isOpen) {
            init();
        }
    }, [isLoaded, isOpen, init]);

    const handleSelectPlace = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            setMapCenter({ lat, lng });
            setSelectedLocation({ lat, lng });
            setAddressLine(address);
            // Clear saved selection - this is a new location
            setSelectedSavedId(null);
            setIsEditMode(false);
            setEditingId(null);
            setDetails({ houseNo: '', landmark: '', label: 'Home' });
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const handleMapDragEnd = useCallback(() => {
        if (mapRef.current) {
            const center = mapRef.current.getCenter();
            if (center) {
                const newPos = { lat: center.lat(), lng: center.lng() };
                setSelectedLocation(newPos);
                fetchAddressFromCoords(newPos.lat, newPos.lng);
                // Clear saved selection when user drags map
                setSelectedSavedId(null);
                setIsEditMode(false);
                setEditingId(null);
                setDetails(prev => ({ ...prev, houseNo: '', landmark: '' }));
            }
        }
    }, []);

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                    setAddressLine(results[0].formatted_address);
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    const scrollToForm = () => {
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
    };

    const getUserLocation = (autoScrollToForm = false) => {
        if (navigator.geolocation) {
            setGpsLoading(true);
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                setMapCenter(pos);
                setSelectedLocation(pos);
                fetchAddressFromCoords(pos.lat, pos.lng);
                setSelectedSavedId(null);
                setIsEditMode(false);
                setEditingId(null);
                setDetails({ houseNo: '', landmark: '', label: 'Home' });
                setGpsLoading(false);
                if (autoScrollToForm) scrollToForm();
            }, (error) => {
                console.log("Location error, using default");
                setGpsLoading(false);
                if (autoScrollToForm) scrollToForm();
            });
        }
    };

    // --- Select a Saved Address ---
    const handleSelectSaved = (addr: any) => {
        setSelectedSavedId(addr.id);
        setIsEditMode(true);
        setEditingId(addr.id);
        const lat = Number(addr.lat) || 26.8467;
        const lng = Number(addr.lng) || 80.9462;
        setSelectedLocation({ lat, lng });
        setMapCenter({ lat, lng });
        setAddressLine(addr.area || addr.fullAddress || '');
        setDetails({
            houseNo: addr.houseNo || '',
            landmark: addr.landmark || addr.landMark || '',
            label: addr.label || 'Home'
        });
        // Clear search
        setValue('', false);
        clearSuggestions();
    };

    // --- Save / Confirm ---
    const handleConfirm = () => {
        const finalAddress = {
            id: editingId || Date.now().toString(),
            label: details.label,
            area: addressLine,
            houseNo: details.houseNo,
            landmark: details.landmark,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            fullAddress: `${details.houseNo ? details.houseNo + ', ' : ''}${addressLine}${details.landmark ? ' (Near ' + details.landmark + ')' : ''}`
        };

        if (isEditMode && editingId && onEditAddress) {
            // Edit existing
            onEditAddress(finalAddress);
        } else if (isEditMode && editingId) {
            // Select existing (no edit handler)
            onSelectAddress(finalAddress);
        } else {
            // New address
            onAddNewAddress(finalAddress);
        }

        // Reset
        setDetails({ houseNo: '', landmark: '', label: 'Home' });
        setAddressLine('');
        setIsEditMode(false);
        setEditingId(null);
        setSelectedSavedId(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />

            {/* Main Sheet */}
            <div
                className={`relative z-10 w-full max-w-md ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto`}
                style={{ height: '92vh', animation: 'slideUp 0.3s ease-out' }}
            >
                {/* ===== HEADER ===== */}
                <div className={`px-5 pt-4 pb-3 flex items-center justify-between shrink-0 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Select Address
                    </h3>
                    <button onClick={onClose} className={`p-2 rounded-full transition ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* ===== SCROLLABLE CONTENT ===== */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto pb-28 scrollbar-hide">

                    {/* --- SEARCH BAR --- */}
                    <div className="px-5 pt-2 pb-3">
                        <div className="relative">
                            <span className={`absolute left-4 top-3.5 material-symbols-outlined text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>search</span>
                            <input
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Search for area, street name..."
                                disabled={!isLoaded}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all ${darkMode
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:bg-white'
                                    }`}
                            />
                            {/* Search Suggestions */}
                            {status === "OK" && (
                                <ul className={`absolute top-full left-0 right-0 mt-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden z-30 max-h-48 overflow-y-auto border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    {data.map(({ place_id, description }) => (
                                        <li
                                            key={place_id}
                                            onClick={() => handleSelectPlace(description)}
                                            className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'} cursor-pointer text-sm transition-colors flex items-center gap-3`}
                                        >
                                            <span className={`material-symbols-outlined text-base ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>location_on</span>
                                            <span className="line-clamp-1">{description}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* --- USE CURRENT LOCATION --- */}
                    <div className="px-5 pb-4">
                        <button
                            onClick={() => getUserLocation()}
                            disabled={gpsLoading}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-[0.98] ${darkMode
                                ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                                : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                {gpsLoading ? (
                                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-xl text-yellow-600">my_location</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Use Current Location
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {gpsLoading ? 'Detecting location...' : 'Using GPS'}
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* --- SAVED ADDRESSES --- */}
                    {savedAddresses.length > 0 && (
                        <div className="pb-4">
                            <div className="flex items-center justify-between px-5 mb-3">
                                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Saved Addresses
                                </p>
                            </div>
                            <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
                                <AnimatePresence>
                                    {savedAddresses.map((addr) => {
                                        const isSelected = selectedSavedId === addr.id;
                                        return (
                                            <motion.div
                                                key={addr.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                onClick={() => handleSelectSaved(addr)}
                                                className={`flex-shrink-0 w-56 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.97] relative ${isSelected
                                                    ? (darkMode ? 'border-yellow-500 bg-yellow-500/10' : 'border-yellow-500 bg-yellow-50')
                                                    : (darkMode ? 'border-gray-700 bg-gray-800 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm')
                                                    }`}
                                            >
                                                {/* Selected indicator */}
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="material-symbols-outlined text-yellow-500 text-lg">check_circle</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-yellow-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                                        {addr.label === 'Home' ? 'home' : addr.label === 'Office' || addr.label === 'Work' ? 'work' : 'location_on'}
                                                    </span>
                                                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{addr.label}</span>
                                                </div>
                                                <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {addr.houseNo ? addr.houseNo + ', ' : ''}{addr.area || addr.fullAddress}
                                                </p>

                                                {/* Edit & Delete */}
                                                {isSelected && (
                                                    <div className="flex gap-2 mt-3 pt-2 border-t border-dashed" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                scrollRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
                                                            }}
                                                            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition ${darkMode ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-yellow-600 hover:bg-yellow-50'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                            Edit
                                                        </button>
                                                        {onDeleteAddress && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteAddress(addr.id);
                                                                }}
                                                                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Add New Button (inline) */}
                                <div
                                    onClick={() => {
                                        setSelectedSavedId(null);
                                        setIsEditMode(false);
                                        setEditingId(null);
                                        setDetails({ houseNo: '', landmark: '', label: 'Home' });
                                        getUserLocation(true);
                                    }}
                                    className={`flex-shrink-0 w-40 p-4 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97] ${darkMode
                                        ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                                        : 'border-gray-300 text-gray-400 hover:border-gray-400'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-2xl">add_location_alt</span>
                                    <span className="text-xs font-medium text-center">Add New Address</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- LOCATION PREVIEW (MAP) --- */}
                    <div className="px-5 pb-4">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Location Preview
                        </p>
                        <div className={`rounded-2xl overflow-hidden border relative ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ height: '220px' }}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={mapCenter}
                                    zoom={16}
                                    onLoad={handleMapLoad}
                                    onDragEnd={handleMapDragEnd}
                                    options={{
                                        disableDefaultUI: true,
                                        gestureHandling: 'greedy',
                                        mapTypeId: mapType,
                                        styles: darkMode && mapType === 'roadmap' ? [
                                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                                        ] : []
                                    }}
                                >
                                    {/* Center Pin */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
                                        <div className="relative flex flex-col items-center">
                                            <div className={`${darkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl mb-0.5 whitespace-nowrap`}>
                                                📍 Service here
                                            </div>
                                            <span className="material-symbols-outlined text-5xl text-yellow-500 drop-shadow-2xl">location_on</span>
                                        </div>
                                    </div>
                                </GoogleMap>
                            ) : (
                                <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className="text-center">
                                        <div className="animate-spin h-8 w-8 border-3 border-yellow-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Loading map...</p>
                                    </div>
                                </div>
                            )}

                            {/* Map type / My Location shortcuts */}
                            <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                                <button
                                    onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
                                    className={`p-2 rounded-xl shadow-lg transition ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}
                                >
                                    <span className="material-symbols-outlined text-base">{mapType === 'roadmap' ? 'satellite_alt' : 'map'}</span>
                                </button>
                                <button
                                    onClick={() => getUserLocation()}
                                    className={`p-2 rounded-xl shadow-lg transition ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-yellow-600'}`}
                                >
                                    <span className="material-symbols-outlined text-base">my_location</span>
                                </button>
                            </div>
                        </div>

                        {/* Address Text below map */}
                        <div className={`flex items-start gap-2 mt-3 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <span className="material-symbols-outlined text-yellow-500 text-lg mt-0.5 shrink-0">location_on</span>
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {addressLine || "Move map pin or search to select location..."}
                            </p>
                        </div>
                    </div>

                    {/* --- ADDRESS DETAILS FORM --- */}
                    <div ref={formRef} className="px-5 pb-6">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Complete Address
                        </p>

                        <div className="space-y-4">
                            {/* House / Flat */}
                            <div>
                                <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    House / Flat / Block No.
                                </label>
                                <input
                                    value={details.houseNo}
                                    onChange={e => setDetails({ ...details, houseNo: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${darkMode
                                        ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-yellow-500'
                                        : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:bg-white'
                                        } outline-none`}
                                    placeholder="e.g., Flat 402, Tower B"
                                />
                            </div>

                            {/* Landmark */}
                            <div>
                                <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Landmark (Optional)
                                </label>
                                <input
                                    value={details.landmark}
                                    onChange={e => setDetails({ ...details, landmark: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${darkMode
                                        ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-yellow-500'
                                        : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:bg-white'
                                        } outline-none`}
                                    placeholder="e.g., Near City Mall"
                                />
                            </div>

                            {/* Save As */}
                            <div>
                                <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Save As
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Home', 'Office', 'Other'] as const).map(label => (
                                        <button
                                            key={label}
                                            onClick={() => setDetails({ ...details, label: label })}
                                            className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${details.label === label
                                                ? (darkMode ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm')
                                                : (darkMode ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-500 hover:border-gray-300')
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-base">
                                                {label === 'Home' ? 'home' : label === 'Office' ? 'work' : 'location_on'}
                                            </span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ===== STICKY CONFIRM BUTTON ===== */}
                <div className={`absolute bottom-0 left-0 right-0 px-5 py-4 ${darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-100'} border-t backdrop-blur-sm`}>
                    <button
                        onClick={handleConfirm}
                        disabled={!addressLine}
                        className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${addressLine
                            ? 'bg-[#FFC42E] text-gray-900 hover:bg-[#FFD700]'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Confirm Address
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                </div>

            </div>

            {/* Inline CSS */}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
