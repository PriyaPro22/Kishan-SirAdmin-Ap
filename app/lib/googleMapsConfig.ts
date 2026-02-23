export const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry", "drawing", "visualization"];

export const GOOGLE_MAPS_LOADER_CONFIG = {
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
};
