// Location Update Service
// Auto-updates user location every 10 seconds

let locationUpdateInterval: NodeJS.Timeout | null = null;

export const startLocationUpdates = async () => {
    // Clear any existing interval
    if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
    }

    const updateLocation = async () => {
        try {
            const uid = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');

            if (!uid || !authToken) {
                console.log('❌ No auth, stopping location updates');
                stopLocationUpdates();
                return;
            }

            // Get current position
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Reverse geocode to get address using Google Maps
                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                    );
                    const data = await res.json();

                    let fullLocation = `${latitude}, ${longitude}`;
                    let city = "Unknown City";
                    let state = "Unknown State";

                    if (data.results && data.results[0]) {
                        fullLocation = data.results[0].formatted_address;

                        // Extract city and state from address components
                        data.results[0].address_components.forEach((component: any) => {
                            if (component.types.includes("locality")) city = component.long_name;
                            if (component.types.includes("administrative_area_level_1")) state = component.long_name;
                        });
                    }

                    const locationPayload = {
                        location: fullLocation,
                        coordinates: {
                            lat: latitude,
                            lng: longitude
                        },
                        city: city,
                        state: state,
                        lastUpdated: new Date().toISOString()
                    };

                    // Update database
                    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
                    await fetch(`${baseUrl}/api/auth/update-user/${uid}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                            'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
                        },
                        body: JSON.stringify(locationPayload)
                    });

                    // Update localStorage
                    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                    userData.location = locationPayload;
                    localStorage.setItem('userData', JSON.stringify(userData));

                    console.log('📍 Location updated:', city, ',', state);
                },
                (error) => {
                    console.log('⚠️ Location error:', error.message);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 10000
                }
            );
        } catch (error) {
            console.error('Location update failed:', error);
        }
    };

    // Update immediately
    await updateLocation();

    // Then every 10 seconds
    locationUpdateInterval = setInterval(updateLocation, 10000);
};

export const stopLocationUpdates = () => {
    if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
        locationUpdateInterval = null;
        console.log('🛑 Location updates stopped');
    }
};
