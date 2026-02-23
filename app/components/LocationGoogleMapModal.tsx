"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Check, Search, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { GOOGLE_MAPS_LOADER_CONFIG } from '../lib/googleMapsConfig';

const libraries = GOOGLE_MAPS_LOADER_CONFIG.libraries;

interface LocationGoogleMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: string;
    onConfirm: (location: string) => void;
    onRefreshGPS: () => void;
    darkMode: boolean;
}

export default function LocationGoogleMapModal({
    isOpen,
    onClose,
    currentLocation,
    onConfirm,
    onRefreshGPS,
    darkMode
}: LocationGoogleMapModalProps) {
    const { setShowBottomNav } = useApp();
    const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
    const [selectedLocation, setSelectedLocation] = useState({ lat: 28.6139, lng: 77.2090 });
    const [addressLine, setAddressLine] = useState(currentLocation);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
    const [isLocating, setIsLocating] = useState(false);

    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_CONFIG);

    const {
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
        init
    } = usePlacesAutocomplete({
        debounce: 300,
        initOnMount: false
    });

    // Initialize Places when map loads
    useEffect(() => {
        if (isLoaded && isOpen) {
            init();
        }
    }, [isLoaded, isOpen, init]);

    useEffect(() => {
        if (isOpen) {
            setShowBottomNav(false);
            // Auto-fetch location when map opens AND is loaded
            if (isLoaded) {
                getUserLocation();
            }
        } else {
            setShowBottomNav(true);
        }
    }, [isOpen, isLoaded, setShowBottomNav]);

    // Update internal address when currentLocation changes (e.g. from GPS)
    useEffect(() => {
        if (isOpen && currentLocation && currentLocation !== 'Locating...' && currentLocation !== 'Loading...') {
            setAddressLine(currentLocation);
        }
    }, [isOpen, currentLocation]);

    const handleSelectPlace = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            const newPos = { lat, lng };
            setMapCenter(newPos);
            setSelectedLocation(newPos);
            setAddressLine(address);
            if (mapRef.current) {
                mapRef.current.panTo(newPos);
            }
        } catch (error) {
            console.error("Error selecting place: ", error);
        }
    };

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        // If we have an address but no coords, try to geocode it once
        if (currentLocation && currentLocation !== 'Locating...') {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: currentLocation }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                    const pos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    setMapCenter(pos);
                    setSelectedLocation(pos);
                }
            });
        }
    }, [currentLocation]);

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                    setAddressLine(results[0].formatted_address);
                }
            });
        } catch (e) {
            console.error("Geocoding error:", e);
        }
    };

    const handleMapDragEnd = useCallback(() => {
        if (mapRef.current) {
            const center = mapRef.current.getCenter();
            if (center) {
                const newPos = { lat: center.lat(), lng: center.lng() };
                setSelectedLocation(newPos);
                fetchAddressFromCoords(newPos.lat, newPos.lng);
            }
        }
    }, []);

    const getUserLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                setMapCenter(pos);
                setSelectedLocation(pos);
                fetchAddressFromCoords(pos.lat, pos.lng);
                if (mapRef.current) {
                    mapRef.current.panTo(pos);
                }
                setIsLocating(false);
            }, (error) => {
                console.error("Location error:", error);
                setIsLocating(false);
            });
        } else {
            setIsLocating(false);
        }
    };

    const handleConfirmSelection = () => {
        onConfirm(addressLine);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                />

                {/* Main Content */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                    className={`relative z-10 w-full max-w-[500px] ${darkMode ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] pointer-events-auto`}
                >
                    {/* Header */}
                    <div className={`p-4 flex items-center justify-between border-b ${darkMode ? 'border-white/10' : 'border-gray-100'} shrink-0`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-yellow-400/10' : 'bg-yellow-50'}`}>
                                <MapPin className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={20} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Location</h3>
                                <p className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Move map to pin location</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Section */}
                    <div className="p-4 relative z-20">
                        <div className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${darkMode ? 'bg-white/5 border-white/10 focus-within:border-yellow-400/50' : 'bg-gray-50 border-gray-100 focus-within:border-yellow-500'}`}>
                            <Search size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                            <input
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Search for area, street..."
                                disabled={!isLoaded}
                                className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                            />
                            {value && (
                                <button onClick={() => setValue('')} className="p-1">
                                    <X size={14} className="text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Suggestions List */}
                        {status === "OK" && (
                            <motion.ul
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`absolute left-4 right-4 mt-2 ${darkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-gray-100'} border rounded-2xl shadow-2xl overflow-hidden divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'} z-30 max-h-60 overflow-y-auto`}
                            >
                                {data.map(({ place_id, description }) => (
                                    <li
                                        key={place_id}
                                        onClick={() => handleSelectPlace(description)}
                                        className={`px-4 py-3 flex items-center gap-3 ${darkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} cursor-pointer text-sm font-medium transition-colors`}
                                    >
                                        <MapPin size={14} className="shrink-0 opacity-50" />
                                        <span className="truncate">{description}</span>
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 relative bg-gray-100 overflow-hidden">
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
                                {/* Center Pin - CSS Based for smooth floating */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%-8px)] z-10 pointer-events-none">
                                    <div className="relative flex flex-col items-center">
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="relative"
                                        >
                                            <MapPin className="text-red-500 fill-red-500" size={48} />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-inner" />
                                        </motion.div>
                                        <div className="w-4 h-1.5 bg-black/20 rounded-full blur-[2px] mt-2 scale-x-125" />
                                    </div>
                                </div>
                            </GoogleMap>
                        ) : (
                            <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
                                <Loader2 size={40} className="animate-spin text-yellow-500 mb-3" />
                                <p className={`text-sm font-medium animate-pulse ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Initializing Map...</p>
                            </div>
                        )}

                        {loadError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 z-50 p-6 text-center">
                                <div>
                                    <p className="text-red-600 font-bold mb-2">Map Load Error</p>
                                    <p className="text-xs text-red-500">Please check your internet connection or API key.</p>
                                </div>
                            </div>
                        )}

                        {/* Map Mode Toggle */}
                        <div className={`absolute top-4 right-4 flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 z-10`}>
                            <button
                                onClick={() => setMapType('roadmap')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapType === 'roadmap' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/10'}`}
                            >
                                Map
                            </button>
                            <button
                                onClick={() => setMapType('satellite')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapType === 'satellite' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/10'}`}
                            >
                                SAT
                            </button>
                        </div>

                        {/* Current Location Button */}
                        <button
                            onClick={getUserLocation}
                            disabled={isLocating}
                            className={`absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 z-10 ${darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}
                        >
                            {isLocating ? <Loader2 size={24} className="animate-spin" /> : <Navigation size={24} />}
                        </button>
                    </div>

                    {/* Bottom Confirm Area */}
                    <div className={`p-5 ${darkMode ? 'bg-[#0F172A]' : 'bg-white'} border-t ${darkMode ? 'border-white/10' : 'border-gray-100'} shrink-0`}>
                        <div className="flex items-start gap-3 mb-5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                <MapPin className="text-blue-500" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Current Selection</h4>
                                <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {addressLine || "Point the pin at your delivery location"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmSelection}
                            disabled={!addressLine}
                            className="w-full bg-[#FFC42E] hover:bg-[#EAB308] disabled:bg-gray-200 disabled:text-gray-400 text-[#111827] font-black py-4 rounded-2xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-base"
                        >
                            <Check size={20} />
                            CONFIRM LOCATION
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
