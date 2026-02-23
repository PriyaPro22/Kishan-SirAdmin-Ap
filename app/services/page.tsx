'use client';
// ðŸ”’ CODE LOCKED. PASSWORD REQUIRED: 224123. DO NOT EDIT WITHOUT AUTH.


import { ArrowLeft, Search, Bell, Star, Clock, Plus, Minus, Home, Grid3x3, ShoppingCart, User, ChevronRight, Play, X, Percent, Eye, Moon, Sun, Loader2, Pause, Wrench, ArrowRight, Settings, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaSlider } from '../components/MediaSlider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import dynamic from 'next/dynamic';
import Lottie from 'lottie-react';
import clockAnim from '../../public/animations/clock.json';
import warrantyAnim from '../../public/animations/safe-done.json';
import { ServiceGridSkeleton } from '../components/ServiceCardSkeleton';
import { Skeleton } from '../components/Skeleton';

// Dynamic imports for heavy components
const ServiceDetailBottomSheet = dynamic(() => import('../components/ServiceDetailBottomSheet'), {
  loading: () => <div className="p-4 text-center">Loading...</div>,
  ssr: false
});
const RateCardSheet = dynamic(() => import('../components/RateCardSheet'), { ssr: false });
const WarrantyBottomSheet = dynamic(() => import('../components/WarrantyBottomSheet'), { ssr: false });


// 🛡️ Safe Number Parser
const parseSafeNumber = (val: any) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

export default function ServicesPage() {
  const router = useRouter();
  const [activeService, setActiveService] = useState<string>('');
  const [activeServiceKey, setActiveServiceKey] = useState<string>('');

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { darkMode } = useApp();


  // New state for animated buttons
  const [expandedButtons, setExpandedButtons] = useState<string[]>([]);

  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [buttonRipple, setButtonRipple] = useState<{ x: number, y: number, id: string } | null>(null);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<any>(null); // State for BottomSheet
  const [showRateCard, setShowRateCard] = useState(false);
  const [showWarrantySheet, setShowWarrantySheet] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isManualScroll = useRef(false);
  const cancelManualScrollRef = useRef<NodeJS.Timeout | null>(null);

  // ðŸ”¥ Banner Slider State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = [
    {
      id: 1,
      title: "15% OFF",
      subtitle: "Instant cashback on cards",
      tag: "HDFC Offer",
      gradient: "from-blue-600 to-blue-900",
      tagColor: "text-blue-100"
    },
    {
      id: 2,
      title: "FLAT ₹100",
      subtitle: "Use Code: FIRST100",
      tag: "New User",
      gradient: "from-green-600 to-green-900",
      tagColor: "text-green-100"
    },
    {
      id: 3,
      title: "20% OFF",
      subtitle: "On Annual AC Service",
      tag: "Summer Special",
      gradient: "from-orange-500 to-red-600",
      tagColor: "text-orange-100"
    },
    {
      id: 4,
      title: "FREE CHECK",
      subtitle: "Weekend Rush Offer",
      tag: "Limited Time",
      gradient: "from-purple-600 to-indigo-900",
      tagColor: "text-purple-100"
    },
    {
      id: 5,
      title: "COMBO SAVER",
      subtitle: "AC + Fan Service @ ₹499",
      tag: "Super Saver",
      gradient: "from-pink-600 to-rose-900",
      tagColor: "text-pink-100"
    },
    {
      id: 6,
      title: "FLASH DEAL",
      subtitle: "Extra 5% on Online Pay",
      tag: "Happy Hour",
      gradient: "from-teal-600 to-emerald-900",
      tagColor: "text-teal-100"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 4 banners total, showing 2 at a time => 2 pages (index 0 and 1)
      setCurrentBannerIndex((prev) => (prev + 1) % Math.ceil(banners.length / 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ðŸ”¥ Filter state - initially "All" to show all data
  // ðŸ”¥ Filter state - initially "All" to show all data
  // ðŸ”¥ Filter state - initially "All" to show all data
  const [serviceFilter, setServiceFilter] = useState<'All' | 'Services' | 'Installation' | 'Repair'>('All');
  const [headerTitle, setHeaderTitle] = useState('Services');

  // Header title is now set by API in fetchChildCategories()
  // No need for localStorage monitoring anymore


  // ðŸ”¥ API States
  const [childCategories, setChildCategories] = useState<any>(null);
  const [pageMedia, setPageMedia] = useState<any[]>([]); // Media from separate API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicesData, setServicesData] = useState<any[]>([]); // Unified services data


  // ðŸ”¥ GLOBAL CART INTEGRATION
  const { cartItems, addToCart, removeFromCart } = useCart();

  // Calculate quantities from global cart
  const quantities = useMemo(() => {
    const qtyMap: { [key: string]: number } = {};
    cartItems.forEach(item => {
      const qty = Number(item.quantity) || 0;

      // 1. Map by absolute ID
      qtyMap[String(item.id)] = qty;

      // 2. Map by deepId if available
      if (item.deepId) {
        qtyMap[String(item.deepId)] = qty;

        // 3. Map by Base ID (stripping suffixes like _8oiA)
        // This handles the mismatch where Backend adds suffix but Frontend uses Base Key
        const parts = String(item.deepId).split('_');
        if (parts.length > 1) {
          // Only map the base if it looks like a suffix scenario
          // Avoid colliding with legitimate underscores if possible, but for these random suffixes it's necessary
          qtyMap[parts[0]] = qty;
        }
      }

      // 4. Map by itemKey (server key) if available
      if (item.itemKey) {
        qtyMap[item.itemKey] = qty;
      }
    });
    return qtyMap;
  }, [cartItems]);


  // Helper to update quantity using global cart
  const updateQuantity = (serviceId: string, change: number) => {
    console.log(`ðŸ”„ ========== UPDATE QUANTITY CALLED ==========`);
    console.log(`Service ID: ${serviceId}`);
    console.log(`Change: ${change > 0 ? '+1' : '-1'}`);
    console.log(`Current quantities:`, quantities);
    console.log(`Current cartItems:`, cartItems);

    const service = servicesData.find(s => s.id === serviceId);
    if (!service) {
      console.warn('âš ï¸ Service not found:', serviceId);
      return;
    }

    if (change > 0) {
      console.log('âž• ADDING TO CART:', service.title);
      const itemToAdd = {
        id: service.id,
        name: service.title,
        price: service.price,
        originalPrice: service.originalPrice,
        discount: service.discount,
        gstRate: service.price > 1000 ? 18 : 5,
        image: service.image || service.deepData?.image?.url || service.imageUrl || null,
        gst: service.gst || 0,
        gstType: service.gstType || 'exclusive',
        priceAfterGst: service.priceAfterGst || service.price,
        discountType: service.discountType || 'fixed',
        discountValue: service.discountValue || 0,
        mainId: service.mainId || localStorage.getItem('mainId') || '',
        subId: service.subId || localStorage.getItem('subId') || '',
        childKey: service.childKey || service.categoryType || 'Service',
        deepId: service.deepId || (service.isDeepData ? service.id : null),
        subDeepId: service.subDeepId || null
      };
      console.log('Item being added:', itemToAdd);
      addToCart(itemToAdd);
      console.log('âœ… addToCart called');
    } else {
      console.log('âž– REMOVING FROM CART:', service.title);
      removeFromCart(String(service.id));
      console.log('âœ… removeFromCart called');
    }
    console.log(`========== END UPDATE QUANTITY ==========`);
  };




  // Video state removed (handled by MediaSlider)
  const SCROLL_THRESHOLD = 250;

  // Get IDs from localStorage
  const getMainId = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('mainId');
  };

  const getSubId = () => {
    if (typeof window === 'undefined') return null;
    const subId = localStorage.getItem('subId');
    if (!subId || subId === 'undefined' || subId === 'null') {
      return null;
    }
    return subId;
  };

  const getChildKey = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('childKey') || localStorage.getItem('childId');
  };

  // ðŸ”¥ HELPER FOR HEADERS
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-token': process.env.NEXT_PUBLIC_API_TOKEN || 'super_secure_token'
  });

  // ðŸ”¥ Build API URL based on available IDs
  const buildChildCategoryUrl = () => {
    const mainId = getMainId();
    const subId = getSubId();

    if (!mainId) {
      throw new Error('mainId missing');
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    if (subId) {
      return `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/child`;
    }

    return `${baseUrl}/api/product-listing/main/${mainId}/child`;
  };

  // ðŸ”¥ Fetch Child Categories
  const fetchChildCategories = async (skipLoadingToggle = false) => {
    try {
      if (!skipLoadingToggle) {
        setLoading(true);
        setError(null);
      }

      const mainId = getMainId();
      const subId = getSubId();

      if (!mainId) throw new Error('mainId missing');

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

      // ðŸ†• FETCH CATEGORY NAME FROM API
      try {
        if (subId && subId !== 'undefined' && subId !== 'null') {
          // Fetch sub-category name
          console.log('ðŸ” Fetching sub-category name...');
          const subCatUrl = `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}`;
          const subCatRes = await fetch(subCatUrl, {
            method: 'GET',
            headers: getHeaders(),
          });

          if (subCatRes.ok) {
            const subCatData = await subCatRes.json();
            const subName = subCatData.data?.name || subCatData.data?.serviceName || subCatData.data?.title;
            console.log('âœ… Sub-category name from API:', subName);

            const filterWords = ['Repair', 'Services', 'Service', 'Installation'];
            if (subName && !filterWords.includes(subName)) {
              setHeaderTitle(subName);
              setActiveService(subName);
            }
          }
        } else {
          // Fetch main-category name
          console.log('ðŸ” Fetching main-category name...');
          const mainCatUrl = `${baseUrl}/api/product-listing/main/${mainId}`;
          const mainCatRes = await fetch(mainCatUrl, {
            method: 'GET',
            headers: getHeaders(),
          });

          if (mainCatRes.ok) {
            const mainCatData = await mainCatRes.json();
            const mainName = mainCatData.data?.name || mainCatData.data?.serviceName || mainCatData.data?.title;
            console.log('âœ… Main-category name from API:', mainName);

            const filterWords = ['Repair', 'Services', 'Service', 'Installation'];
            if (mainName && !filterWords.includes(mainName)) {
              setHeaderTitle(mainName);
              setActiveService(mainName);
            }
          }
        }
      } catch (catErr) {
        console.error('âš ï¸ Error fetching category name:', catErr);
      }

      // Original child categories fetch
      let url = (subId && subId !== 'undefined' && subId !== 'null')
        ? `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/child`
        : `${baseUrl}/api/product-listing/main/${mainId}/child`;

      console.log('ðŸ”¥ Fetching child categories from:', url);

      let res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });

      let data = await res.json();
      console.log('ðŸ“¦ API RESPONSE:', data);

      // Store the full response data to keep metadata like childCatVideos
      let responseData = data.data || data;
      let categories = responseData.childCategory || responseData;

      // FALLBACK: sub-child empty â†’ main-child
      if (subId && subId !== 'undefined' && subId !== 'null' && (!categories || Object.keys(categories).length === 0)) {
        console.warn('âš ï¸ Sub-child empty, falling back to main-child');

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const fallbackUrl = `${baseUrl}/api/product-listing/main/${mainId}/child`;
        console.log('ðŸ” Fetching fallback:', fallbackUrl);

        const fallbackRes = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const fallbackData = await fallbackRes.json();
        console.log('ðŸ“¦ FALLBACK RESPONSE:', fallbackData);

        responseData = fallbackData.data || fallbackData;
        categories = responseData.childCategory || responseData;
      }

      console.log('âœ… FINAL Child Categories Data:', responseData);
      setChildCategories(responseData);

      // Return visible categories for chaining
      const categoriesToIterate = responseData.childCategory || responseData;
      const visible: any[] = [];
      if (categoriesToIterate && typeof categoriesToIterate === 'object') {
        const metadataKeys = [
          'childCatVideo', 'childCatVideos', 'childCatMedia',
          'childCatImage', 'childCatImages', 'banners', 'banner',
          '__v', 'createdAt', 'updatedAt', 'visibility', 'Visibility',
          'images', 'videos', 'storyMedia'
        ];
        Object.keys(categoriesToIterate).forEach(key => {
          if (!metadataKeys.includes(key)) {
            const cat = categoriesToIterate[key];
            if (cat && typeof cat === 'object') visible.push({ ...cat, key });
            else if (typeof cat === 'string') visible.push({ name: cat, id: key, key });
          }
        });
      }
      return visible;

    } catch (err: any) {
      console.error('âŒ API Error:', err);
      if (!skipLoadingToggle) setError(err.message);
      return [];
    } finally {
      if (!skipLoadingToggle) setLoading(false);
    }
  };

  // ðŸ”¥ Fetch Page Media (Images/Videos/YouTube)
  const fetchPageMedia = async () => {
    try {
      const mainId = getMainId();
      const subId = getSubId();

      if (!mainId) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      let url = (subId && subId !== 'undefined' && subId !== 'null')
        ? `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/child-category/media`
        : `${baseUrl}/api/product-listing/main/${mainId}/child-category/media`;

      console.log('ðŸ”¥ Fetching page media from:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await res.json();
      console.log('ðŸŽ¥ Page Media Response:', data);

      if (data.success) {
        // The API returns the media object in data.message or data.data
        let mediaItems: any[] = [];
        const mediaData = data.data || data.message || data;

        if (Array.isArray(mediaData)) {
          mediaItems = mediaData;
        } else if (typeof mediaData === 'object') {
          // Handle images (Array or Object)
          if (mediaData.images) {
            if (Array.isArray(mediaData.images)) {
              mediaItems = [...mediaItems, ...mediaData.images];
            } else if (typeof mediaData.images === 'object' && mediaData.images !== null) {
              mediaItems = [...mediaItems, ...Object.values(mediaData.images)];
            }
          }

          // Handle videos (Array or Object)
          if (mediaData.videos) {
            if (Array.isArray(mediaData.videos)) {
              mediaItems = [...mediaItems, ...mediaData.videos];
            } else if (typeof mediaData.videos === 'object' && mediaData.videos !== null) {
              mediaItems = [...mediaItems, ...Object.values(mediaData.videos)];
            }
          }

          // Also push the object itself if it has target fields
          if (mediaData.url || mediaData.image || mediaData.video) mediaItems.push(mediaData);

          // Filter out garbage (strings like 'images', booleans like true)
          mediaItems = mediaItems.filter(item =>
            item &&
            typeof item === 'object' &&
            (item.url || item.image || item.video) &&
            typeof (item.url || item.image || item.video) === 'string' &&
            (item.url || item.image || item.video).length > 10 // Basic length check to avoid "images" string
          );

          console.log('ðŸ“¸ Parsed Media Items (Strict Filter):', mediaItems);
        }

        setPageMedia(mediaItems);
      }
    } catch (err) {
      console.error('âŒ Error fetching page media:', err);
    }
  };

  // Helper to estimate service time based on title/type
  const getEstimatedTime = (title: string, categoryType: string) => {
    const t = title.toLowerCase();
    if (t.includes('installation') || t.includes('install')) return '60-90 mins';
    if (t.includes('jet') || t.includes('pump') || t.includes('foam')) return '45-60 mins';
    if (t.includes('repair') || t.includes('fix')) return '45-60 mins';
    if (t.includes('gas') || t.includes('charge')) return '30-45 mins';
    if (t.includes('visit') || t.includes('inspection')) return '15-30 mins';

    // Default variations based on length to add variety
    const hash = title.length % 3;
    if (hash === 0) return '30-45 mins';
    if (hash === 1) return '45-60 mins';
    return '60-90 mins';
  };

  // Helper to process deep data into services format
  const processDeepData = (deepData: any, categoryName: string, subId?: string, mainId?: string, childKey?: string) => {
    if (!deepData || typeof deepData !== 'object') return [];

    const services: any[] = [];

    for (const deepKey of Object.keys(deepData)) {
      const deepCategory = deepData[deepKey];
      if (!deepCategory || typeof deepCategory !== 'object') continue;

      // Check visibility flags for deep categories
      if (deepCategory.deepCategoryVisible === false || deepCategory.deepCategoryVisible === "false") continue;

      // If title is required but missing, skip
      if ((deepCategory.firstTitleVisible === true || deepCategory.firstTitleVisible === "true") && !deepCategory.firstTitle && !deepCategory.secondTitle) continue;

      // At least one title should exist
      if (!deepCategory.firstTitle && !deepCategory.secondTitle) continue;

      // Build the service object
      const service = {
        id: deepCategory.documentId || deepKey,
        title: deepCategory.firstTitle || deepCategory.secondTitle || `Deep Service ${deepKey}`,
        rating: 4.5,
        warranty: '45 Days Warranty',
        // Dynamic Time logic
        serviceTime: ((deepCategory.minTimeVisible === true || deepCategory.minTimeVisible === "true") && (deepCategory.maxTimeVisible === true || deepCategory.maxTimeVisible === "true"))
          ? `${deepCategory.minTime || '45'}-${deepCategory.maxTime || '60'} mins`
          : (deepCategory.serviceTime || getEstimatedTime(deepCategory.firstTitle || deepCategory.secondTitle || '', categoryName)),
        minTime: deepCategory.minTime,
        maxTime: deepCategory.maxTime,
        minTimeVisible: deepCategory.minTimeVisible === true || deepCategory.minTimeVisible === "true",
        maxTimeVisible: deepCategory.maxTimeVisible === true || deepCategory.maxTimeVisible === "true",
        image: deepCategory.image || deepCategory.imageUrl || deepCategory.imageUri || deepCategory.image?.url || deepCategory.photo || null,
        features: [],
        secondTitle: deepCategory.secondTitle || '',
        description: deepCategory.description || '', // Restore description for BottomSheet
        originalPrice: deepCategory.originalPrice || null,
        discountType: deepCategory.discountType || 'fixed',
        discountValue: deepCategory.discountValue || (deepCategory.discount ? parseFloat(deepCategory.discount) : null),
        price: (() => {
          const orig = parseSafeNumber(deepCategory.originalPrice);
          const dVal = parseSafeNumber(deepCategory.discountValue || (deepCategory.discount ? parseFloat(deepCategory.discount) : 0));
          const dType = deepCategory.discountType || 'fixed';

          if (orig > 0 && dVal > 0) {
            if (dType === 'percentage' || dType === 'percentage ' || dType.trim() === 'percentage') {
              return orig - (orig * (dVal / 100));
            }
            return orig - dVal;
          }
          // 🛡️ User Rule: If no discount, Selling Price = Original Price
          return orig > 0 ? orig : (parseSafeNumber(deepCategory.currentPrice) || 599);
        })(),
        priceAfterGst: deepCategory.priceAfterGst || null,
        gst: deepCategory.gst || deepCategory.gst_rate || deepCategory.gstRate || (Number(deepCategory.currentPrice || deepCategory.priceAfterGst) > 1000 ? 18 : 5),
        gstRate: deepCategory.gstRate || deepCategory.gst || deepCategory.gst_rate || (Number(deepCategory.currentPrice || deepCategory.priceAfterGst) > 1000 ? 18 : 5),
        gstType: (deepCategory.gstType || deepCategory.gst_type || deepCategory.taxType || deepCategory.gstStatus || 'include').toString().toLowerCase(),
        tag: 'NEW',
        categoryType: categoryName,
        mainId: mainId || localStorage.getItem('mainId') || '',
        subId: subId || localStorage.getItem('subId') || '',
        childKey: childKey || '',
        isDeepData: true,
        deepData: deepCategory,
        // Store visibility flags for later use
        photoVisible: deepCategory.photoVisible !== false && deepCategory.photoVisible !== "false",
        videoVisible: deepCategory.videoVisible !== false && deepCategory.videoVisible !== "false",
        imageUrl: (deepCategory.photoVisible !== false && deepCategory.photoVisible !== "false")
          ? (deepCategory.image || deepCategory.imageUri || deepCategory.image?.url || deepCategory.imageUrl || deepCategory.photo)
          : null
      };
      services.push(service);

      // NO LONGER adding sub-categories (Variations) to the main list.
      // They will be handled in the ServiceDetailBottomSheet.
    }
    return services;
  };

  // Helper to process regular services
  const processRegularData = (responseData: any, categoryName: string, subId?: string, mainId?: string, childKey?: string) => {
    let servicesList = [];
    if (responseData && typeof responseData === 'object') {
      if (Array.isArray(responseData)) {
        servicesList = responseData;
      } else if (responseData.services && Array.isArray(responseData.services)) {
        servicesList = responseData.services;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        servicesList = responseData.data;
      } else if (responseData.message && Array.isArray(responseData.message)) {
        servicesList = responseData.message;
      } else {
        servicesList = Object.keys(responseData).map(key => ({
          _id: key,
          ...responseData[key]
        }));
      }
    }

    console.log(`ðŸ” [processRegularData] Found ${servicesList.length} total items for ${categoryName}`);

    const processed = servicesList
      .filter((service: any) => {
        const isVisible = service.Visibility !== false && service.visible !== false && service.isVisible !== false;
        const hasName = service.name || service.title || service.serviceName;
        return isVisible && hasName;
      })
      .map((service: any, index: number) => ({
        id: service._id || service.id || `service-${index}`,
        title: service.name || service.title || service.serviceName,
        rating: service.rating || 4.5,
        features: Array.isArray(service.features) ? service.features : (service.features ? [service.features] : []),
        secondTitle: service.secondTitle || (typeof service.features === 'string' ? service.features : (Array.isArray(service.features) && service.features.length > 0 ? service.features[0] : '')),
        description: service.description || '', // Restore description for BottomSheet
        warranty: service.warranty || '45 Days Warranty',
        serviceTime: service.serviceTime || getEstimatedTime(service.name || service.title || service.serviceName || '', categoryName),
        price: (() => {
          const orig = parseSafeNumber(service.originalPrice);
          const dVal = parseSafeNumber(service.discountValue || (service.discount ? parseFloat(service.discount) : 0));
          const dType = service.discountType || 'fixed';

          if (orig > 0 && dVal > 0) {
            if (dType === 'percentage' || dType === 'percentage ' || dType.trim() === 'percentage') {
              return orig - (orig * (dVal / 100));
            }
            return orig - dVal;
          }
          // 🛡️ User Rule: If no discount, Selling Price = Original Price
          return orig > 0 ? orig : (parseSafeNumber(service.price || service.serviceCharges || service.currentPrice) || 599);
        })(),
        originalPrice: service.originalPrice || null,
        discount: service.discount || null,
        tag: service.tag || null,
        categoryType: categoryName,
        mainId: mainId || localStorage.getItem('mainId') || '',
        subId: subId || localStorage.getItem('subId') || '',
        childKey: childKey || '',
        isDeepData: false,
        image: service.image || service.imageUrl || service.imageUri || service.image?.url || service.photo || null,
        discountType: service.discountType || 'fixed',
        discountValue: service.discountValue || (service.discount ? parseFloat(service.discount) : null),
        gst: service.gst || service.gst_rate || service.gstRate || (Number(service.price) > 1000 ? 18 : 5),
        gstRate: service.gstRate || service.gst || service.gst_rate || (Number(service.price) > 1000 ? 18 : 5),
        gstType: (service.gstType || service.gst_type || service.taxType || service.gstStatus || 'include').toString().toLowerCase()
      }));

    console.log(`âœ… [processRegularData] Returning ${processed.length} visible services for ${categoryName}`);
    return processed;
  };

  // ðŸ”¥ FETCH DATA FOR A SINGLE CATEGORY (Returns promise)
  const fetchCategoryData = async (category: any) => {
    const childId = category.id || category._id;
    const childKey = category.key || category.name;
    const mainId = getMainId();
    const subId = getSubId();

    // Safety check: Skip metadata-looking strings
    const metadataKeywords = ['childCatMedia', 'banners', 'images', 'videos', 'storyMedia'];
    if (metadataKeywords.some(k => String(childId).includes(k) || String(childKey).includes(k))) {
      console.log(`ðŸš« [fetchCategoryData] Skipping metadata fetch for: ${childId}/${childKey}`);
      return [];
    }

    let allServicesForCategory: any[] = [];

    // 1. Try Deep Data First
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const getDeepUrl = (key: string) => {
        if (subId && childKey) return `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/${key}/${childKey}/deep`;
        if (mainId && childKey) return `${baseUrl}/api/product-listing/main/${mainId}/${key}/${childKey}/deep`;
        return '';
      };

      const tryDeepFetch = async (key: string) => {
        const url = getDeepUrl(key);
        if (!url) return null;
        console.log(`ðŸ“¡ [fetchCategoryData] Trying deep path (${key}): ${url}`);
        const res = await fetch(url, {
          method: 'GET',
          headers: getHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.data || data.message)) return data.data || data.message;
        }
        return null;
      };

      // Try 'child' and 'child-key' in parallel to speed up deep data fetching
      const [childRes, childKeyRes] = await Promise.allSettled([
        tryDeepFetch('child'),
        tryDeepFetch('child-key')
      ]);

      let deepData = null;
      if (childRes.status === 'fulfilled' && childRes.value) {
        deepData = childRes.value;
      } else if (childKeyRes.status === 'fulfilled' && childKeyRes.value) {
        console.log(`âš ï¸  [fetchCategoryData] 'child' path failed or missing, using 'child-key'`);
        deepData = childKeyRes.value;
      }

      if (deepData) {
        console.log(`âœ… [fetchCategoryData] Found deep data for ${category.name}`);
        allServicesForCategory = processDeepData(deepData, category.name, subId || undefined, mainId || undefined, childKey || undefined);
      }
    } catch (e) {
      console.error('Deep data fetch error', e);
    }

    // 2. If no deep data, try regular data
    if (allServicesForCategory.length === 0 && childId) {
      // Safety: Don't fetch if childId looks like metadata or a generic name without specific ID context
      const isGuid = /^[0-9a-fA-F]{24}$/.test(childId); // Check if it's a MongoDB ObjectId

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

        // Try 'child' path first (ID based)
        let regularUrl = `${baseUrl}/api/product-listing/child/${childId}`;
        console.log(`ðŸ“¡ [fetchCategoryData] Trying regular path (child): ${regularUrl}`);
        let regRes = await fetch(regularUrl, {
          method: 'GET',
          headers: getHeaders()
        });

        // Fallback to 'child-key' if 404 OR if not a GUID (names usually go to child-key)
        if (regRes.status === 404 || !isGuid) {
          if (regRes.status === 404) console.warn(`âš ï¸ [fetchCategoryData] Regular 'child' path 404, trying 'child-key'`);

          regularUrl = `${baseUrl}/api/product-listing/child-key/${childKey || childId}`;
          console.log(`ðŸ“¡ [fetchCategoryData] Trying name-based path (child-key): ${regularUrl}`);
          regRes = await fetch(regularUrl, {
            method: 'GET',
            headers: getHeaders()
          });
        }

        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData.success) {
            allServicesForCategory = processRegularData(regData.data || regData.message || regData, category.name, subId || undefined, mainId || undefined, childKey || undefined);
          }
        }
      } catch (e) {
        console.error('Regular data fetch error', e);
      }
    }

    console.log(`ðŸ“Š [fetchCategoryData] Total services for ${category.name}: ${allServicesForCategory.length}`);
    return allServicesForCategory;
  };

  // ðŸ”¥ FETCH ALL SERVICES (Parallel)
  const fetchAllServices = async (categories: any[], skipLoadingToggle = false) => {
    if (!skipLoadingToggle) setLoading(true);
    try {
      // Limit concurrent requests if needed, but for now just parallelize
      const promises = categories.map(cat => fetchCategoryData(cat));
      const results = await Promise.all(promises);
      const flatResults = results.flat();
      console.log('âœ… ALL SERVICES FETCHED:', flatResults.length);

      // Stop Re-rendering Issues (DOM Lag): Only update if data actually changed
      setServicesData(prevData => {
        const isDifferent = JSON.stringify(prevData) !== JSON.stringify(flatResults);
        if (isDifferent) {
          console.log('âš™ï¸  Services data changed, updating state...');
          return flatResults;
        }
        return prevData;
      });

    } catch (err) {
      console.error("Error fetching all services", err);
    } finally {
      if (!skipLoadingToggle) setLoading(false);
    }
  };


  // ðŸ”¥ Handle category click - Now just for filtering/UI focus
  const handleCategoryClick = (category: any, event: React.MouseEvent) => {
    console.log('ðŸŽ¯ Category clicked:', category);

    // Get click position for ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Set button ripple effect
    setButtonRipple({ x, y, id: category.key || category.id });

    // Set clicked button for animation
    setClickedButton(category.key || category.id);

    // Trigger button expand animation
    if (!expandedButtons.includes(category.key || category.id)) {
      setExpandedButtons(prev => [...prev, category.key || category.id]);
    }

    // Set active service for UI
    setActiveService(category.name);
    setActiveServiceKey(category.key || category.id);

    // Reset clicked button after animation
    setTimeout(() => {
      setClickedButton(null);
      setButtonRipple(null);
    }, 600);
  };

  // ðŸ”¥ Get visible categories from childCategories object
  const visibleCategories = useMemo(() => {
    if (!childCategories || typeof childCategories !== 'object') return [];

    const visible: any[] = [];
    const categoriesToIterate = childCategories.childCategory || childCategories;

    if (!categoriesToIterate || typeof categoriesToIterate !== 'object') return [];

    const metadataKeys = [
      'childCatVideo', 'childCatVideos', 'childCatMedia',
      'childCatImage', 'childCatImages', 'banners', 'banner',
      '__v', 'createdAt', 'updatedAt', 'visibility', 'Visibility',
      'images', 'videos', 'storyMedia'
    ];

    for (const key of Object.keys(categoriesToIterate)) {
      const category = categoriesToIterate[key];

      // Safety: If it's an array or not an object, skip
      if (!category || typeof category !== 'object' || Array.isArray(category)) {
        continue;
      }

      const catName = category.name || category.serviceName || (typeof key === 'string' ? key : '');

      if (metadataKeys.includes(key) || metadataKeys.some(mk => catName.toLowerCase().includes(mk.toLowerCase()))) {
        continue;
      }

      // Check for an ID or name - if neither, it's likely just metadata
      if (!category._id && !category.name && !category.serviceName) {
        continue;
      }

      const isVisible =
        category.visibility === true ||
        category.visibility === 'true' ||
        category.Visibility === true ||
        category.Visibility === 'true' ||
        category.Visibility === 1 ||
        (category.visibility === undefined && category.Visibility === undefined);

      if (isVisible && (category.name || (typeof key === 'string' && !key.match(/^\d+$/)))) {
        visible.push({
          key: typeof key === 'string' ? key : (category.name || 'Category'),
          id: category._id || key,
          name: category.name || category.serviceName || key,
          imageUrl: category.image || category.imageUri || (category.childCatImages && Object.values(category.childCatImages)[0]) || null,
          media: category.childCatMedia || category.childCatVideos || null
        });
      }
    }

    console.log('ðŸ‘€ Visible categories FINAL:', visible);
    return visible;
  }, [childCategories]);

  // Get story media (Videos or Images)
  const storyMedia = useMemo(() => {
    let media: { type: 'video' | 'image' | 'youtube', url: string }[] = [];

    // 1. Add media from the dedicated API (pageMedia)
    if (pageMedia && pageMedia.length > 0) {
      pageMedia.forEach((item: any) => {
        const url = item.url || item.image || item.video;
        if (!url) return;

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          media.push({ type: 'youtube', url });
        } else if (url.match(/\.(mp4|mov|webm)$/i) || item.type === 'video') {
          media.push({ type: 'video', url });
        } else {
          media.push({ type: 'image', url });
        }
      });
    }

    // 2. Fallback / Additional: Extract key media from childCategories or active category
    // ... (Keep existing logic as secondary source if desired, or relying mainly on API)
    // For now, let's append existing logic as fallback if API returns nothing, or combine.
    // User asked for specific API, so let's prioritize it.

    if (media.length === 0 && childCategories) {
      // ... (Existing extraction logic)
      let extracted: { type: 'video' | 'image' | 'youtube', url: string }[] = [];
      const categoriesToIterate = childCategories.childCategory || childCategories;
      const allCategories = typeof categoriesToIterate === 'object'
        ? Object.keys(categoriesToIterate).map(key => {
          const cat = categoriesToIterate[key];
          return typeof cat === 'object' ? { ...cat, keyName: key } : { keyName: key };
        })
        : [];

      // 1. Helper to extract media from an object
      const extractFromObj = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;

        // Log fields for debugging
        console.log(`ðŸ” Media Check for [${obj.keyName || obj.name || 'obj'}]:`, Object.keys(obj));

        // ðŸ”¥ Handle 'childCatMedia' explicitly (seen in user screenshots)
        if (obj.childCatMedia) {
          const mediaObj = obj.childCatMedia;
          // Recursive call or manual extraction? Manual is safer for specific structure
          if (mediaObj.videos) {
            const vids = Array.isArray(mediaObj.videos) ? mediaObj.videos : Object.values(mediaObj.videos);
            vids.forEach((v: any) => {
              if (v.visibility === false || v.visible === false || v.visibility === 'false') return;
              if (v.url) {
                const type = (v.url.includes('youtube.com') || v.url.includes('youtu.be')) ? 'youtube' : 'video';
                media.push({ type, url: v.url });
              }
            });
          }
          if (mediaObj.images) {
            const imgs = Array.isArray(mediaObj.images) ? mediaObj.images : Object.values(mediaObj.images);
            imgs.forEach((img: any) => {
              if (img.visibility === false || img.visible === false || img.visibility === 'false') return;
              if (img.url) media.push({ type: 'image', url: img.url });
              else if (typeof img === 'string') media.push({ type: 'image', url: img });
            });
          }
        }

        // Specific Fields (Existing logic)
        const vObj = obj.childCatVideos || obj.childCatVideo || obj.videos || obj.video || obj.videoUri;
        if (vObj) {
          const processVideo = (url: string) => {
            if (url.includes('youtube.com') || url.includes('youtu.be')) extracted.push({ type: 'youtube', url });
            else extracted.push({ type: 'video', url });
          };

          if (typeof vObj === 'string' && vObj.includes('http')) processVideo(vObj);
          else if (vObj.url) processVideo(vObj.url);
          else if (vObj.videos && typeof vObj.videos === 'object') {
            Object.values(vObj.videos).forEach((v: any) => { if (v.url) processVideo(v.url); });
          }
          else if (Array.isArray(vObj)) {
            vObj.forEach((v: any) => {
              if (typeof v === 'string') processVideo(v);
              else if (v.url) processVideo(v.url);
            });
          }
        }

        const bObj = obj.banners || obj.childCatImage || obj.image || obj.images || obj.imageUri || obj.banner;
        if (bObj) {
          if (Array.isArray(bObj)) {
            bObj.forEach((b: any) => {
              if (b.url) extracted.push({ type: 'image', url: b.url });
              else if (typeof b === 'string') extracted.push({ type: 'image', url: b });
            });
          } else if (bObj.url) {
            extracted.push({ type: 'image', url: bObj.url });
          } else if (typeof bObj === 'string' && bObj.includes('http')) {
            extracted.push({ type: 'image', url: bObj });
          }
        }

        // Catch-all: Search for any field that might be a direct URL string
        Object.keys(obj).forEach(key => {
          const val = obj[key];
          if (typeof val === 'string' && val.includes('http')) {
            if (val.match(/\.(mp4|mov|webm)$/i)) extracted.push({ type: 'video', url: val });
            else if (val.match(/\.(jpg|jpeg|png|webp)$/i)) extracted.push({ type: 'image', url: val });
          }
        });
      };

      // Try active category first
      if (activeService && activeService !== 'All Services') {
        const selectedCat = allCategories.find((c: any) => {
          const name = (c.name || c.serviceName || c.keyName || '').toLowerCase();
          return name === activeService.toLowerCase() || name.includes(activeService.toLowerCase());
        });
        if (selectedCat) extractFromObj(selectedCat);
      }

      // Fallback: Root
      if (extracted.length === 0) {
        extractFromObj(childCategories);
        if (childCategories.childCategory) extractFromObj(childCategories.childCategory);
      }

      media = [...media, ...extracted];
    }

    // Deduplication
    const seen = new Set();
    const result = media.filter(m => {
      if (seen.has(m.url)) return false;
      seen.add(m.url);
      return true;
    });

    // Interleave Logic: Strictly Interleave images and videos (1 image, 1 video, etc.)
    const imgs = result.filter(m => m.type === 'image');
    const vids = result.filter(m => m.type !== 'image');

    const interleaved: { type: 'video' | 'image' | 'youtube', url: string }[] = [];

    if (imgs.length > 0 && vids.length > 0) {
      // Strictly alternate until the longer list is exhausted
      const maxLen = Math.max(imgs.length, vids.length);
      for (let i = 0; i < maxLen; i++) {
        // Only push if there's a unique image (don't repeat images usually)
        if (i < imgs.length) interleaved.push(imgs[i]);
        // Repeat videos if necessary to maintain the pattern!
        if (vids.length > 0) {
          interleaved.push(vids[i % vids.length]);
        }
      }
    } else {
      // Just fallback to deduplicated result if only one type exists
      return result;
    }

    console.log(`ðŸŽ¬ storyMedia FINAL [${interleaved.length} items]. Strictly Interleaved:`, interleaved);
    return interleaved;
  }, [childCategories, activeService, serviceFilter, pageMedia]);

  // Loading Logic...


  // ðŸ”¥ Filter services based on selected filter and active active category
  // ðŸ”¥ Group services based on type (Repair, Services, Installation)
  const groupedServices = useMemo(() => {
    let result = servicesData;

    // 1. Filter by Active Category if not "All"
    if (activeServiceKey && activeServiceKey !== 'All') {
      if (activeService !== 'All Services' && activeService !== '') {
        result = result.filter(s => s.categoryType === activeService);
      }
    }

    // 2. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        (s.title || '').toLowerCase().includes(query) ||
        (s.categoryType || '').toLowerCase().includes(query) ||
        (s.features || []).some((f: string) => f.toLowerCase().includes(query))
      );
    }

    // 3. Group into dynamic sections based on visibleCategories
    const groups: { [key: string]: any[] } = {};

    // Initialize groups for all visible categories
    visibleCategories.forEach(cat => {
      groups[cat.name] = [];
    });

    // Also handle a "Services" or "Other" fallback if needed
    if (!groups["Services"]) groups["Services"] = [];

    result.forEach(service => {
      const rawCat = (service.categoryType || service.category || service.categoryName || service.groupName || "Services").toLowerCase();

      // Find best match in groups
      let assigned = false;
      for (const catName of Object.keys(groups)) {
        const target = catName.toLowerCase();
        // Match plural/singular and substrings (e.g. Service vs Services)
        if (rawCat === target || rawCat === target.replace(/s$/, '') || target === rawCat.replace(/s$/, '') || rawCat.includes(target)) {
          groups[catName].push(service);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        groups["Services"].push(service);
      }
    });

    return groups;
  }, [servicesData, activeService, headerTitle, searchQuery]);

  useEffect(() => {
    const handleScrollSpy = () => {
      if (isManualScroll.current) return;

      const sectionKeys = Object.keys(groupedServices).filter(key => groupedServices[key].length > 0);
      if (sectionKeys.length === 0) return;

      // 1. Single section optimization
      if (sectionKeys.length === 1) {
        if (activeService !== sectionKeys[0]) setActiveService(sectionKeys[0]);
        return;
      }

      // 2. Generous Bottom of page check (15% from bottom)
      const scrollPos = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollPos >= totalHeight - 200) {
        const lastSection = sectionKeys[sectionKeys.length - 1];
        if (activeService !== lastSection) setActiveService(lastSection);
        return;
      }

      // 3. Find the section that occupies the viewport (detection line)
      const detectionLine = 160; // Increased detection zone
      let targetSection = sectionKeys[0];

      for (const sectionType of sectionKeys) {
        const id = sectionType.toLowerCase().replace(/\s+/g, '-');
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // The active section is the LAST one whose top has passed the detection line
          if (rect.top <= detectionLine + 20) {
            targetSection = sectionType;
          } else {
            break;
          }
        }
      }

      if (activeService !== targetSection) {
        setActiveService(targetSection);
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [activeService, groupedServices]);

  // Calculate totals
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = servicesData.reduce((sum, service) =>
    sum + (service.price * (quantities[service.id] || 0)), 0);

  // unified initialization to prevent flickering
  useEffect(() => {
    const loadPageData = async (isBackgroundPolling = false) => {
      // 1. Instant Visual Load via Cache (<5ms perception)
      if (!isBackgroundPolling) {
        try {
          const cachedServices = localStorage.getItem('servicesCache');
          const cachedCategories = localStorage.getItem('categoriesCache');

          if (cachedServices && cachedCategories) {
            const parsedServices = JSON.parse(cachedServices);
            const parsedCategories = JSON.parse(cachedCategories);

            if (parsedServices.length > 0 && parsedCategories.length > 0) {
              console.log('âš¡ INSTANT LOAD: Using cached data');
              setServicesData(parsedServices);
              setChildCategories(parsedCategories);
              setActiveServiceKey('All');
              setLoading(false); // Disable loading spinner immediately
            } else {
              setLoading(true);
            }
          } else {
            setLoading(true);
          }
        } catch (e) {
          console.warn("Error reading cache", e);
          setLoading(true);
        }
      }

      try {
        // Pass true to skipLoadingToggle if we are background polling OR if we loaded from cache
        const skipLoading = isBackgroundPolling || !loading;
        const categories = await fetchChildCategories(skipLoading);

        // Cache categories silently
        if (categories && categories.length > 0) {
          localStorage.setItem('categoriesCache', JSON.stringify(categories));
        }

        // Fetch media in parallel with services to save time
        const mediaPromise = fetchPageMedia();
        let servicesPromise = Promise.resolve();

        if (categories && categories.length > 0) {
          servicesPromise = fetchAllServices(categories, skipLoading);
        }

        await Promise.allSettled([mediaPromise, servicesPromise]);

        if (!isBackgroundPolling && categories && categories.length > 0) {
          setActiveServiceKey('All');
        }

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        if (!isBackgroundPolling) {
          setLoading(false);
        }
      }
    };

    // Initial Load
    loadPageData(false);

    // 3. Smooth Refresh (Background Polling)
    const backgroundRefreshInterval = setInterval(() => {
      console.log('ðŸ”„ Background polling triggered (Smooth Refresh)');
      loadPageData(true); // true = isBackgroundPolling
    }, 15000); // 15 seconds

    return () => clearInterval(backgroundRefreshInterval);
  }, []);

  useEffect(() => {
    console.log('ðŸŽ¥ STORY VIDEOS =>', storyMedia);
  }, [storyMedia]);

  // Initial Fetch All Services
  // [DISABLED EFFECT TO PREVENT FLICKERING - HANDLED IN loadPageData]
  /*
  useEffect(() => {
    if (visibleCategories.length > 0) {
      if (servicesData.length === 0) {
        fetchAllServices(visibleCategories);
        setActiveServiceKey('All');
      }
    }
  }, [visibleCategories]);
  */

  // ðŸ”¥ Cache services data to localStorage for detail page
  useEffect(() => {
    if (servicesData.length > 0) {
      localStorage.setItem('servicesCache', JSON.stringify(servicesData));
    }
  }, [servicesData]);



  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrollPercent = (scrollTop / docHeight) * 100;

      setScrollProgress(scrollPercent);

      if (scrollTop >= SCROLL_THRESHOLD) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      setShowSearch(false);
    }
  };

  const toggleDarkMode = () => {
    // handled globally
  };

  const getImageBg = (id: number) => {
    const backgrounds = [
      'from-blue-300 to-blue-500',
      'from-green-300 to-green-500',
      'from-yellow-300 to-yellow-500',
      'from-gray-300 to-gray-500'
    ];
    return backgrounds[(id - 1) % backgrounds.length];
  };

  // Get service image
  const getServiceImage = (service: any) => {
    // Check main service object first (normalized by processRegularData/processDeepData)
    if (service.imageUrl) return service.imageUrl;

    // Fallback to deepData nesting if present
    if (service.isDeepData && service.deepData) {
      const dd = service.deepData;
      return dd.image || dd.imageUri || dd.imageUrl || (dd.image?.url) || dd.photo || null;
    }
    return null;
  };

  // Get video URLs for service
  const getServiceVideos = (service: any) => {
    if (service.isDeepData && service.deepData?.videoUrls) {
      return service.deepData.videoUrls;
    }
    return [];
  };

  // Loading State removed for direct page entry

  return (
    <div suppressHydrationWarning className={`min-h-screen w-full ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} pb-24 transition-colors duration-300`}>
      <style jsx global>{`
        html, body {
          overflow-x: hidden;
          width: 100%;
        }
      `}</style>
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes buttonExpand {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes buttonGlow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(234, 179, 8, 0.5);
          }
          50% {
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.8);
          }
        }
        @keyframes buttonClick {
          0% {
            transform: scale(1);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          50% {
            transform: scale(0.95);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
        }
        @keyframes buttonBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        @keyframes rippleEffect {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes buttonPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(234, 179, 8, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0);
          }
        }
        @keyframes buttonShine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }
        .animate-button-expand {
          animation: buttonExpand 0.4s ease-out;
        }
        .animate-button-glow {
          animation: buttonGlow 1.2s ease-in-out infinite;
        }
        .animate-button-click {
          animation: buttonClick 0.3s ease-out;
        }
        .animate-button-bounce {
          animation: buttonBounce 0.5s ease-in-out infinite;
        }
        .animate-button-pulse {
          animation: buttonPulse 1.5s infinite;
        }
        .animate-button-shine {
          background: linear-gradient(90deg, 
            rgba(234, 179, 8, 0) 0%, 
            rgba(234, 179, 8, 0.3) 50%, 
            rgba(234, 179, 8, 0) 100%);
          background-size: 200% auto;
          animation: buttonShine 2s linear infinite;
        }
        .animate-ripple-effect {
          animation: rippleEffect 0.6s linear;
        }
        .sticky-header-transition {
          transition: all 0.9s ease-in-out;
        }
        .button-3d-effect {
          transition: all 0.2s ease;
          position: relative;
          top: 0;
        }
        .button-3d-effect:active {
          top: 2px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        /* Custom scrollbar hiding */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Dark/Light Mode Toggle */}


      {/* Search Modal */}
      {showSearch && (
        <div className={`fixed inset-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowSearch(false);
                  setIsSearchExpanded(false);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all active:scale-95"
              >
                <ArrowLeft size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for services..."
                    className={`w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HEADER FOR NON-SCROLLED STATE (Image 2 Layout) */}
      <header className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-[60] transition-all duration-300 ${isScrolled ? 'translate-y-[-100%]' : 'translate-y-0'
        } ${darkMode ? 'bg-[#0A0F1C]/80 border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-white/80 border-gray-100 shadow-sm'} backdrop-blur-xl border-b px-4 h-16 flex items-center`}>
        <div className="w-full relative flex items-center justify-between min-h-[44px]">
          <AnimatePresence mode="wait">
            {!isSearchExpanded ? (
              <motion.div
                key="header-default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between w-full"
              >
                {/* Left: Back & Title */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10' : 'bg-gray-50 text-gray-700 shadow-sm border border-gray-200 active:bg-white hover:border-gray-300'
                      }`}
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="flex flex-col">
                    {loading ? (
                      <div className="space-y-1.5">
                        <Skeleton variant="text" width={120} height={16} darkMode={darkMode} />
                        <Skeleton variant="text" width={100} height={12} darkMode={darkMode} />
                      </div>
                    ) : (
                      <>
                        <h1 className={`text-base font-black leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            const title = activeService || headerTitle;
                            const filterWords = ['Repair', 'Services', 'Service', 'Installation'];
                            // Don't show filter keywords, only show actual category names
                            if (filterWords.includes(title)) {
                              return '';
                            }
                            return title;
                          })()}
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className={`text-[11px] font-black ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>4.75</span>
                          </div>
                          <span className={`text-[11px] font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>(8.9M Bookings)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${darkMode ? "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10" : "bg-gray-50 text-gray-500 shadow-sm border border-gray-200 hover:border-gray-300"}`}
                  >
                    <Search size={20} />
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      /* ... share logic ... */
                      const shareTitle = activeService || headerTitle;
                      const shareData = { title: shareTitle, text: `Check out ${shareTitle}!`, url: window.location.href };
                      if (navigator.share) navigator.share(shareData);
                      else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
                    }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${darkMode ? "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10" : "bg-gray-50 text-gray-500 shadow-sm border border-gray-200"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                  </button>

                  <button
                    onClick={() => setShowRateCard(true)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center relative hover:scale-105 active:scale-95 transition-all ${darkMode ? "bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : "bg-white shadow-md border border-yellow-100"}`}
                  >
                    <Percent size={19} className={darkMode ? "text-yellow-400" : "text-yellow-500"} strokeWidth={3} />
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border-2 border-white dark:border-gray-900 shadow-sm"></span>
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="header-search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full flex items-center gap-2"
              >
                <div className={`flex-1 flex items-center px-4 h-11 rounded-xl transition-all ${darkMode ? "bg-[#1E2536]" : "bg-gray-100"}`}>
                  <Search size={18} className="text-gray-400" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 ml-3 text-sm w-full font-bold placeholder-gray-400 ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                    placeholder="Search for services..."
                    type="text"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1">
                      <X size={16} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className={`h-11 px-4 rounded-xl text-sm font-bold ${darkMode ? "text-gray-400 hover:bg-[#1E2536]" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Banner Media Player Section */}
      <div className="pt-20 px-4 transition-all duration-300">
        <div className={`relative w-full rounded-[2rem] overflow-hidden ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-200'}`}>
          {loading ? (
            <div className="relative w-full aspect-[16/9]">
              <Skeleton variant="rectangular" width="100%" height="100%" darkMode={darkMode} />
            </div>
          ) : storyMedia.length > 0 ? (
            <MediaSlider
              mixedMedia={storyMedia}
              darkMode={darkMode}
              autoPlayDuration={3000}
            />
          ) : (
            // Placeholder Mesh Gradient if no media
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 ${darkMode ? 'bg-[#0A0F1C]' : 'bg-gray-100'}`}>
                <div className="absolute inset-0 overflow-hidden opacity-30">
                  <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[100px] bg-blue-500/20" />
                  <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[100px] bg-yellow-500/10" />
                </div>
                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-4 transition-all duration-700 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white shadow-xl'}`}>
                  <Wrench size={30} className="text-yellow-400" />
                </div>
                <p className={`text-xs font-bold uppercase tracking-widest text-center max-w-[200px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No Preview Available
                </p>
              </div>
            </div>
          )}

          {!loading && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40">
              <div
                onClick={() => setShowWarrantySheet(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 text-gray-900 text-[10px] font-black shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <Lottie animationData={warrantyAnim} loop={true} style={{ width: 16, height: 16 }} />
                </div>
                <span className="cursor-pointer">45 Days Service Warranty</span>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* STICKY HEADER FOR SCROLLED STATE (Image 1 Layout) */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50 transition-all duration-150 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${darkMode ? 'bg-[#0A0F1C]/90 border-white/5' : 'bg-white/90 border-gray-100'} backdrop-blur-xl shadow-lg border-b px-1 h-14 flex items-center`}>
        <div className="w-full flex items-center justify-between gap-2 h-10 px-0.5">
          <div className="flex-shrink-0 flex items-center justify-start">
            <button
              onClick={() => router.back()}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-sm active:scale-90 ${darkMode ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0 flex justify-center">
            <AnimatePresence mode="wait">
              {!isSearchExpanded ? (
                <motion.div
                  key="sticky-categories"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-1 w-full"
                >


                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-1.5">
                        <Skeleton
                          variant="rectangular"
                          width={70}
                          height={28}
                          borderRadius="20px"
                          darkMode={darkMode}
                        />
                      </div>
                    ))
                  ) : visibleCategories.map((cat) => {
                    const isActive = activeService === cat.name;

                    const getMiniIcon = (name: string) => {
                      const lowerName = name.toLowerCase();
                      const iconClass = "w-3 h-3 min-[380px]:w-3.5 min-[380px]:h-3.5";
                      if (lowerName.includes('repair')) return <Wrench className={iconClass} />;
                      if (lowerName.includes('install')) return <Plus className={iconClass} />;
                      return <Settings className={iconClass} />;
                    };

                    return (
                      <motion.button
                        key={cat.id}
                        id={`sticky-cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          setActiveService(cat.name);

                          // Set manual scroll guard
                          isManualScroll.current = true;
                          if (cancelManualScrollRef.current) clearTimeout(cancelManualScrollRef.current);
                          cancelManualScrollRef.current = setTimeout(() => {
                            isManualScroll.current = false;
                          }, 1000);

                          const id = cat.name.toLowerCase().replace(/\s+/g, '-');
                          const el = document.getElementById(id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={`shrink-0 flex items-center justify-center gap-1 px-2.5 py-1.5 min-[380px]:px-3.5 min-[380px]:py-2 rounded-full text-[10px] min-[380px]:text-xs font-bold tracking-wide transition-all relative z-10 ${isActive
                          ? 'text-gray-900 bg-yellow-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10'
                          }`}
                      >
                        <span className="relative z-20 flex items-center gap-1.5 whitespace-nowrap">
                          {getMiniIcon(cat.name)}
                          {cat.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="sticky-search"
                  initial={{ opacity: 0, width: "0%" }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: "0%" }}
                  className={`flex-1 flex items-center pr-2 h-9 rounded-xl overflow-hidden mx-2 ${darkMode ? "bg-white/10" : "bg-gray-100"}`}
                >
                  <div className="flex items-center w-full px-3">
                    <Search size={16} className={`shrink-0 ${darkMode ? "text-white" : "text-black"}`} />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-1 ml-2 text-xs w-full font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                      placeholder="Search..."
                      type="text"
                    />
                    <button onClick={() => setIsSearchExpanded(false)} className="p-1">
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-shrink-0 flex items-center justify-end">
            <button
              onClick={() => setShowRateCard(true)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <Percent className="w-4 h-4 text-yellow-500 fill-current" />
            </button>
          </div>
        </div>
      </div >

      {/* Main Content with dynamic padding */}
      < div className={`transition-all duration-300 ${isScrolled ? 'pt-16' : 'pt-0'}`
      }>
        {/* Error Message */}
        {
          error && (
            <div className="px-4 mt-4">
              <div className={`rounded-xl p-4 text-center ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
                } border`}>
                <p className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  âš ï¸ {error}
                </p>
                <button
                  onClick={() => fetchChildCategories()}
                  className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 button-3d-effect ${darkMode ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                  Retry
                </button>
              </div>
            </div>
          )
        }

        {/* Banner Slider */}
        <div className="px-4 mt-2">
          <div className="relative w-full overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
            >
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="w-1/2 flex-shrink-0 px-1">
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={100}
                      borderRadius="1rem"
                      darkMode={darkMode}
                    />
                  </div>
                ))
              ) : banners.map((banner) => (
                <div key={banner.id} className="w-1/2 flex-shrink-0 px-1">
                  <div className={`bg-gradient-to-br ${banner.gradient} rounded-2xl p-4 text-white button-3d-effect hover:scale-[1.02] transition-transform duration-300 shadow-lg h-full flex flex-col justify-between min-h-[100px]`}>
                    <div>
                      <div className={`text-[9px] font-bold ${banner.tagColor} mb-0.5 uppercase tracking-wider`}>{banner.tag}</div>
                      <p className="font-extrabold text-xl leading-tight">{banner.title}</p>
                    </div>
                    <p className="text-[9px] opacity-90 mt-1 font-medium leading-tight">{banner.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            {!loading && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {Array.from({ length: Math.ceil(banners.length / 2) }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentBannerIndex ? 'bg-white w-3' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading Shimmer State */}
        {loading && (
          <div className="mt-8">
            <ServiceGridSkeleton count={4} darkMode={darkMode} />
          </div>
        )}

        {/* SERVICES LIST SECTION - Unified Grouped View */}
        <section className="px-4 pb-20 mt-2">
          {!loading && servicesData.length > 0 && (
            <motion.div
              animate={{
                opacity: isScrolled ? 0 : 1,
                y: isScrolled ? -20 : 0,
                display: isScrolled ? 'none' : 'flex'
              }}
              transition={{ duration: 0.15 }}
              className="mb-8 flex justify-center gap-1.5 min-[400px]:gap-2 py-3 w-full"
            >
              {visibleCategories.map((cat) => {
                const isActive = activeService === cat.name;

                const getCategoryIcon = (name: string) => {
                  const lowerName = name.toLowerCase();
                  if (lowerName.includes('repair')) return <Wrench size={16} className={isActive ? 'text-gray-900' : 'text-gray-800'} />;
                  if (lowerName.includes('install')) return <Plus size={16} className={isActive ? 'text-gray-900' : 'text-gray-800'} />;
                  if (lowerName.includes('service')) return <Settings size={16} className={isActive ? 'text-gray-900' : 'text-gray-800'} />;
                  return <Wrench size={16} className={isActive ? 'text-gray-900' : 'text-gray-800'} />;
                };

                return (
                  <motion.button
                    key={cat.id}
                    layout
                    whileTap={{ scale: 0.92 }}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => {
                      setActiveService(cat.name);

                      // Set manual scroll guard
                      isManualScroll.current = true;
                      if (cancelManualScrollRef.current) clearTimeout(cancelManualScrollRef.current);
                      cancelManualScrollRef.current = setTimeout(() => {
                        isManualScroll.current = false;
                      }, 1000);

                      const id = cat.name.toLowerCase().replace(/\s+/g, '-');
                      const el = document.getElementById(id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`shrink-0 h-9 px-3.5 rounded-full flex flex-row items-center justify-center gap-1.5 border relative shadow-sm transition-all duration-300 ${isActive
                      ? "bg-yellow-400 border-yellow-400 text-gray-900 shadow-yellow-400/20"
                      : darkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center justify-center z-10">
                      {getCategoryIcon(cat.name)}
                    </div>
                    <span className={`text-xs font-bold whitespace-nowrap tracking-tight z-10`}>
                      {cat.name}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Loop through sections dynamically based on groupedServices */}
          {Object.keys(groupedServices).map((sectionType) => {
            const services = groupedServices[sectionType];
            if (!services || services.length === 0) return null;

            // Optional: Map internal keys to user-friendly headings
            const headingMap: { [key: string]: string } = {
              'Repair': 'Repair Your Product',
              'Services': 'Service Your Product',
              'Installation': 'Install Your Product'
            };
            const heading = headingMap[sectionType] || sectionType;

            return (
              <div key={sectionType} id={sectionType.toLowerCase().replace(/\s+/g, '-')} className="mb-12 animate-slide-up scroll-mt-20">
                <div className="flex items-center justify-between mb-5 mt-4">
                  <h2 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="w-1.5 h-7 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                    {heading}
                  </h2>
                </div>

                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div
                      key={service.id || index}
                      className={`relative rounded-[2rem] p-3 min-[375px]:p-4 transition-all duration-300 ${darkMode
                        ? 'bg-[#111623] border border-white/5'
                        : 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                        }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex gap-4 min-[375px]:gap-5">
                          {/* LEFT: Enhanced Image Container */}
                          <div className="w-[115px] min-[375px]:w-[135px] shrink-0">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-white/5 transition-transform group-hover:scale-[1.02] duration-300">
                              {service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Wrench size={32} />
                                </div>
                              )}
                              {service.tag && (
                                <div className="absolute top-0 left-0 bg-[#FFC42E] text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-br-xl shadow-lg z-10">
                                  {service.tag}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setSelectedServiceForDetail(service)}
                              className={`mt-2.5 w-full py-1.5 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 transition-all uppercase tracking-tight ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                }`}
                            >
                              <Eye size={13} strokeWidth={2.5} /> View Details
                            </button>
                          </div>

                          {/* RIGHT: High-End Aligned Details */}
                          <div className="flex-1 flex flex-col min-w-0 py-0.5">
                            <h3 className={`font-black text-[17px] min-[375px]:text-lg leading-snug mb-2.5 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {service.title}
                            </h3>

                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-md text-[12px] font-black shadow-sm">
                                  {service.rating} <Star size={11} fill="currentColor" />
                                </div>
                                <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                <span className={`text-[12px] font-normal ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>458 Reviews</span>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[12px] font-bold w-full transition-all hover:shadow-sm ${darkMode
                                  ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-200 border border-white/10'
                                  : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-700 border border-blue-100/50'}`}>
                                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                    <Lottie animationData={warrantyAnim} loop={true} style={{ width: 22, height: 22 }} />
                                  </div>
                                  <span className="tracking-tight">{service.warranty}</span>
                                </div>

                                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[12px] font-bold w-full transition-all hover:shadow-sm ${darkMode
                                  ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-gray-200 border border-white/10'
                                  : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-700 border border-blue-100/50'}`}>
                                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                    <Lottie animationData={clockAnim} loop={true} style={{ width: 22, height: 22 }} />
                                  </div>
                                  <span className="tracking-tight">{service.serviceTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Bullet Points - Full Width Section */}
                        {service.secondTitle && (
                          <div className={`flex flex-col gap-1.5 mt-3 px-2 text-[11px] leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(() => {
                              const textVal = service.secondTitle.replace(/^\s*Description\s*[*:.\-]?\s*/gi, '').trim();
                              const parts = textVal.split(/([|•~])/);
                              const elements: { type: 'bullet' | 'para', text: string }[] = [];

                              for (let i = 0; i < parts.length; i++) {
                                const part = parts[i];
                                if (part === '|' || part === '•') {
                                  if (parts[i + 1]?.trim()) {
                                    elements.push({ type: 'bullet', text: parts[i + 1] });
                                    i++;
                                  }
                                } else if (part === '~') {
                                  if (parts[i + 1]?.trim()) {
                                    elements.push({ type: 'para', text: parts[i + 1] });
                                    i++;
                                  }
                                } else if (part.trim()) {
                                  elements.push({ type: 'para', text: part });
                                }
                              }

                              // Fallback if no special characters found
                              if (elements.length === 0 && textVal.trim()) {
                                elements.push({ type: 'para', text: textVal });
                              }

                              return elements.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className={`w-1 h-1 rounded-full shrink-0 mt-1.5 ${darkMode ? 'bg-blue-400/60' : 'bg-blue-600/60'}`} />
                                  <span className="font-medium break-words">{item.text.trim()}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        )}

                        {/* BOTTOM: Price and Action Area */}
                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.03] flex items-end justify-between">
                          {/* Structured Pricing Section */}
                          <div className="flex flex-col gap-0.5 ml-1 shrink-0">
                            {/* Original Price - TOP */}
                            {service.originalPrice && service.price && Number(service.originalPrice) > Number(service.price) && (
                              <span className="text-[13px] text-gray-400 line-through font-bold">
                                ₹{Number(service.originalPrice).toLocaleString()}
                              </span>
                            )}

                            {/* Main Price */}
                            <span className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              ₹{Number(service.price).toLocaleString()}
                            </span>

                            {/* GST Transparency Tag - Hidden if 0% */}
                            {Number(service.gst || service.gstRate || 0) > 0 && (
                              <div className={`text-[10px] font-bold italic opacity-60 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                GST ({service.gst || service.gstRate}%) - {service.gstType === 'exclude' || service.gstType === 'exclusive' ? 'Extra' : 'Included'}
                              </div>
                            )}

                            {/* Compact Badge - BELOW PRICE - Hidden if Savable amount is 0 */}
                            {(() => {
                              const orig = Number(service.originalPrice);
                              const price = Number(service.price);
                              const dVal = Number(service.discountValue || 0);
                              const dType = service.discountType || 'fixed';
                              let savedAmount = 0;

                              if (dVal > 0) {
                                if (dType === 'percentage' || dType === 'percentage ' || dType.trim() === 'percentage') {
                                  savedAmount = orig * (dVal / 100);
                                } else {
                                  savedAmount = dVal;
                                }
                              } else if (orig > price) {
                                savedAmount = orig - price;
                              }

                              if (savedAmount <= 0) return null;

                              return (
                                <div className="flex mt-1">
                                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[#00a36c] dark:text-[#00c88a] font-black text-[9px] uppercase tracking-tighter whitespace-nowrap border shrink-0 min-w-max shadow-sm ${darkMode ? 'border-green-500/30 bg-green-500/10' : 'border-green-500/20 bg-green-50'}`}>
                                    <Tag size={12} fill="currentColor" className="shrink-0" />
                                    <span className="leading-none">
                                      {`₹${Math.round(savedAmount).toLocaleString()} PER `}{(() => {
                                        const text = (service.categoryType || service.title || '').toLowerCase();
                                        if (text.includes('ac')) return 'AC';
                                        if (text.includes('washing')) return 'Washing';
                                        if (text.includes('fan')) return 'Fan';
                                        if (text.includes('refrigerator') || text.includes('fridge')) return 'Fridge';
                                        if (text.includes('ro') || text.includes('purifier')) return 'RO';

                                        // Clean up generic terms
                                        let cleanCat = service.categoryType || 'SERVICE';
                                        cleanCat = cleanCat.replace(/repair|installation|service|maintenance/gi, '').trim();
                                        return cleanCat || 'SERVICE';
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* CTA Action */}
                          <div className="relative group/btn">
                            {quantities[service.id] > 0 ? (
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`flex items-center rounded-2xl border p-1 shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800 border-white/10' : 'bg-white border-gray-100 shadow-gray-200/50'}`}
                              >
                                <button
                                  onClick={() => updateQuantity(service.id, -1)}
                                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 ${darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                  <Minus size={18} strokeWidth={2.5} />
                                </button>
                                <div className="w-10 flex items-center justify-center select-none">
                                  <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {quantities[service.id]}
                                  </span>
                                </div>
                                <button
                                  onClick={() => updateQuantity(service.id, 1)}
                                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 active:scale-95`}
                                >
                                  <Plus size={18} strokeWidth={2.5} />
                                </button>
                              </motion.div>
                            ) : (
                              <button
                                onClick={() => updateQuantity(service.id, 1)}
                                className="relative overflow-hidden bg-blue-500 text-white min-w-[100px] py-3.5 rounded-2xl text-[14px] font-black tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all group"
                              >
                                <span className="relative z-10">ADD</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                  )}
                </div>
              </div>
            )
          })}

          {/* Global Empty State */}
          {
            !loading && Object.values(groupedServices).every(arr => arr.length === 0) && (
              <div className="flex flex-col items-center justify-center py-28 text-center animate-slide-up">
                <div className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center mb-8 shadow-2xl ${darkMode ? 'bg-[#1E2536] border border-white/10' : 'bg-white shadow-gray-200'}`}>
                  <div className="relative">
                    <Search size={56} className="text-yellow-400 animate-pulse" />
                    <X size={28} className="absolute -top-2 -right-2 text-red-500 font-black" />
                  </div>
                </div>
                <h3 className={`text-2xl font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Services Found
                </h3>
                <p className={`text-[15px] mb-12 max-w-[300px] mx-auto leading-relaxed font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  We couldn't find any services in this category. Try checking other sections.
                </p>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-950 dark:bg-white dark:text-gray-950 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl active:scale-95 transition-all flex items-center gap-4"
                >
                  <ArrowLeft size={22} />
                  Explore Other Categories
                </button>
              </div>
            )
          }
        </section>
      </div>

      {/* Bottom Navigation with Enhanced Animation */}
      {/* <nav className={`fixed bottom-0 left-0 right-0 py-3 shadow-hard z-50 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-t`}>
        <div className="flex justify-around items-center">
          <Link 
            href="/" 
            className={`flex flex-col items-center transition-all duration-300 button-3d-effect hover:scale-110 active:scale-95 ${
              darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <Home size={24} className="hover:animate-bounce" />
            <span className="text-xs mt-1 font-semibold">Home</span>
          </Link>
          
          <button className={`flex flex-col items-center transition-all duration-300 button-3d-effect hover:scale-110 active:scale-95 ${
            scrollProgress > 70 ? 'text-yellow-500 animate-pulse' : darkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            <Grid3x3 size={24} className="hover:animate-spin" />
            <span className="text-xs mt-1 font-semibold">Services</span>
          </button>
          
          <Link 
            href="/payment" 
            className={`flex flex-col items-center relative transition-all duration-300 button-3d-effect hover:scale-110 active:scale-95 ${
              darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <ShoppingCart size={24} className="hover:animate-bounce" />
            {totalItems > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 transition-all duration-500 animate-pulse ${
                scrollProgress > 50 ? 'bg-yellow-500' : 'bg-red-500'
              } text-white text-xs rounded-full flex items-center justify-center`}>
                {totalItems}
              </span>
            )}
            <span className="text-xs mt-1 font-semibold">Cart</span>
          </Link>
          
          <Link 
            href="/my-bookings" 
            className={`flex flex-col items-center transition-all duration-300 button-3d-effect hover:scale-110 active:scale-95 ${
              darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <User size={24} className="hover:animate-bounce" />
            <span className="text-xs mt-1 font-semibold">Profile</span>
          </Link>
        </div>
      </nav> */}
      {/* <BottomNav /> */}


      {/* Service Detail Bottom Sheet */}
      <ServiceDetailBottomSheet
        isOpen={!!selectedServiceForDetail}
        onClose={() => setSelectedServiceForDetail(null)}
        service={selectedServiceForDetail}
      />

      {/* Rate Card Bottom Sheet */}
      <RateCardSheet
        isOpen={showRateCard}
        onClose={() => setShowRateCard(false)}
        darkMode={darkMode}
        subId={getSubId()}
        mainId={getMainId()}
        categoryName={headerTitle}
      />

      {/* Warranty Bottom Sheet */}
      <WarrantyBottomSheet
        isOpen={showWarrantySheet}
        onClose={() => setShowWarrantySheet(false)}
        darkMode={darkMode}
      />
    </div>
  );
}
