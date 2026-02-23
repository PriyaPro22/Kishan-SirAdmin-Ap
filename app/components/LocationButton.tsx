"use client";

import { useState, useEffect } from 'react';
import { MapPin, Loader2, Edit3 } from 'lucide-react';
import { useGPSLocation } from '../lib/useGPSLocation';
import LocationGoogleMapModal from './LocationGoogleMapModal';

interface LocationButtonProps {
    darkMode: boolean;
    onLocationChange?: (location: string) => void;
}

export default function LocationButton({ darkMode, onLocationChange }: LocationButtonProps) {
    const { location: gpsLocation, loading, refetch } = useGPSLocation();
    const [showEditModal, setShowEditModal] = useState(false);
    const [displayLocation, setDisplayLocation] = useState('');
    const [lastNotifiedGps, setLastNotifiedGps] = useState('');

    // Sync GPS location with parent
    useEffect(() => {
        if (!displayLocation && gpsLocation && !loading && gpsLocation !== 'Detecting location...' && gpsLocation !== 'Location unavailable' && gpsLocation !== lastNotifiedGps) {
            if (onLocationChange) {
                onLocationChange(gpsLocation);
                setLastNotifiedGps(gpsLocation);
            }
        }
    }, [gpsLocation, loading, displayLocation, onLocationChange, lastNotifiedGps]);

    // Use GPS location or manually set location
    const currentLocation = displayLocation || gpsLocation || 'Select Location';

    const handleLocationUpdate = (newLocation: string) => {
        setDisplayLocation(newLocation);
        if (onLocationChange) {
            onLocationChange(newLocation);
        }
        setShowEditModal(false);
    };

    const handleRefreshGPS = () => {
        setDisplayLocation(''); // Clear manual location
        refetch(); // Trigger GPS re-detection
    };

    return (
        <>
            <button
                onClick={() => setShowEditModal(true)}
                className={`flex items-center text-[11px] transition-all hover:opacity-80 active:scale-95 ${darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                    }`}
            >
                {loading ? (
                    <Loader2
                        size={12}
                        className={`mr-0.5 shrink-0 animate-spin ${darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                    />
                ) : (
                    <MapPin
                        size={12}
                        className={`mr-0.5 shrink-0 ${darkMode ? "text-[#FFC42E]" : "text-yellow-600"
                            }`}
                    />
                )}
                <span className="truncate max-w-[90px] font-medium">
                    {loading ? "Locating..." : currentLocation}
                </span>
                <Edit3
                    size={10}
                    className={`ml-1 shrink-0 opacity-40 ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                />
            </button>

            <LocationGoogleMapModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentLocation={currentLocation}
                onConfirm={handleLocationUpdate}
                onRefreshGPS={handleRefreshGPS}
                darkMode={darkMode}
            />
        </>
    );
}
