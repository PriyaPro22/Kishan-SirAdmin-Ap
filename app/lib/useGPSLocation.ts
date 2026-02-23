// Hook for GPS Location Detection with full address
import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
    lat: number;
    lng: number;
}

export const useGPSLocation = () => {
    const [location, setLocation] = useState('Detecting location...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('GPS not supported');
            setLocation('Location unavailable');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Store coordinates
                    setCoordinates({ lat: latitude, lng: longitude });

                    // Use Google Maps API directly
                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                    );

                    if (!response.ok) {
                        throw new Error('Geocoding failed');
                    }

                    const data = await response.json();

                    if (data.status === 'OK' && data.results && data.results.length > 0) {
                        // Find the best address components
                        const addressComponents = data.results[0].address_components;
                        const formattedAddress = data.results[0].formatted_address;

                        // Try to get a shorter, readable address
                        const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name;
                        const sublocality = addressComponents.find((c: any) => c.types.includes('sublocality'))?.long_name;
                        const locality = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name;

                        const shortAddress = [route, sublocality, locality].filter(Boolean).slice(0, 2).join(', ') || formattedAddress.split(',').slice(0, 2).join(',');

                        setLocation(shortAddress);
                        setLoading(false);
                        console.log('📍 Google GPS Location:', shortAddress);
                    } else {
                        // If no results or API error, fallback to coordinates but don't throw an error that stops everything
                        console.warn('⚠️ No results from Google Geocoding or API key missing/invalid:', data.status);
                        const fallbackLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        setLocation(fallbackLocation);
                        setLoading(false);
                        setError(`Geocoding unavailable (${data.status}). Showing coordinates.`);
                    }
                } catch (err) {
                    console.error('Geocoding error:', err);
                    const fallbackLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    setLocation(fallbackLocation);
                    setLoading(false);
                    setError('Geocoding service error. Showing coordinates.');
                }
            },
            (err) => {
                console.error('GPS error:', JSON.stringify({
                    code: err.code,
                    message: err.message
                }, null, 2));
                if (err.code === 1) {
                    setError('GPS permission denied');
                    setLocation('Permission denied - Enable GPS');
                } else if (err.code === 3) {
                    setError('GPS timeout - Please check signal');
                    setLocation('Timeout - Try again');
                } else {
                    setError('GPS unavailable');
                    setLocation('Location unavailable');
                }
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    }, []);

    // 🛡️ Remove auto-trigger on mount to avoid gesture violations
    useEffect(() => {
        getLocation();
    }, [getLocation]);

    // Refetch function to manually trigger GPS detection
    const refetch = useCallback(() => {
        console.log('🔄 Refreshing GPS location...');
        getLocation();
    }, [getLocation]);

    return { location, loading, error, coordinates, refetch };
};
