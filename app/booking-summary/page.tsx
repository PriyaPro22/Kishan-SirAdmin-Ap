"use client";
import LocationHeader from '../components/LocationHeader';
// ðŸ”“ CODE UNLOCKED. PASSWORD ACCEPTED: 224123.
// DO NOT EDIT WITHOUT AUTH.

import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import BillDetailsSheet from '../components/BillDetailsSheet';
import AddAddressSheet from '../components/AddAddressSheet';
import PaymentModeSheet from '../components/PaymentModeSheet';
import { useToast } from '../components/ToastProvider';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import PaymentFailurePopup from '../components/PaymentFailurePopup';
import { useGPSLocation } from '../lib/useGPSLocation';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Clock, User, Phone, Loader2, Eye, Plus, Minus, Trash2, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';
import Lottie from 'lottie-react';
import userFallbackAnimation from '../components/animations/user-fallback.json';

const ServiceDetailBottomSheet = dynamic(() => import('../components/ServiceDetailBottomSheet'), { ssr: false });

const BookingSummarySkeleton = ({ darkMode }: { darkMode: boolean }) => (
  <div className="space-y-4 px-4 mt-4">
    {[1, 2].map((i) => (
      <div
        key={i}
        className={`flex gap-4 p-3 rounded-xl border animate-pulse ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className={`w-24 h-24 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
        <div className="flex-1 space-y-3 py-1">
          <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          <div className="space-y-2">
            <div className={`h-3 rounded w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
            <div className={`h-3 rounded w-1/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <div className={`h-8 w-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
            <div className={`h-8 w-20 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Memoized QR Code Component to prevent re-renders
const MemoizedQRCode = memo(({ value }: { value: string }) => (
  <QRCodeSVG
    value={value}
    size={180}
    level="M"
    includeMargin={false}
  />
));
MemoizedQRCode.displayName = 'MemoizedQRCode';


export default function BookingSummaryPage() {
  const router = useRouter();
  const { cartItems, addToCart, removeFromCart, deleteFromCart, clearCart, isLoading: isCartLoading } = useCart();

  const { darkMode, openModal } = useApp();
  const { showToast, showConfirm } = useToast();

  const [selectedAddressObject, setSelectedAddressObject] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]); // Local state for addresses
  const [couponCode, setCouponCode] = useState('');
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('');

  // User Details for PayGic
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    mobile: '',
    image: ''
  });
  const [loadingUserData, setLoadingUserData] = useState(true);

  // No redundant useCart call here
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);
  const [isRefreshingCart, setIsRefreshingCart] = useState(false);
  const enrichmentCache = useRef<Record<string, any>>({});
  const resolutionCache = useRef<Record<string, string>>({}); // 🔑 Cache for resolveChildId
  const isProcessingOrder = useRef(false); // 🛡️ Lock to prevent duplicate POST calls

  // 🛡️ Helper: Clean currency strings before converting to numbers
  const parseSafeNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Cart Enrichment State
  const [cancellationPolicies, setCancellationPolicies] = useState<any[]>([]);
  const [showCancellationSheet, setShowCancellationSheet] = useState(false);

  const [showAddressSheet, setShowAddressSheet] = useState(false); // Kept to avoid breaking if referenced elsewhere strictly, but unused
  const [showAddAddressSheet, setShowAddAddressSheet] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null); // Track address being edited
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('later');
  const [selectedDate, setSelectedDate] = useState(new Date().getDate().toString());
  const [selectedTime, setSelectedTime] = useState('08:00 AM');
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const { location: gpsAddress, coordinates: gpsCoords, loading: gpsLoading } = useGPSLocation();
  const [currentLocation, setCurrentLocation] = useState<{ lat: string, lng: string } | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>("");


  // Payment Failure State
  const [showPaymentFailure, setShowPaymentFailure] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [successPaymentRefId, setSuccessPaymentRefId] = useState('');
  const [successUtrNumber, setSuccessUtrNumber] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<any>(null);

  // --- Instant Service & Partner Tracking States ---
  const [nearbyPartners, setNearbyPartners] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const PARTNER_REFRESH_INTERVAL = 30000; // 30 seconds
  // Sync GPS location to current states if not already set manually
  useEffect(() => {
    if (gpsAddress && !currentAddress) {
      setCurrentAddress(gpsAddress);
    }
    if (gpsCoords && !currentLocation) {
      setCurrentLocation({ lat: String(gpsCoords.lat), lng: String(gpsCoords.lng) });
    }
  }, [gpsAddress, gpsCoords, currentAddress, currentLocation]);


  // Auto-fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId) {
        setLoadingUserData(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const response = await axios.get(
          `${baseUrl}/api/auth/user/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
            }
          }
        );

        if (response.data && response.data.user) {
          console.log('ðŸ” Full API Response:', response.data);
          const userData = response.data.user;

          // Extract mobile number (remove +91 prefix if present)
          const mobile = userData.phoneNumber?.replace('+91', '').replace(/\s/g, '') || '';

          console.log('ðŸ” Extracted values:', {
            rawPhoneNumber: userData.phoneNumber,
            processedMobile: mobile,
            name: userData.name,
            email: userData.email
          });

          setUserDetails({
            name: userData.name || '',
            email: userData.email || '',
            mobile: mobile,
            image: userData.photoUrl || userData.profileImage || userData.image || userData.avatar || ''
          });
          console.log('âœ… User data auto-loaded:', { name: userData.name, email: userData.email, mobile, photoUrl: userData.photoUrl });
        }
      } catch (error) {
        console.error('âŒ Failed to fetch user data from API:', error);

        // FALLBACK: Try to use localStorage userData
        try {
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            const mobile = userData.phoneNumber?.replace('+91', '').replace(/\s/g, '') || '';

            setUserDetails({
              name: userData.name || '',
              email: userData.email || '',
              mobile: mobile,
              image: userData.image || ''
            });
            console.log('âœ… User data loaded from localStorage fallback:', { name: userData.name, email: userData.email, mobile });
          } else {
            console.warn('âš ï¸ No userData in localStorage either');
          }
        } catch (err) {
          console.error('âŒ Failed to parse localStorage userData:', err);
        }
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch Nearby Partners for Instant Service ETA
  const fetchNearbyPartners = async () => {
    try {
      setLoadingPartners(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';
      const response = await axios.get(`${baseUrl}/api/partner/direct-hire`, {
        headers: {
          'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
        }
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        // Filter only active & free technicians
        const realPartners = response.data.data.filter((p: any) =>
          p.status === 'active' &&
          p.live_status?.active === true &&
          p.job_category?.isTechnicians === true
        );

        setNearbyPartners(realPartners);
        console.log(`✅ Fetched ${realPartners.length} real partners`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch nearby partners:', error);
    } finally {
      setLoadingPartners(false);
    }
  };

  useEffect(() => {
    fetchNearbyPartners();
    const interval = setInterval(fetchNearbyPartners, PARTNER_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [cartItems.length, isCartLoading, selectedAddressObject]);

  // Helper: Haversine distance for ETA calculation
  const calculateETA = (pLat: number, pLng: number) => {
    // Priority: 1. Manually selected address, 2. Current GPS detection
    const activeLat = selectedAddressObject?.lat || currentLocation?.lat;
    const activeLng = selectedAddressObject?.lng || currentLocation?.lng;

    if (!activeLat || !activeLng) return null;

    const uLat = parseFloat(String(activeLat));
    const uLng = parseFloat(String(activeLng));

    const R = 6371; // Earth's radius in km
    const dLat = (pLat - uLat) * Math.PI / 180;
    const dLng = (pLng - uLng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(uLat * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Estimate 2-3 mins per KM + 2 mins base
    const etaMins = Math.round(distanceKm * 2.5 + 2);
    return etaMins < 5 ? 5 : etaMins; // Minimum 5 mins
  };

  // Fetch Enriched Data for Cart Items
  // This function fetches missing details (images, titles, prices) from the product listing APIs
  const fetchEnrichedCartItems = async () => {
    if (cartItems.length === 0) {
      setEnrichedItems([]);
      return;
    }

    // Stabilize enrichment with a true cache check
    // 🛡️ Check if we actually need a refresh (only if missing from cache or quantity changed)
    const needsProcessing = cartItems.filter(item => {
      const cached = enrichmentCache.current[item.id];
      return !cached || cached.quantity !== item.quantity;
    });

    if (needsProcessing.length === 0 && enrichedItems.length === cartItems.length) {
      console.log("⏩ All items cached and quantity matches. Skipping enrichment.");
      return;
    }

    if (needsProcessing.length > 0) {
      setIsRefreshingCart(true);
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';

    // Helper: Fetch Child Categories to resolve "Repair" (Key) -> "64f..." (ID)
    const resolveChildId = async (mainId: string, subId: string, childKey: string) => {
      // 🛡️ Guard: Generic keys ('Services', 'Repair') that often cause loops or resolution failure
      if (!childKey || childKey.toLowerCase() === 'services' || childKey.toLowerCase() === 'repair') {
        return childKey;
      }
      // 🛡️ Guard: If childKey is already a mongoID (24 chars hex), use it directly
      if (/^[0-9a-fA-F]{24}$/.test(childKey)) {
        return childKey;
      }
      const cacheKey = `${mainId}_${subId}_${childKey}`;
      if (resolutionCache.current[cacheKey]) return resolutionCache.current[cacheKey];

      try {
        let url = '';
        if (subId && subId !== 'null' && subId !== 'undefined') {
          url = `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/child`;
        } else {
          url = `${baseUrl}/api/product-listing/main/${mainId}/child`;
        }

        console.log(`🔍 Resolving Child ID for key '${childKey}' from: ${url}`);
        const res = await axios.get(url, {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN!,
          },
        });

        if (res.data?.success && Array.isArray(res.data.data)) {
          const match = res.data.data.find((c: any) =>
            (c.child_name && c.child_name.toLowerCase() === childKey.toLowerCase()) ||
            (c.key && c.key.toLowerCase() === childKey.toLowerCase()) ||
            (c._id === childKey)
          );

          if (match) {
            console.log(`✅ Resolved '${childKey}' to ID: ${match._id}`);
            resolutionCache.current[cacheKey] = match._id;
            return match._id;
          }
        }

        resolutionCache.current[cacheKey] = childKey;
        return childKey;
      } catch (e) {
        console.error("❌ Failed to resolve child ID:", e);
        return childKey;
      }
    };

    // 1. Fetch Deep Data for a specific path using Resolved ID
    const fetchDeepData = async (mainId: string, subId: string, realChildId: string) => {
      try {
        let url = '';
        // STRICT check for subId
        if (subId && subId !== 'null' && subId !== 'undefined') {
          // Updated: Uses realChildId now
          url = `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/child/${realChildId}/deep`;
        } else {
          // Main category path
          url = `${baseUrl}/api/product-listing/main/${mainId}/child/${realChildId}/deep`;
        }

        console.log(`ðŸ“¡ Fetching Deep Data: ${url}`);
        const res = await axios.get(url, {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN!,
          },
        });
        if (res.data?.success && (res.data?.data || res.data?.message)) {
          return res.data.data || res.data.message;
        }
      } catch (e) {
        console.error("Failed to fetch deep data", e);
      }
      return null;
    };

    // 2. Recursive Search for Item in Deep Data
    const findItemInDeepData = (deepData: any, itemId: string, itemDeepId: string, itemName: string) => {
      if (!deepData || typeof deepData !== 'object') return null;

      for (const key of Object.keys(deepData)) {
        const category = deepData[key];
        if (!category || typeof category !== 'object') continue;

        // Check correctness of this item
        // Priority: documentId matching item.deepId
        const isMatch =
          (category.documentId && String(category.documentId) === String(itemDeepId)) ||
          String(category.documentId) === String(itemId) ||
          key === String(itemId) ||
          (category.firstTitle && category.firstTitle.toLowerCase() === itemName.toLowerCase());

        if (isMatch) return category;

        // Check Sub-Deep Children
        if (category.subDeepChildCategory && typeof category.subDeepChildCategory === 'object') {
          for (const subKey of Object.keys(category.subDeepChildCategory)) {
            const sub = category.subDeepChildCategory[subKey];
            const isSubMatch =
              (sub.documentId && String(sub.documentId) === String(itemDeepId)) ||
              String(sub.documentId) === String(itemId) ||
              subKey === String(itemId) ||
              (sub.firstTitle && sub.firstTitle.toLowerCase() === itemName.toLowerCase());

            if (isSubMatch) return sub;
          }
        }
      }
      return null;
    };

    // Process all cart items - 🛡️ Fix reordering using map + Promise.all result
    const enriched = await Promise.all(cartItems.map(async (item) => {
      // 🎯 Return from cache if valid (quantities and ID must match)
      if (enrichmentCache.current[item.id] && enrichmentCache.current[item.id].quantity === item.quantity) {
        return enrichmentCache.current[item.id];
      }

      let freshItem = { ...item };

      try {
        if (item.mainId && item.childKey) {
          const realChildId = await resolveChildId(item.mainId || '', item.subId || '', item.childKey || '');
          const deepData = await fetchDeepData(item.mainId || '', item.subId || '', realChildId);
          const lookupId = item.deepId || item.id || item.documentId;
          const foundService = findItemInDeepData(deepData, String(item.id), String(lookupId), item.name || '');

          if (foundService) {
            freshItem.image = foundService.image || foundService.imageUrl || foundService.imageUri || foundService.photo || foundService.webviewUrl || item.image;
            freshItem.firstTitle = foundService.firstTitle || foundService.title || item.name;
            freshItem.name = freshItem.firstTitle;
            freshItem.secondTitle = foundService.secondTitle || (foundService.features && foundService.features.length > 0 ? foundService.features[0] : '');
            freshItem.description = '';

            freshItem.gst = parseSafeNumber(foundService.gst);
            freshItem.gstType = (foundService.gstType || foundService.gst_type || 'include').toString().toLowerCase();
            freshItem.discountType = foundService.discountType || 'fixed';
            freshItem.discountValue = parseSafeNumber(foundService.discountValue);

            freshItem.originalPrice = foundService.originalPrice ? String(foundService.originalPrice) : null;
            freshItem.price = (() => {
              const orig = parseSafeNumber(freshItem.originalPrice);
              const dVal = parseSafeNumber(freshItem.discountValue);
              const dType = freshItem.discountType;

              if (orig > 0 && dVal > 0) {
                if (dType === 'percentage' || dType === 'percentage ' || dType.trim() === 'percentage') {
                  return orig - (orig * (dVal / 100));
                }
                return orig - dVal;
              }
              return parseSafeNumber(foundService.currentPrice || foundService.priceAfterGst || item.price);
            })();
            freshItem.priceAfterGst = parseSafeNumber(foundService.priceAfterGst || freshItem.price);
            freshItem.deepId = foundService.documentId || String(foundService.id);
          } else {
            if (!freshItem.image) freshItem.image = '/placeholder-service.jpg';
          }
        }
      } catch (err) {
        console.error(`❌ Error updating item ${item.name}:`, err);
      }

      enrichmentCache.current[item.id] = freshItem;
      return freshItem;
    }));

    setEnrichedItems(enriched);
    setIsRefreshingCart(false);
  };



  const enrichmentTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 🛡️ Debounce enrichment to prevent jitter during rapid quantity changes
    if (enrichmentTimer.current) clearTimeout(enrichmentTimer.current);

    enrichmentTimer.current = setTimeout(() => {
      fetchEnrichedCartItems();
    }, 400);

    return () => {
      if (enrichmentTimer.current) clearTimeout(enrichmentTimer.current);
    };
  }, [cartItems]);

  const fetchCancellationPolicies = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';
      const res = await axios.get(`${baseUrl}/api/cancellation-policy`, {
        headers: { 'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token' }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCancellationPolicies(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch cancellation policies", error);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0) {
      router.push('/');
    } else if (cartItems.length > 0) {
      fetchCancellationPolicies();
    }
  }, [cartItems, isCartLoading, router]);


  // --- Address Management Integration ---

  const fetchAddresses = async () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    if (!userId || !authToken) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await axios.get(`${baseUrl}/api/users/${userId}/address`, {
        headers: { 'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token' }
      });

      if (res.data && res.data.success && res.data.data) {
        // API returns object: { "id1": {...}, "id2": {...} } -> Convert to Array
        const addressMap = res.data.data;
        const addressList = Object.keys(addressMap).map(key => {
          const raw = addressMap[key];
          const houseNo = raw.houseNo || "";
          const area = raw.area || raw.address || "";
          const landmark = raw.landMark || raw.landmark || "";
          const label = raw.label || "Home";
          const lat = raw.lat || 0;
          const lng = raw.lng || 0;
          return {
            id: key,
            houseNo,
            area,
            landmark,
            label,
            lat,
            lng,
            fullAddress: `${houseNo ? houseNo + ', ' : ''}${area}${landmark ? ' (Near ' + landmark + ')' : ''}`
          };
        });

        setSavedAddresses(addressList);

        // Auto-select logic
        const lastSelectedId = localStorage.getItem('lastSelectedAddressId');
        if (addressList.length > 0) {
          if (lastSelectedId) {
            const found = addressList.find((a: any) => a.id === lastSelectedId);
            if (found) {
              setSelectedAddressObject(found);
              return;
            }
          }
          // Default to first if no selection
          if (!selectedAddressObject) {
            setSelectedAddressObject(addressList[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNewAddress = async (newAddress: any) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Optimistic UI Update (optional, but safer to wait for API)
    // setSavedAddresses([...savedAddresses, newAddress]); 

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const payload = {
        houseNo: newAddress.houseNo || "",
        area: newAddress.area || "",
        label: newAddress.label || "Home",
        landMark: newAddress.landmark || "",
        lat: newAddress.lat || 0,
        lng: newAddress.lng || 0
      };

      const res = await axios.post(`${baseUrl}/api/users/${userId}/address`, payload, {
        headers: { 'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token' }
      });

      if (res.data && res.data.success) {
        // Refresh list to get the real ID from backend
        await fetchAddresses();

        // If API returns the new ID, we could select it immediately, 
        // but fetchAddresses might overwrite. 
        // Let's assume fetchAddresses puts it in the list.
        // We can try to find the match by content or just select the last one?
        // Better: The API response 'data' often contains the created object with ID.
        if (res.data.data && res.data.data.addressId) {
          const addedAddress = { ...payload, id: res.data.data.addressId };
          handleSelectAddress(addedAddress);
          fetchAddresses();
        }
        setShowAddAddressSheet(false);
      } else {
        showToast("Failed to save address: " + (res.data.message || "Unknown error"), 'error');
      }
    } catch (error: any) {
      console.error("Add Address Error:", error);
      showToast("Error saving address: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleEditAddress = async (updatedAddress: any) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !updatedAddress.id) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const payload = {
        houseNo: updatedAddress.houseNo || "",
        area: updatedAddress.area || "",
        label: updatedAddress.label || "Home",
        phoneNumber: userDetails.mobile || "", // API requirement
        landMark: updatedAddress.landmark || "",
        lat: updatedAddress.lat,
        lng: updatedAddress.lng
      };

      const res = await axios.put(`${baseUrl}/api/users/${userId}/address/${updatedAddress.id}`, payload, {
        headers: { 'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token' }
      });

      if (res.data && res.data.success) {
        await fetchAddresses();
        setShowAddAddressSheet(false);
        setEditingAddress(null);
      } else {
        showToast("Failed to update address", 'error');
      }
    } catch (error) {
      console.error("Edit Address Error:", error);
      showToast("Error updating address", 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    showConfirm('Delete Address', 'Are you sure you want to delete this address?', async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        await axios.delete(`${baseUrl}/api/users/${userId}/address/${addressId}`, {
          headers: { 'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token' }
        });

        const updatedList = savedAddresses.filter(a => a.id !== addressId);
        setSavedAddresses(updatedList);

        if (selectedAddressObject?.id === addressId) {
          setSelectedAddressObject(updatedList.length > 0 ? updatedList[0] : null);
          localStorage.removeItem('lastSelectedAddressId');
        }
        showToast('Address deleted successfully', 'success');
      } catch (error) {
        console.error("Delete Error:", error);
        showToast('Failed to delete address', 'error');
      }
    });
  };

  const handleSaveNewAddress = (address: any) => {
    // Wrapper to match Prop signature if needed, or mostly used for direct integration
    handleAddNewAddress(address);
  };

  // Select Address handler
  const handleSelectAddress = (address: any) => {
    setSelectedAddressObject(address);
    // Sync current location and address for instant global update
    if (address.lat && address.lng) {
      setCurrentLocation({ lat: String(address.lat), lng: String(address.lng) });
    }
    if (address.area || address.fullAddress) {
      setCurrentAddress(address.area || address.fullAddress);
    }
    localStorage.setItem('lastSelectedAddressId', address.id);
  };

  const handleOpenEditMode = (address: any) => {
    setEditingAddress(address);
    setShowAddAddressSheet(true);
  };

  // Dynamic Dates
  const todayDate = new Date();
  const dates = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate().toString(),
      fullDate: d.toLocaleDateString('en-GB')
    };
  });

  const times = [
    '08:00 AM', '08:30 AM', '09:00 AM',
    '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM',
    '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM',
    '06:30 PM', '07:00 PM', '07:30 PM',
    '08:00 PM', '08:30 PM', '09:00 PM'
  ];
  const tips = [20, 50, 100, 'Custom'];

  const calculateTotals = () => {
    let totalMRP = 0; // True Original Price Sum
    let itemTotal = 0; // Selling Price Sum (includes inclusive taxes)
    let extraExclusiveGST = 0; // GST to be added on top
    let includedGSTForDisplay = 0; // GST already inside itemTotal

    const itemsToCalculate = enrichedItems.length > 0 ? enrichedItems : cartItems;

    itemsToCalculate.forEach(item => {
      const price = parseSafeNumber(item.price || item.currentPrice || 0); // Active Selling base price
      const mrp = parseSafeNumber(item.originalPrice || price); // Original MRP price (crossed out)
      const qty = parseSafeNumber(item.quantity || 1);
      const itemGst = parseSafeNumber(item.gst || 0);
      const isExclusive = (item.gstType || 'inclusive').toLowerCase() === 'exclusive';

      totalMRP += mrp * qty;
      itemTotal += price * qty;
    });

    // 1. Total Normal Discount
    const normalDiscount = Math.max(0, totalMRP - itemTotal);

    // 2. Coupon Logic
    let couponDiscountAmount = 0;
    if (couponCode && couponCode.toUpperCase() === "FESTIVAL50") {
      couponDiscountAmount = 50;
    } else if (couponCode && couponCode.toUpperCase() === "WELCOME100") {
      couponDiscountAmount = 100;
    }
    couponDiscountAmount = Math.min(couponDiscountAmount, itemTotal);
    const priceAfterCoupon = itemTotal - couponDiscountAmount;

    // Calculate Taxes accurately based on proportion after coupon is applied
    itemsToCalculate.forEach(item => {
      const price = parseSafeNumber(item.price || item.currentPrice || 0);
      const qty = parseSafeNumber(item.quantity || 1);
      const itemGst = parseSafeNumber(item.gst || 0);
      const isExclusive = (item.gstType || 'inclusive').toLowerCase() === 'exclusive';

      const itemTotalValue = price * qty;
      const itemRatio = itemTotal > 0 ? (itemTotalValue / itemTotal) : 0;
      const finalItemCost = priceAfterCoupon * itemRatio;

      if (isExclusive) {
        extraExclusiveGST += finalItemCost * (itemGst / 100);
      } else {
        const baseWithoutTax = finalItemCost / (1 + (itemGst / 100));
        includedGSTForDisplay += (finalItemCost - baseWithoutTax);
      }
    });

    // 3. Platform / Convenience Fee
    const platformFee = 0;

    // 4. Total Tip
    const tipAmount = selectedTip ? parseSafeNumber(selectedTip) : 0;

    // 5. Grand Final Total Calculation
    // Grand Total = (Selling Price after coupon) + (Any Extra Exclusive GST) + Platform Fee + Tip
    const grandTotal = priceAfterCoupon + extraExclusiveGST + platformFee + tipAmount;

    return {
      totalMRP: Math.round(totalMRP),
      discount: Math.round(normalDiscount),
      itemTotal: Math.round(itemTotal),        // Price after normal discount
      couponDiscount: Math.round(couponDiscountAmount),
      convenienceFee: platformFee,
      taxes: Math.round(extraExclusiveGST), // EXTRA tax user pays
      includedTaxes: Math.round(includedGSTForDisplay), // For display info only
      tip: tipAmount,
      grandTotal: Math.round(grandTotal)
    };
  };

  const totals = useMemo(() => calculateTotals(), [cartItems, enrichedItems, selectedTip, couponCode]);



  const [showPaymentModeSheet, setShowPaymentModeSheet] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState(''); // Store QR code string from Paygic
  const [advancePercentage, setAdvancePercentage] = useState(0);

  // Fetch Advanced Payment Configuration
  useEffect(() => {
    const fetchAdvancedPaymentConfig = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await axios.get(`${baseUrl}/api/advanced-payment`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
          }
        });

        if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const config = res.data.data[0];
          if (config.percentage) {
            setAdvancePercentage(Number(config.percentage));
            console.log("âœ… Advanced Payment Config Loaded:", config.percentage + "%");
          }
        }
      } catch (err) {
        console.error("âš ï¸ Failed to fetch advanced payment config:", err);
      }
    };
    fetchAdvancedPaymentConfig();
  }, []);

  // Removed mock ADMIN_ADVANCE_PERCENT. Now using advancePercentage state.

  const handleProceedToPay = async () => {
    console.log("ðŸš€ handleProceedToPay called", {
      mobile: userDetails.mobile,
      hasAddressObj: !!selectedAddressObject,
      currentAddress: currentAddress,
      loadingUserData
    });

    // âœ… STEP 1: Check if user is logged in
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      console.error("âŒ USER NOT LOGGED IN");
      showToast('Please login first to book a service!', 'warning');
      // Show auth modal or redirect to login
      return;
    }

    // âœ… STEP 2: Verify user exists in backend
    try {
      console.log("ðŸ” Verifying user in backend...");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userCheckRes = await axios.get(`${baseUrl}/api/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
        }
      });

      if (!userCheckRes.data || !userCheckRes.data.success) {
        console.error("âŒ USER NOT FOUND IN BACKEND");
        showToast('Your account was not found. Please login again.', 'error');
        // Clear invalid credentials
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
        return;
      }

      console.log("âœ… User verified in backend:", userCheckRes.data.data?.mobile || userId);
    } catch (userErr: any) {
      console.error("âŒ Backend user verification failed:", userErr);
      showToast('Unable to verify your account. Please login again.', 'error');
      // Clear potentially invalid credentials
      localStorage.removeItem('userId');
      localStorage.removeItem('authToken');
      return;
    }

    if (!userDetails.mobile) {
      console.warn("âš ï¸ Mobile missing");
      showToast('Mobile number is required. Please update your profile.', 'warning');
      return;
    }

    // Loosen regex slightly to allow various formats if needed, or just warn
    if (!/^[0-9]{10}$/.test(userDetails.mobile)) {
      console.warn("âš ï¸ Mobile invalid format:", userDetails.mobile);
      // alert('ðŸ“± Please enter a valid 10-digit mobile number in your profile.');
      // return; 
    }

    if (!selectedAddressObject && !currentAddress) {
      console.warn("âš ï¸ Address missing");
      showToast('Please select a service address before proceeding.', 'warning');
      setShowAddAddressSheet(true);
      return;
    }

    // Strict Location Check - Latitude/Longitude must be present
    const hasLat = selectedAddressObject?.lat || currentLocation?.lat;
    const hasLng = selectedAddressObject?.lng || currentLocation?.lng;

    if (!hasLat || !hasLng || hasLat === "0.00" || hasLng === "0.00") {
      console.warn("âš ï¸ Coordinates missing");
      showToast('Location coordinates (GPS) are required. Please allow location access.', 'warning');
      return;
    }

    console.log("âœ… All validations passed - Opening Payment Mode Sheet");
    setShowPaymentModeSheet(true);
  };

  // Confirm Payment Mode Selection
  // amountType: 'FULL' | 'ADVANCE' | 'CASH'
  const handlePaymentModeConfirm = async (amountType: 'FULL' | 'ADVANCE' | 'CASH') => {
    setShowPaymentModeSheet(false);

    // Calculate Amount to Pay Now
    let payableAmount = 0;

    if (amountType === 'FULL') {
      payableAmount = totals.grandTotal;
    } else if (amountType === 'ADVANCE') {
      payableAmount = Math.round((totals.grandTotal * advancePercentage) / 100);
    } else if (amountType === 'CASH') {
      payableAmount = 0;
    }

    console.log(`Payment Mode Selected: ${amountType}, Payable: ${payableAmount}`);

    if (payableAmount === 0 && amountType === 'CASH') {
      // Direct Booking (COD)
      await confirmDirectBooking('CASH');
    } else {
      // Online Payment
      await startOnlinePayment(payableAmount, amountType === 'FULL' ? 'FULL' : 'ADVANCE');
    }
  };

  const confirmDirectBooking = async (mode: string) => {
    const addressStr = selectedAddressObject?.area || selectedAddressObject?.fullAddress || currentAddress || "";
    console.log("ðŸ“ Order ID Address Source:", addressStr || "DEFAULT (LKO)");
    const cityCode = getCityCode(addressStr);
    let orderId = "";
    try {
      // 1. Get Global Pan-India Number from Backend
      // 1. Get Global Pan-India Number from Backend (no-cache to prevent duplicates)
      const idRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/order/generate-order-id?t=${Date.now()}`, {
        headers: {
          'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (idRes.data && idRes.data.success) {
        // 2. Format: SER + CityCode + 5-digit padded number
        const globalNumber = parseInt(idRes.data.orderId || idRes.data.lastDigit || "0");
        const paddedNumber = String(globalNumber).padStart(5, '0');
        orderId = `SER${cityCode}${paddedNumber}`;
      } else {
        throw new Error("Failed to generate Order ID");
      }
    } catch (e) {
      console.error("Failed to generate ID:", e);
      showToast('Unable to generate Order ID. Please try again.', 'error');
      return;
    }

    // Create Order directly with 0 paid (Cash on Service - Payment PENDING)
    await checkPaymentStatus(orderId, 0, totals.grandTotal, null, 'PENDING', '');
  };

  const startOnlinePayment = async (amountToPay: number, paymentType: 'FULL' | 'ADVANCE') => {
    try {
      console.log('âœ… Payment data ready:', userDetails);
      const addressStr = selectedAddressObject?.area || selectedAddressObject?.fullAddress || currentAddress || "";
      console.log("ðŸ“ Order ID Address Source:", addressStr || "DEFAULT (LKO)");
      const cityCode = getCityCode(addressStr);

      // Fetch Smart Order ID (Global Pan-India Counter)
      let orderId = "";
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

      try {
        const idRes = await axios.get(`${baseUrl}/api/order/generate-order-id?t=${Date.now()}`, {
          headers: {
            'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (idRes.data && idRes.data.success) {
          // Format: SER + CityCode + 5-digit padded number
          const globalNumber = parseInt(idRes.data.orderId || idRes.data.lastDigit || "0");
          const paddedNumber = String(globalNumber).padStart(5, '0');
          orderId = `SER${cityCode}${paddedNumber}`;
        } else {
          throw new Error("Failed to generate Order ID from backend");
        }
      } catch (idErr) {
        console.error("Failed to generate Smart Order ID:", idErr);
        showToast('Unable to generate Order ID. Please try again.', 'error');
        return;
      }

      console.log("ðŸ†” Generated Unique Order ID:", orderId);

      console.log("ðŸ“¤ Initiating DIRECT Payment to Paygic...");

      const MID = "BIJLIWALAA";
      const PASSWORD = "MtIzH1$uuIJ0";

      try {
        // STEP 1: Generate Merchant Token (Direct to Paygic)
        console.log("ðŸ” [STEP 1] Generating Merchant Token...");
        const tokenRes = await axios.post(
          "https://server.paygic.in/api/v3/createMerchantToken",
          {
            mid: MID,
            password: PASSWORD,
            expiry: false
          }
        );

        if (!tokenRes.data.status || !tokenRes.data.data?.token) {
          throw new Error("Failed to generate merchant token");
        }

        const merchantToken = tokenRes.data.data.token;
        console.log("âœ… Token Generated:", merchantToken.substring(0, 20) + "...");

        // STEP 2: Create Payment Request (Direct to Paygic)
        console.log("\nðŸ’³ [STEP 2] Creating Payment Request...");
        const paymentPayload = {
          mid: MID,
          amount: amountToPay,
          merchantReferenceId: orderId,
          customer_name: userDetails.name || 'Customer',
          customer_email: userDetails.email || 'customer@example.com',
          customer_mobile: userDetails.mobile,
          callbackUrl: `${window.location.origin}/payment-callback`
        };
        console.log("ðŸ“¦ Payment Payload:", paymentPayload);

        const paymentRes = await axios.post(
          "https://server.paygic.in/api/v2/createPaymentRequest",
          paymentPayload,
          {
            headers: {
              token: merchantToken
            }
          }
        );

        const data = paymentRes.data;
        console.log('ðŸ“¥ Paygic Payment Response:', data);

        if (data.status && data.statusCode === 200) {
          // Paygic returns data in nested 'data' object
          const paymentData = data.data || {};

          // Store payment response
          setPaymentResponse({
            paygicReferenceId: paymentData.paygicReferenceId || paymentData.refId,
            merchantReferenceId: paymentData.merchantReferenceId || orderId,
            intent: paymentData.intent || paymentData.upiIntent,
            qr: paymentData.qr || paymentData.qrCode || paymentData.upiIntent,
            gpay: paymentData.gpay,
            phonePe: paymentData.phonePe,
            paytm: paymentData.paytm,
            expiry: paymentData.expiry
          });

          // Check if QR Code is available
          const qrData = paymentData.qr || paymentData.qrCode || paymentData.upiIntent;
          if (qrData) {
            setQrCode(qrData);
            setShowQR(false);
            console.log("âœ… QR Data received:", qrData);
          }

          setShowPaymentSheet(true);

          // Start polling for status
          const merchantRef = paymentData.merchantReferenceId || orderId;
          const paygicRef = paymentData.paygicReferenceId || paymentData.refId;

          if (merchantRef) {
            startPaymentStatusPolling(
              merchantRef,
              amountToPay,
              paygicRef
            );
          }
        } else {
          throw new Error(data.msg || data.error || 'Failed to create payment request');
        }
      } catch (error: any) {
        console.error('ðŸ’¥ Payment Proxy Error:', error);
        showToast('Payment Error: ' + (error.response?.data?.error || error.message), 'error');
        setShowPaymentSheet(false);
      }
    } catch (err: any) {
      isProcessingOrder.current = false; // Reset lock on error
      console.error("ðŸ’¥ Payment Error:", err);
      setPaymentError(err.response?.data?.error || err.message || "Unknown error");
      setShowPaymentFailure(true);
    }
  };




  // Helper
  const getCityCode = (addressStr: string) => {
    if (!addressStr) return "LKO";
    const lowerAddr = addressStr.toLowerCase();

    const cityMap: { [key: string]: string } = {
      // Uttar Pradesh Districts (Priority)
      "aligarh": "ALG",
      "ambedkar nagar": "AMB",
      "amethi": "AME",
      "amroha": "AMR",
      "auraiya": "AUR",
      "ayodhya": "AYD",
      "faizabad": "AYD",
      "azamgarh": "AZM",
      "baghpat": "BGP",
      "bahraich": "BHR",
      "ballia": "BAL",
      "balrampur": "BLR",
      "banda": "BND",
      "barabanki": "BRB",
      "bareilly": "BRL",
      "basti": "BST",
      "bhadohi": "BHD",
      "bijnor": "BJN",
      "budaun": "BDN",
      "bulandshahr": "BLS",
      "chandauli": "CHD",
      "chitrakoot": "CHT",
      "deoria": "DEO",
      "etah": "ETH",
      "etawah": "ETW",
      "farrukhabad": "FRK",
      "fatehpur": "FTP",
      "firozabad": "FRZ",
      "gautam buddha nagar": "GBN",
      "noida": "GBN",
      "ghaziabad": "GZB",
      "ghazipur": "GZP",
      "gonda": "GND",
      "gorakhpur": "GKP",
      "hamirpur": "HMR",
      "hapur": "HPR",
      "hardoi": "HRD",
      "hathras": "HTR",
      "jalaun": "JLN",
      "jaunpur": "JNP",
      "jhansi": "JHS",
      "kannauj": "KNJ",
      "kanpur dehat": "KPD",
      "kanpur nagar": "KPN",
      "kanpur": "KPN",
      "kasganj": "KSG",
      "kaushambi": "KSB",
      "kushinagar": "KSN",
      "lakhimpur": "LKH",
      "lalitpur": "LTP",
      "maharajganj": "MRJ",
      "mahoba": "MHB",
      "mainpuri": "MNP",
      "mathura": "MTH",
      "mau": "MAU",
      "meerut": "MRT",
      "mirzapur": "MRZ",
      "moradabad": "MBD",
      "muzaffarnagar": "MZN",
      "pilibhit": "PLB",
      "pratapgarh": "PTG",
      "prayagraj": "PRY",
      "allahabad": "PRY",
      "prayag": "PRY",
      "rae bareli": "RBL",
      "raebareli": "RBL",
      "rampur": "RMP",
      "saharanpur": "SHP",
      "sambhal": "SMB",
      "sant kabir nagar": "SKN",
      "shahjahanpur": "SJP",
      "shamli": "SHM",
      "shravasti": "SRV",
      "siddharthnagar": "SDN",
      "sitapur": "STP",
      "sonbhadra": "SBD",
      "sultanpur": "SLN",
      "unnao": "UNO",

      // Major Indian Metros & Capitals
      "mumbai": "MUM",
      "navi mumbai": "MUM",
      "delhi": "DEL",
      "new delhi": "DEL",
      "kolkata": "KOL",
      "calcutta": "KOL",
      "chennai": "MAA",
      "madras": "MAA",
      "bangalore": "BLR",
      "bengaluru": "BLR",
      "hyderabad": "HYD",
      "secunderabad": "HYD",
      "pune": "PUN",
      "ahmedabad": "AMD",
      "lucknow": "LKW",
      "jaipur": "JAI",
      "surat": "SUR",
      "nagpur": "NAG",
      "indore": "IND",
      "thane": "THA",
      "bhopal": "BHO",
      "visakhapatnam": "VSK",
      "vizag": "VSK",
      "patna": "PAT",
      "vadodara": "VAD",
      "ludhiana": "LUD",
      "coimbatore": "CBE",
      "agra": "AGR",
      "madurai": "MDU",
      "nashik": "NAS",
      "vijayawada": "VIJ",
      "faridabad": "FAR",
      "rajkot": "RAJ",
      "kalyan": "KAL",
      "dombivli": "KAL",
      "vasai virar": "VAS",
      "varanasi": "VNS",
      "srinagar": "SRI",
      "aurangabad": "AUR",
      "dhanbad": "DHA",
      "amritsar": "AMR",
      "ranchi": "RAN",
      "jabalpur": "JAB",
      "gwalior": "GWA",
      "jodhpur": "JOD",
      "raipur": "RAI",
      "kota": "KOT",
      "guwahati": "GUW",
      "chandigarh": "CHD",
      "thiruvananthapuram": "TRV",
      "trivandrum": "TRV",
      "bhubaneswar": "BBU",
      "dehradun": "DEH",
      "shimla": "SHM",
      "gangtok": "GAN",
      "imphal": "IMP",
      "itanagar": "ITA",
      "shillong": "SHI",
      "kohima": "KOH",
      "agartala": "AGA",
      "aizawl": "AIZ",
      "panaji": "PAN",
      "goa": "PAN",
      "pondicherry": "PON",
      "puducherry": "PON",
      "kochi": "COK",
      "ernakulam": "COK",
      "mysore": "MYS",
      "mysuru": "MYS",
      "mangalore": "MNG",
      "mangaluru": "MNG",
      "gurgaon": "GGN",
      "gurugram": "GGN"
    };



    for (const city in cityMap) {
      if (lowerAddr.includes(city)) {
        return cityMap[city];
      }
    }
    return "LKW";
  };


  const startPaymentStatusPolling = (
    merchantReferenceId: string,
    expectedPaidAmount: number,
    paygicRefId: string
  ) => {

    const MID = "BIJLIWALAA";
    const PASSWORD = "MtIzH1$uuIJ0";

    const maxAttempts = 60;
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        // DIRECT STATUS CHECK TO PAYGIC
        console.log(`\nðŸ”„ [POLLING ATTEMPT ${attempts}/${maxAttempts}] Checking status for: ${merchantReferenceId}`);

        // Step 1: Generate Token
        const tokenRes = await axios.post(
          "https://server.paygic.in/api/v3/createMerchantToken",
          {
            mid: MID,
            password: PASSWORD,
            expiry: false
          }
        );

        if (!tokenRes.data.status || !tokenRes.data.data?.token) {
          console.error("âŒ Token generation failed during polling");
          return;
        }

        const merchantToken = tokenRes.data.data.token;

        // Step 2: Check Payment Status
        const statusRes = await axios.post(
          "https://server.paygic.in/api/v2/checkPaymentStatus",
          {
            mid: MID,
            merchantReferenceId: merchantReferenceId
          },
          {
            headers: {
              token: merchantToken
            }
          }
        );

        const rawResponse = statusRes.data;
        console.log("  - Raw Paygic Response:", JSON.stringify(rawResponse, null, 2));

        if (rawResponse.status && rawResponse.statusCode === 200) {
          const status = String(rawResponse.txnStatus || '').toUpperCase().trim();
          const apiMessage = rawResponse.msg || rawResponse.message || '';

          console.log("  - Extracted Status:", status);
          console.log("  - API Message:", apiMessage);

          if (status === 'SUCCESS') {
            clearInterval(pollInterval);
            setShowPaymentSheet(false);
            const pending = totals.grandTotal - expectedPaidAmount;

            // Extract paygicReferenceId and UTR from response
            const finalPaygicId = rawResponse.data?.paygicReferenceId || rawResponse.paygicReferenceId || paygicRefId || "UNKNOWN_PAYGIC_ID";
            const utr = rawResponse.data?.utr || rawResponse.data?.utrNumber || rawResponse.data?.UTR || "";
            console.log("\nâœ…âœ…âœ… PAYMENT SUCCESS DETECTED âœ…âœ…âœ…");
            console.log("  - Paygic Reference ID:", finalPaygicId);
            console.log("  - UTR Number:", utr);
            console.log("  - Amount Paid:", expectedPaidAmount);
            console.log("  - Amount Pending:", pending);
            console.log("\nðŸš€ Calling checkPaymentStatus with SUCCESS...");

            await checkPaymentStatus(merchantReferenceId, expectedPaidAmount, pending, finalPaygicId, 'SUCCESS', utr);

          } else if (['FAILED', 'FAIL', 'CANCELLED', 'REJECTED', 'DECLINED', 'FAILURE'].includes(status)) {
            clearInterval(pollInterval);
            setShowPaymentSheet(false);

            // Extract paygicReferenceId even for failed payments
            const finalPaygicId = rawResponse.data?.paygicReferenceId || rawResponse.paygicReferenceId || paygicRefId || "UNKNOWN_PAYGIC_ID";
            console.log("\nâŒâŒâŒ PAYMENT FAILED âŒâŒâŒ");
            console.log("  - Paygic Reference ID:", finalPaygicId);
            console.log("  - Failure Status:", status);
            console.log("  - Error Message:", apiMessage);
            console.log("\nðŸš€ Calling checkPaymentStatus with FAIL...");

            // Save failed payment to backend too
            await checkPaymentStatus(merchantReferenceId, expectedPaidAmount, totals.grandTotal - expectedPaidAmount, finalPaygicId, 'FAIL', '');

            // Map common error messages
            let errorMsg = apiMessage || "Payment failed. Please try again.";
            const lowMsg = errorMsg.toLowerCase();

            if (lowMsg.includes('balance') || lowMsg.includes('insufficient') || lowMsg.includes('limit')) {
              errorMsg = "Account me balance kam hai ya limit exceed ho gayi hai. Kripya balance check karein ya dusra bank use karein.";
            } else if (lowMsg.includes('pin') || lowMsg.includes('credentials') || lowMsg.includes('auth')) {
              errorMsg = "Galat UPI PIN dala gaya hai. Kripya sahi PIN ke saath fir se koshish karein.";
            } else if (status === 'CANCELLED' || lowMsg.includes('cancel')) {
              errorMsg = "Payment cancel kar di gayi hai. Dubara try karein.";
            } else if (lowMsg.includes('bank') || lowMsg.includes('issuer') || lowMsg.includes('decline')) {
              errorMsg = "Bank ki taraf se payment reject ho gayi hai. Kripya dusra payment method try karein.";
            }

            setPaymentError(errorMsg);
            setShowPaymentFailure(true);
          } else if (status === 'PENDING') {
            console.log("â³ Payment still PENDING at Paygic...");
            // Keep polling
          }
        }

      } catch (error: any) {
        console.error('Status polling error:', error.message || error);
        // Do not stop polling immediately on network error, but maybe log it
      }


      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        isProcessingOrder.current = false; // Reset lock on timeout
        setShowPaymentSheet(false);
        setPaymentError("Payment verification timed out. If money was debited, it will be refunded or updated shortly.");
        setShowPaymentFailure(true);
      }
    }, 3000); // Poll every 3 seconds

  };

  const checkPaymentStatus = async (
    merchantReferenceId: string,
    paidAmount: number = 0,
    pendingAmount: number = 0,
    paygicRefId: string | null = null,
    paymentStatus: string = 'PENDING',
    utrNumber: string = '',
  ) => {
    try {
      console.log("🔍 FINALIZING OPTIMIZED ORDER:", merchantReferenceId);
      const userId = localStorage.getItem('userId') || 'UNKNOWN_USER';

      // 🛡️ Lock check to prevent duplicate orders
      if (isProcessingOrder.current) {
        console.log("⚠️ Order processing already in progress, skipping duplicate call.");
        return;
      }
      isProcessingOrder.current = true;

      const generateJobOTP = () => {
        const numbers = Math.floor(1000 + Math.random() * 9000).toString();
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetters = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
        return `${numbers}${randomLetters}`;
      };

      const currentBookDate = new Date().toLocaleDateString('en-GB');
      const currentBookTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let finalScheduleDate = "";
      const selectedDateObj = dates.find(d => d.date === selectedDate);
      finalScheduleDate = selectedDateObj ? selectedDateObj.fullDate : currentBookDate;

      const finalAddress = selectedAddressObject || {
        area: currentAddress || "LKW, Uttar Pradesh",
        lat: currentLocation?.lat || "26.8467",
        lng: currentLocation?.lng || "80.9462",
        fullAddress: currentAddress || ""
      };

      const grandTotal = paidAmount + pendingAmount;
      const totalTipValue = Number(selectedTip || 0);

      // 1. serviceDetails logic
      const serviceDetailsObj: any = {};
      cartItems.forEach((it, index) => {
        const itemKey = `item${String(index + 1).padStart(3, '0')}`;
        serviceDetailsObj[itemKey] = {
          mainId: it.mainId || "",
          subId: it.subId || "",
          childKey: it.childKey || "",
          deepId: it.deepId || "",
          subDeepId: it.subDeepId || "",
          title: it.name || it.serviceName || "Service",
          serviceprice: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          imageUrl: it.image || "/placeholder-service.jpg",
          description: it.description || "",
          billing: {
            originalPrice: Number(it.originalPrice || it.price || 0),
            discountAmount: Math.max(0, Number(it.originalPrice || 0) - Number(it.price || 0)),
            sellingPrice: Number(it.price || 0),
            gstPercent: Number(it.gst || 0),
            gstType: it.gstType || 'inclusive',
            quantity: Number(it.quantity || 1),
            couponCode: couponCode || "",
            couponDiscountPrice: totals.couponDiscount || 0
          }
        };
      });

      const paymentModeLabel = paidAmount >= grandTotal && grandTotal > 0 ? "ONLINE" : (paidAmount > 0 ? "ADVANCE" : "CASH");

      const finalPayload: any = {
        serviceId: merchantReferenceId,
        userId: userId,
        metaModels: {
          jobOTP: generateJobOTP(),
          alat: String(finalAddress.lat || currentLocation?.lat || "26.8467"),
          alng: String(finalAddress.lng || currentLocation?.lng || "80.9462"),
          service_type: "scheduled",
          customer_note: instructions || "",
          technician_tip: totalTipValue,
          bookDate: currentBookDate,
          bookTime: currentBookTime,
          orderId: merchantReferenceId,
          jobStatus: "pending",
          totalAmount: grandTotal,
          addressDetails: {
            id: selectedAddressObject?.id || "6999ffa3ff782f764905c2f1",
            houseNo: selectedAddressObject?.houseNo || "",
            area: selectedAddressObject?.area || "Lucknow",
            landmark: selectedAddressObject?.landmark || "",
            label: selectedAddressObject?.label || "Home",
            lat: Number(finalAddress.lat || 26.8467),
            lng: Number(finalAddress.lng || 80.9462),
            fullAddress: selectedAddressObject?.fullAddress || finalAddress.area || "Lucknow"
          },
          amountPaid: paidAmount,
          amountPending: pendingAmount,
          scheduleDate: finalScheduleDate,
          scheduleTime: selectedTime || "08:00 AM"
        },
        paymentBeforeService: {
          amountPaid: paidAmount,
          amountPending: pendingAmount,
          payment_status: paymentStatus.toUpperCase(),
          payment_ref_id: paygicRefId || merchantReferenceId,
          payment_utr_no: utrNumber || "",
          payment_mer_id: merchantReferenceId,
          paymentMode: paymentModeLabel
        },
        serviceDetails: serviceDetailsObj
      };

      console.log("\n🚀 [FINAL PAYLOAD] Ready for MongoDB:");
      console.log("=".repeat(50));
      console.log(JSON.stringify(finalPayload, null, 2));
      console.log("=".repeat(50));

      const authToken = localStorage.getItem('authToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

      const orderResponse = await axios.post(
        `${baseUrl}/api/service/create/${userId}`,
        finalPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-token": process.env.NEXT_PUBLIC_API_TOKEN || "super_secure_token",
            "Authorization": `Bearer ${authToken}`
          }
        }
      );

      if (orderResponse.data && orderResponse.data.success) {
        setSuccessOrderId(merchantReferenceId);
        setSuccessPaymentRefId(paygicRefId || (paidAmount === 0 ? 'CASH' : 'ONLINE'));
        setSuccessUtrNumber(utrNumber || '');
        clearCart();
        setShowSuccess(true);
        setShowPaymentSheet(false);

        let count = 5;
        const timer = setInterval(() => {
          count--;
          if (count <= 0) {
            clearInterval(timer);
            window.location.href = '/';
          }
        }, 1000);
      } else {
        isProcessingOrder.current = false;
        alert(`Order saving failed: ${orderResponse.data.message || 'Server error'}`);
      }
    } catch (err: any) {
      isProcessingOrder.current = false; // 🛡️ CRITICAL: Reset lock on error
      console.error("❌ ORDER CREATION FAILED", err);
      if (err.response?.status === 400) {
        console.warn("⚠️ 400 Bad Request detected - possible duplicate or validation error");
      }
      alert(`Order creation error: ${err.message}. Please try again.`);
    }
  };

  const handleOpenUPI = () => {
    if (!paymentResponse) return;
    const intentUrl = paymentResponse.intent || paymentResponse.qr;
    if (intentUrl) {
      window.location.href = intentUrl;
    } else {
      alert("No UPI intent found.");
    }
  };

  const handleViewServiceDetail = (service: any) => {
    // Map enriched item back to what BottomSheet expects
    const mapped = {
      id: service.id,
      documentId: service.deepId || service.documentId,
      firstTitle: service.title || service.name,
      secondTitle: service.secondTitle || '',
      currentPrice: service.price,
      originalPrice: service.originalPrice,
      gst: service.gst,
      gstType: service.gstType,
      image: service.image
    };
    setSelectedServiceForDetail(mapped);
  };

  const handleServiceQuantity = (service: any, change: number) => {
    if (change === -1 && (service.quantity || 0) <= 0) return;

    if (change === 1) {
      const { quantity, ...itemData } = service;
      // Safety fallback for subId
      if (!itemData.subId) itemData.subId = localStorage.getItem('subId') || '';
      addToCart(itemData);
    } else {
      removeFromCart(service.id);
    }
  };

  const handleRemoveService = (id: string) => {
    showConfirm('Remove Service', 'Are you sure you want to remove this service?', () => {
      deleteFromCart(id);
    });
  };

  const handleTipSelect = (tip: number | string) => {
    if (tip === "Custom") {
      const val = prompt("Enter tip (₹):", "50");
      if (val) {
        const cleaned = parseSafeNumber(val);
        if (cleaned > 0) setSelectedTip(cleaned);
      }
    } else {
      setSelectedTip(parseSafeNumber(tip));
    }
  };

  const formatCurrency = (amount: any) => {
    const num = parseSafeNumber(amount);
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  if (cartItems.length === 0) {
    return null; // Redirecting...
  }

  return (
    <div className={`min-h-screen font-sans flex justify-center w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`relative flex h-[100dvh] w-full max-w-md flex-col overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Sticky Top Section */}
        <div className="sticky top-0 z-20">
          {/* Header */}
          <header className={`flex items-center px-3 py-3 shadow-sm gap-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={() => router.back()}
              className={`flex size-8 shrink-0 items-center justify-center rounded-full transition ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <LocationHeader
              label={selectedAddressObject?.label || (currentAddress ? "Current Location" : "Select Location")}
              address={selectedAddressObject?.area || currentAddress || "Tap to select address"}
              onClick={() => setShowAddAddressSheet(true)}
              darkMode={darkMode}
            />
            {/* User Profile Section */}
            <div className="flex items-center">
              {/* Lottie Animation (Always Visible as 'Buddy') */}
              <div className="h-14 w-14 ml-1 flex items-center justify-center shrink-0">
                <Lottie
                  animationData={userFallbackAnimation}
                  loop={true}
                  className="w-full h-full"
                />
              </div>

              {/* User Profile Image (Visible if available) */}
              {(userDetails as any)?.image && (
                <div className="h-10 w-10 ml-2 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm overflow-hidden">
                  <img src={(userDetails as any).image} alt="User" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </header>

          {/* Verified Banner (Now Sticky) */}
          <div className={`${darkMode ? 'bg-yellow-500/10 border-t border-yellow-500/20' : 'bg-yellow-50'} px-4 py-2 flex items-center justify-center gap-2 border-b border-yellow-100`}>
            <img src="/bijli_logo.png" alt="Bijli Wala Aaya" className="h-5 w-auto object-contain mix-blend-multiply" />
            <p className={`${darkMode ? 'text-yellow-500' : 'text-yellow-700'} text-[10px] font-bold uppercase tracking-wide`}>100% Verified Professionals & Safe Service</p>
          </div>
        </div>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 overflow-y-auto pb-8 scrollbar-hide"
        >
          <div className="mt-4 px-4 space-y-4">
            {/* Selected Services */}
            <h3 className={`text-base font-bold px-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Selected Services</h3>

            {isRefreshingCart && enrichedItems.length === 0 ? (
              <BookingSummarySkeleton darkMode={darkMode} />
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {(enrichedItems.length > 0 ? enrichedItems : cartItems).map((enriched, index) => {
                  // IMPORTANT: Always take quantity from context, not enrichment cache to keep it optimistic
                  const service = {
                    ...enriched,
                    quantity: cartItems.find(ci => ci.id === enriched.id)?.quantity || enriched.quantity || 1
                  };

                  return (
                    <motion.div
                      key={service.id || `fallback_${service.name}_${index}`} // 🔑 High-Stability key
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex gap-4 p-3 rounded-xl shadow-sm border relative overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex flex-col gap-2 shrink-0 w-24">
                        <div
                          className="bg-center bg-no-repeat bg-contain rounded-lg w-20 h-20 mx-auto flex items-center justify-center overflow-hidden border border-gray-100"
                          style={{
                            backgroundImage: service.image ? `url("${service.image}")` : 'url("/bijli_logo.png")'
                          }}
                        />
                        <button
                          onClick={() => handleViewServiceDetail(service)}
                          className={`mt-1 w-full py-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 transition-all uppercase tracking-tight ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                        >
                          <Eye size={12} strokeWidth={2.5} /> Details
                        </button>

                        <div className="mt-auto pt-2 border-t border-gray-100/10">
                          <p className={`text-[9px] opacity-50 ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-bold uppercase tracking-tighter`}>Service Total</p>
                          <div className="flex flex-col leading-none mt-0.5">
                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {(() => {
                                const price = Number(service.price);
                                const qty = Number(service.quantity);
                                return formatCurrency(price * qty); // Pure base selling price
                              })()}
                            </span>
                            {service.originalPrice && Number(service.originalPrice) > Number(service.price) && (
                              <span className="text-[10px] line-through opacity-40 font-medium decoration-[#ef4444]/40 mt-0.5">
                                {(() => {
                                  const mrp = Number(service.originalPrice);
                                  const qty = Number(service.quantity);
                                  return formatCurrency(mrp * qty); // Pure real MRP
                                })()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col ml-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-bold leading-tight line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{service.title || service.name}</p>
                        </div>

                        {/* Detailed Price & Tax Breakdown Per Item */}
                        <div className="flex flex-col gap-1 mt-2">
                          {/* Base Total Calculation */}
                          <div className="flex items-center justify-between text-[10px] opacity-60">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              Base Price ({formatCurrency(Number(service.price))}) × {service.quantity}
                            </span>
                            <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {formatCurrency(Number(service.price) * Number(service.quantity))}
                            </span>
                          </div>

                          {/* Detailed GST Calculation */}
                          <div className="flex items-center justify-between text-[10px] opacity-50 italic">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              GST ({service.gst || 0}%) - {service.gstType === 'exclusive' ? 'Extra' : 'Included'}
                            </span>
                            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {(() => {
                                const price = Number(service.price);
                                const gst = Number(service.gst || 0);
                                const qty = Number(service.quantity);
                                let amount = 0;
                                if (service.gstType === 'exclusive') {
                                  amount = (price * (gst / 100)) * qty;
                                  return `(Breakdown) + ${formatCurrency(amount)}`; // Extra tax
                                } else {
                                  const base = price / (1 + (gst / 100));
                                  amount = (price - base) * qty;
                                  return `(Breakdown) ${formatCurrency(amount)}`; // Extracted part
                                }
                              })()}
                            </span>
                          </div>

                          <div className="h-px w-full bg-gray-200/10 my-1" />

                          {/* Saved Tag positioned to fill the middle area */}
                          {(service.originalPrice && Number(service.originalPrice) > Number(service.price)) && (
                            <div className="mt-1 flex justify-end">
                              <div className={`inline-flex text-[9px] font-black items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm ${darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-500/15'
                                }`}>
                                <Tag size={10} fill="currentColor" className="opacity-70 shrink-0" />
                                <span className="leading-none tracking-tighter">
                                  Saved {formatCurrency((Number(service.originalPrice) - Number(service.price)) * Number(service.quantity))} on this service
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {(() => {
                          const matchingPartners = nearbyPartners.filter(p => {
                            // Relax skill check for now to ensure visibility of real technicians
                            const hasSkill = true;

                            // --- LENIENT CITY/DISTRICT MATCH ---
                            const addrToSearch = (selectedAddressObject?.area || selectedAddressObject?.fullAddress || currentAddress || gpsAddress || "").toLowerCase();
                            const partnerDistrict = (p.location?.district || "").toLowerCase();

                            const userCity = getCityCode(addrToSearch);
                            const partnerCity = getCityCode(partnerDistrict);

                            // Match if cities are same, or if district matches address string, or if partner has no district set
                            const locationMatch = !partnerDistrict || !userCity || !partnerCity ||
                              userCity === partnerCity ||
                              addrToSearch.includes(partnerDistrict);

                            return hasSkill && locationMatch;
                          });

                          if (matchingPartners.length === 0) return null;

                          // Calculate minimum ETA among matching partners
                          let minTime = 999;
                          matchingPartners.forEach(p => {
                            if (p.live_status?.location) {
                              const eta = calculateETA(p.live_status.location.lat, p.live_status.location.lng);
                              if (eta && eta < minTime) minTime = eta;
                            }
                          });

                          return (
                            <div className={`mt-3 py-2 px-3 rounded-xl border flex items-center justify-between transition-all hover:shadow-md ${darkMode ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50/50 border-yellow-200/50'
                              }`}>
                              <div className="flex items-center gap-2">
                                <div className="relative flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
                                  <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
                                </div>
                                <div className="flex flex-col leading-none">
                                  <span className={`text-[10px] font-bold uppercase tracking-tight ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    {minTime === 999 ? 'ETA: 10-15' : `ETA: ${minTime}`} MINS
                                  </span>
                                  <span className="text-[8px] opacity-60 font-medium uppercase tracking-tighter">Instant Professional Hub</span>
                                </div>
                              </div>

                              {/* Avatar Stack */}
                              <div className="flex items-center -space-x-2.5 rtl:space-x-reverse">
                                {matchingPartners.slice(0, 3).map((p, i) => {
                                  const profileUrl = p.profile_url ? (
                                    p.profile_url.startsWith('http')
                                      ? p.profile_url
                                      : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in'}${p.profile_url.startsWith('/') ? '' : '/'}${p.profile_url}`
                                  ) : null;

                                  return (
                                    <div key={p.partnerId || i} className={`w-7 h-7 rounded-full border-2 overflow-hidden shadow-sm ${darkMode ? 'border-gray-800' : 'border-white'}`}>
                                      {profileUrl ? (
                                        <img
                                          src={profileUrl}
                                          alt={p.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // Fallback if image fails
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.classList.add('bg-yellow-400', 'flex', 'items-center', 'justify-center');
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size: 8px; font-weight: 900; color: black">${p.name.charAt(0)}</span>`;
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-[8px] font-black text-black">
                                          {p.name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {matchingPartners.length > 3 && (
                                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[8px] font-black shadow-sm ${darkMode ? 'bg-gray-700 border-gray-800 text-yellow-400' : 'bg-yellow-100 border-white text-yellow-700'
                                    }`}>
                                    +{matchingPartners.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Quantity Controls at Bottom Right */}
                        <div className="flex items-center justify-end gap-3 mt-auto pt-4">
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className={`flex items-center scale-90 origin-right rounded-xl border p-1 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                            }`}>
                            <button
                              onClick={() => handleServiceQuantity(service, -1)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'
                                }`}
                            >
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className={`mx-3 text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{service.quantity}</span>
                            <button
                              onClick={() => handleServiceQuantity(service, 1)}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700`}
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <ServiceDetailBottomSheet
            service={selectedServiceForDetail}
            isOpen={!!selectedServiceForDetail}
            onClose={() => setSelectedServiceForDetail(null)}
          />




          {/* Schedule Service */}
          <div className="mt-6 px-4">
            <h3 className={`text-base font-bold px-1 mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>When should the professional arrive?</h3>
            <div className={`p-4 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex gap-3">
                {/* Instant Pill */}
                <button
                  onClick={() => { setScheduleMode('instant'); setShowScheduleSheet(true); }}
                  className={`flex-1 h-14 rounded-full flex flex-col items-center justify-center transition-all shadow-md active:scale-95 ${scheduleMode === 'instant'
                    ? 'bg-yellow-500 text-black border-2 border-yellow-500'
                    : (darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-500 border border-gray-100')
                    }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight uppercase">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Instant
                  </div>
                  <span className="text-[10px] opacity-70 mt-0.5 leading-none">Within 60 mins</span>
                </button>

                {/* Schedule Pill */}
                <button
                  onClick={() => { setScheduleMode('later'); setShowScheduleSheet(true); }}
                  className={`flex-[1.2] min-w-0 h-14 rounded-full flex flex-col items-center justify-center transition-all shadow-md active:scale-95 ${scheduleMode === 'later'
                    ? 'bg-yellow-500 text-black border-2 border-yellow-500'
                    : (darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-500 border border-gray-100')
                    }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight uppercase">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Schedule
                  </div>
                  <span className="text-[10px] opacity-70 mt-0.5 leading-none truncate w-full text-center px-4">
                    {scheduleMode === 'later'
                      ? `${dates.find(d => d.date === selectedDate)?.day || ''} ${selectedDate}, ${selectedTime}`
                      : 'Select Time'}
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 px-1 text-center">Tap above to change schedule time</p>
            </div>
          </div>

          {/* Service Instructions */}
          <div className="mt-6 px-4">
            <h3 className={`text-base font-bold px-1 mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Service Instructions</h3>
            <textarea
              className={`w-full rounded-xl border text-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 resize-none placeholder-gray-400 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder="Add notes for the professional (e.g., Gate code, Call upon arrival)"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          {/* Offers & Benefits */}
          <div className="mt-6 px-4">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className={`text-base font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Offers & Benefits</h3>
              <button className="text-xs text-yellow-600 font-bold uppercase hover:underline">View All Coupons</button>
            </div>
            <div className={`p-4 rounded-xl shadow-sm border border-yellow-200 relative overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-lg">local_offer</span>
                  </div>
                  <input
                    className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 placeholder-gray-400 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
                <button className="h-11 px-6 rounded-lg bg-yellow-500 text-black font-bold text-sm shadow-md shadow-yellow-500/20 hover:bg-yellow-600 transition-colors active:scale-95">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Tip your Technician */}
          <div className="mt-6 px-4">
            <h3 className={`text-base font-bold px-1 mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Tip your Technician</h3>
            <div className={`p-4 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your kindness means a lot! 100% of the tip goes directly to the technician.</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {tips.map((tip) => (
                  <button
                    key={tip}
                    onClick={() => handleTipSelect(tip)}
                    className={`flex-1 min-w-[60px] py-2 rounded-lg border text-sm transition-all ${selectedTip === tip || (tip === 20 && selectedTip === null)
                      ? 'border-yellow-500 bg-yellow-500 text-black font-bold'
                      : `${darkMode ? 'border-gray-600 text-gray-300 hover:border-yellow-500' : 'border-gray-300 text-gray-600 hover:border-yellow-500 hover:bg-yellow-50'}`
                      }`}
                  >
                    {tip === 'Custom' ? 'Edit' : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-6 px-4 mb-4" id="payment-summary">
            <div className={`rounded-xl shadow-sm border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-base font-bold mb-3 border-b pb-2 ${darkMode ? 'text-gray-100 border-gray-700' : 'text-gray-800 border-gray-200'}`}>Payment Summary</h3>

              {/* 1. Total MRP */}
              <div className="flex justify-between items-center mb-1.5">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total MRP</p>
                <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.totalMRP)}</p>
              </div>

              {/* 2. Total Discount (MRP - Service/Selling Price) */}
              {totals.discount > 0 && (
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-xs text-green-600">Total Discount</p>
                  <p className="text-xs font-medium text-green-600">-{formatCurrency(totals.discount)}</p>
                </div>
              )}

              {/* 3. Service Selling Price (Base Rate) */}
              <div className="flex justify-between items-center mb-1.5">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Service Selling Price</p>
                <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.itemTotal)}</p>
              </div>

              {/* 4. Coupon Code Discount */}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-xs text-blue-600">Coupon Discount</p>
                  <p className="text-xs font-medium text-blue-600">-{formatCurrency(totals.couponDiscount)}</p>
                </div>
              )}

              {/* 5. Checkout Fees & GST */}
              <div className="flex justify-between items-center mb-1.5">
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Platform Fee</p>
                <p className="text-xs font-bold text-green-600">Free</p>
              </div>

              <div className="flex justify-between items-center mb-1.5">
                <div className={`text-xs flex flex-col ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Taxes & Fee
                  {totals.includedTaxes > 0 ? (
                    <span className="text-[9px] font-normal leading-tight opacity-70 mt-0.5">
                      (Incl. {formatCurrency(totals.includedTaxes)} in base price)
                    </span>
                  ) : (
                    <span className="text-[9px] font-normal leading-tight opacity-70 mt-0.5">
                      Additional GST applied
                    </span>
                  )}
                </div>
                <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.taxes)}</p>
              </div>

              {/* Optional: Add Tip rendering here if > 0 */}
              {totals.tip > 0 && (
                <div className="flex justify-between items-center mb-1.5">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Technician Tip</p>
                  <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.tip)}</p>
                </div>
              )}

              {(totals.discount > 0 || totals.couponDiscount > 0) && (
                <div className={`mt-2 p-2 rounded text-center text-[10px] font-bold ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
                  You are saving {formatCurrency(totals.discount + totals.couponDiscount)} on this order!
                </div>
              )}

              <div className={`flex justify-between items-center pt-3 border-t border-dashed mt-3 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Grand Total</p>
                <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totals.grandTotal)}</p>
              </div>

              {advancePercentage > 0 && (
                <>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <p className={`text-xs font-medium text-yellow-600`}>Payable Now ({advancePercentage}% Advance)</p>
                    <p className={`text-xs font-bold text-yellow-600`}>{formatCurrency(Math.round((totals.grandTotal * advancePercentage) / 100))}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs text-gray-500`}>Pay on Service Delivery</p>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatCurrency(totals.grandTotal - Math.round((totals.grandTotal * advancePercentage) / 100))}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cancellation Policy */}
          {
            cancellationPolicies.length > 0 && (
              <div className="px-4 mt-2 mb-6">
                <h3 className={`text-base font-bold px-1 mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {cancellationPolicies[0]?.title || 'Cancellation Policy'}
                </h3>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {cancellationPolicies[0]?.description || 'Please review our cancellation terms before booking.'}
                  </p>
                  <button
                    onClick={() => setShowCancellationSheet(true)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Read More
                  </button>
                </div>
              </div>
            )
          }
        </motion.main>

        {/* Bottom Payment Bar */}
        <div className={`sticky bottom-0 w-full border-t p-4 shadow-lg z-20 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total to pay</span>
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={`total-${totals.grandTotal}`}
                  initial={{ scale: 1.15, color: '#22c55e' }}
                  animate={{ scale: 1, color: darkMode ? '#ffffff' : '#111827' }}
                  transition={{ duration: 0.35 }}
                  className="text-xl font-bold leading-tight"
                >
                  {formatCurrency(totals.grandTotal)}
                </motion.span>
                {totals.totalMRP > totals.grandTotal && (
                  <span className="text-xs line-through opacity-40 font-medium text-red-500">
                    {formatCurrency(totals.totalMRP)}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] text-yellow-600 font-medium cursor-pointer hover:underline underline-offset-2"
                onClick={() => setShowBillDetails(true)}
              >
                View detailed bill
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                  openModal('auth');
                  return;
                }
                handleProceedToPay();
              }}
              disabled={loadingUserData}
              className={`flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${loadingUserData ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{loadingUserData ? 'Loading...' : 'Proceed to Payment'}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bill Details Sheet */}
      <BillDetailsSheet
        isOpen={showBillDetails}
        onClose={() => setShowBillDetails(false)}
        totals={totals}
        items={(enrichedItems.length > 0 ? enrichedItems : cartItems).map((item: any) => ({
          id: item.id || item._id || item.documentId || Math.random().toString(),
          name: item.title || item.name || item.serviceName || 'Service Item',
          price: item.price || item.currentPrice || 0,
          originalPrice: item.originalPrice || item.mrp || item.price || 0,
          quantity: item.quantity || 1,
          gst: item.gst || 0,
          gstType: item.gstType || 'inclusive',
        }))}
        darkMode={darkMode}
      />

      {/* Payment Mode Sheet */}
      < PaymentModeSheet
        isOpen={showPaymentModeSheet}
        onClose={() => setShowPaymentModeSheet(false)}
        onConfirm={handlePaymentModeConfirm}
        totals={totals}
        advancePercentage={advancePercentage}
        darkMode={darkMode}
      />

      {/* Unified Add Address Sheet */}
      < AddAddressSheet
        isOpen={showAddAddressSheet}
        onClose={() => {
          setShowAddAddressSheet(false);
          setEditingAddress(null);
        }}
        onSelectAddress={handleSelectAddress}
        onAddNewAddress={handleAddNewAddress}
        onEditAddress={handleEditAddress}
        onDeleteAddress={handleDeleteAddress}
        savedAddresses={savedAddresses}
        darkMode={darkMode}
        editingAddress={editingAddress}
      />

      {/* Schedule Selection Sheet */}
      {
        showScheduleSheet && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowScheduleSheet(false)}
            />
            <div className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up max-h-[90vh] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>

              <div className={`px-5 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>When should the professional arrive?</h3>
                <button
                  onClick={() => setShowScheduleSheet(false)}
                  className={`p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-5 overflow-y-auto scrollbar-hide space-y-6 pb-safe">
                {/* Appointment Type Options */}
                <div className="space-y-4">
                  {/* Instant Option (Disabled as per design) */}
                  <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all opacity-60 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">bolt</span>
                        <span className="font-bold text-gray-400">Instant</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">In 60 mins</p>
                      <p className="text-xs text-yellow-600 font-medium mt-1">Unavailable at the moment</p>
                    </div>
                  </div>

                  {/* Schedule for later Option (Active) */}
                  <div className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${darkMode ? 'bg-yellow-500/5 border-yellow-500' : 'bg-yellow-50 border-yellow-500'}`}>
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-600 text-lg">calendar_month</span>
                        <span className="font-bold text-gray-900 dark:text-white">Schedule for later</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">Select your preferred day & time</p>
                    </div>
                  </div>
                </div>

                {/* Date Selection Grid-like Cards */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
                    {dates.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className={`flex flex-col items-center justify-center min-w-[75px] py-3.5 rounded-xl border-2 transition-all ${selectedDate === d.date
                          ? 'border-blue-600 bg-white shadow-sm'
                          : `${darkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-100 bg-white text-gray-900'}`
                          }`}
                      >
                        <span className={`text-[11px] font-bold mb-1 ${selectedDate === d.date ? 'text-gray-900' : 'opacity-60'}`}>{d.day}</span>
                        <span className={`text-xl font-black ${selectedDate === d.date ? 'text-gray-900' : ''}`}>{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Banner */}
                <div className={`flex items-center gap-3 p-3.5 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <span className="material-symbols-outlined text-gray-500 text-xl font-light">payments</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Online payment only for selected date</p>
                </div>

                {/* Time Selection Grid */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Select start time of service</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {times.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`flex items-center justify-center h-12 rounded-xl border transition-all text-xs font-bold ${selectedTime === t
                          ? 'border-yellow-500 bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                          : `${darkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-white text-gray-600'}`
                          }`}
                      >
                        {t}
                        {selectedTime === t && (
                          <div className="absolute top-1 right-1">
                            <span className="material-symbols-outlined text-[14px] text-black">check_circle</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} bg-white dark:bg-gray-800`}>
                <button
                  onClick={() => setShowScheduleSheet(false)}
                  className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold rounded-xl transition shadow-lg shadow-yellow-500/20 active:scale-[0.98] uppercase tracking-wide text-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Payment Failure Popup */}
      <PaymentFailurePopup
        isOpen={showPaymentFailure}
        onClose={() => setShowPaymentFailure(false)}
        onRetry={() => {
          setShowPaymentFailure(false);
          handleProceedToPay();
        }}
        errorMsg={paymentError}
        darkMode={darkMode}
      />

      {/* Success Overlay */}
      {
        showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center transform transition-all scale-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Thank you for your booking. <br />
                Your Order ID is <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{successOrderId}</span>
              </p>

              {successPaymentRefId !== 'CASH' && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-6 w-full text-left">
                  <p className="text-xs text-gray-500 mb-1">Payment Reference ID</p>
                  <p className="font-mono text-sm font-semibold">{successPaymentRefId}</p>
                  {successUtrNumber && (
                    <>
                      <p className="text-xs text-gray-500 mt-2 mb-1">UTR / Bank Ref</p>
                      <p className="font-mono text-sm font-semibold">{successUtrNumber}</p>
                    </>
                  )}
                </div>
              )}

              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${(countdown / 5) * 100}%` }}></div>
              </div>

              <p className="text-xs text-gray-400 mb-4">Redirecting to home in {countdown}s...</p>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition"
              >
                Go to Home Now
              </button>
            </div>
          </div>
        )
      }

      {/* Cancellation Policy Sheet */}
      {
        showCancellationSheet && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCancellationSheet(false)}
            />
            <div className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up max-h-[80vh] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>

              <div className={`px-5 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {cancellationPolicies[0]?.title || 'Cancellation Policy'}
                </h3>
                <button
                  onClick={() => setShowCancellationSheet(false)}
                  className={`p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {cancellationPolicies.map((policy, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {policy.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowCancellationSheet(false)}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition shadow-lg shadow-yellow-500/20"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Material Icons and Animation Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
