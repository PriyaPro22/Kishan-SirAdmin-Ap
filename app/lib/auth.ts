import axios from 'axios';

const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api`,
    timeout: 30000,
});

const config = {
    headers: {
        'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
    }
};

export interface SendOtpResponse {
    success: boolean;
    message: string;
    otpToken?: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    uid?: string | null;
    userId?: string | null;
    token: string;
    redirectTo?: string;
    user?: any;
    conflict?: boolean; // New: If true, another device is active
}

// 🔐 Helper: Generate or Get Persistent Device ID
export const getDeviceId = () => {
    if (typeof window === 'undefined') return 'server';
    let id = localStorage.getItem('bwa_device_id');
    if (!id) {
        id = 'DEV_' + Math.random().toString(36).substring(2, 11).toUpperCase();
        localStorage.setItem('bwa_device_id', id);
    }
    return id;
};

export const sendOtp = async (mobile: string) => {
    try {
        console.log(`🚀 [AUTH_LIB] Sending OTP to: ${mobile}`);
        const response = await instance.post('/auth/send-otp', { mobile }, config);
        return response.data;
    } catch (error: any) {
        const errorDetail = error.response?.data || error.message || error;
        console.error('❌ [AUTH_LIB] sendOtp error:', JSON.stringify(errorDetail, null, 2));
        throw error;
    }
};

export const verifyOtp = async (otpToken: string, otp: string, force = false): Promise<VerifyOtpResponse> => {
    try {
        console.log(`🚀 [AUTH_LIB] Verifying OTP...`);
        const deviceId = getDeviceId();
        const response = await instance.post('/auth/verify-otp', { otpToken, otp, deviceId, force }, config);
        return response.data;
    } catch (error: any) {
        const errorDetail = error.response?.data || error.message || error;
        console.error('❌ [AUTH_LIB] verifyOtp error:', JSON.stringify(errorDetail, null, 2));
        throw error;
    }
};

export const completeProfile = async (userData: FormData | any, authToken: string) => {
    try {
        console.log(`🚀 [AUTH_LIB] Completing profile...`);
        let body = userData;
        if (!(userData instanceof FormData)) {
            body = new FormData();
            Object.keys(userData).forEach(key => {
                body.append(key, userData[key]);
            });
        }

        const response = await instance.post('/auth/create-user', body, {
            headers: {
                ...config.headers,
                'Authorization': `Bearer ${authToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        const errorDetail = error.response?.data || error.message || error;
        console.error('❌ [AUTH_LIB] completeProfile error:', JSON.stringify(errorDetail, null, 2));
        throw error;
    }
};

export const syncFcmToken = async (uid: string, authToken: string, fcmToken?: string) => {
    try {
        console.log(`🚀 [AUTH_LIB] Syncing device info for UID: ${uid}`);

        // Basic device info regardless of FCM
        const deviceInfo = {
            token: fcmToken || localStorage.getItem('fcm_token') || 'NOT_AVAILABLE',
            deviceId: localStorage.getItem('fcm_device_id') || 'UNKNOWN_DEVICE',
            platform: 'web',
            deviceName: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
        };

        const response = await instance.patch(`/auth/add-fcm/${uid}`, deviceInfo, {
            headers: {
                ...config.headers,
                'Authorization': `Bearer ${authToken}`,
                'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
            }
        });
        return response.data;
    } catch (error: any) {
        const errorDetail = error.response?.data || error.message || error;
        console.error('⚠️ [AUTH_LIB] syncFcmToken warning:', JSON.stringify(errorDetail, null, 2));
        return { success: false, error: errorDetail };
    }
};

export const updateLocation = async (uid: string, authToken: string, lat: number, lng: number, address?: string) => {
    try {
        const response = await instance.patch(`/auth/update-user/${uid}`, {
            deviceId: getDeviceId(),
            location: address || `${lat}, ${lng}`, // Properly use the address or coordinates
            coordinates: {
                lat: lat,
                lng: lng
            },
            lastUpdated: new Date().toISOString()
        }, {
            headers: {
                ...config.headers,
                'Authorization': `Bearer ${authToken}`,
                'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
            }
        });
        return response.data;
    } catch (error: any) {
        const errorDetail = error.response?.data || error.message || error;
        console.error('⚠️ [AUTH_LIB] updateLocation error:', JSON.stringify(errorDetail, null, 2));
        return { success: false };
    }
};
