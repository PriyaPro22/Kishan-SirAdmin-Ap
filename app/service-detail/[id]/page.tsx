"use client";

import {
  ArrowLeft,
  Star,
  Verified,
  CheckCircle,
  Shield,
  Clock,
  Home,
  Grid3x3,
  ShoppingCart,
  User,
  Wrench,
  Loader2,
  Calendar,
  ShieldCheck,
  Users,
  Zap,
  Sparkles,
  Toolbox
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useApp } from "../../context/AppContext";
import { useCart } from "../../context/CartContext";

export default function ServiceDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { darkMode } = useApp();
  const { addToCart } = useCart();

  // Get service ID from URL path
  const getServiceIdFromPath = () => {
    if (!pathname) return null;
    const segments = pathname.split('/');
    return segments[segments.length - 1];
  };

  const serviceId = getServiceIdFromPath();
  const fromServices = searchParams?.get('fromServices') === 'true';

  // State for service data
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Service Detail Page Mounted');
    console.log('📱 Pathname:', pathname);
    console.log('🆔 Service ID from path:', serviceId);
    console.log('📋 Search Params:', searchParams?.toString());
  }, [pathname, serviceId, searchParams]);

  // Fetch service details from API
  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!serviceId) {
        throw new Error('Service ID not found in URL');
      }

      console.log('🎯 Fetching details for service ID:', serviceId);

      // STRATEGY 1: Try to get from my optimized servicesFlowCache
      if (typeof window !== 'undefined') {
        const flowCache = localStorage.getItem('servicesFlowCache');
        if (flowCache) {
          try {
            const parsedFlow = JSON.parse(flowCache);
            // Search through all category buckets in the flow cache
            let cachedFound = null;
            for (const catId in parsedFlow) {
              const services = parsedFlow[catId];
              cachedFound = services.find((s: any) =>
                s.id === serviceId || s._id === serviceId
              );
              if (cachedFound) break;
            }

            if (cachedFound) {
              console.log('✅ Found service in navigation flow cache');
              setServiceData(cachedFound);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse flow cache", e);
          }
        }
      }

      // STRATEGY 2: Try deep API with stored IDs
      const mainId = typeof window !== 'undefined' ? localStorage.getItem('mainId') : null;
      const subId = typeof window !== 'undefined' ? localStorage.getItem('subId') : null;
      const childKey = typeof window !== 'undefined' ? (localStorage.getItem('childKey') || localStorage.getItem('childId')) : null;

      console.log('🔑 Stored IDs:', { mainId, subId, childKey });

      if (mainId && childKey) {
        // Build API URL based on available IDs
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        let apiUrl = subId
          ? `${baseUrl}/api/product-listing/main/${mainId}/sub/${subId}/child-key/${childKey}/deep`
          : `${baseUrl}/api/product-listing/main/${mainId}/child-key/${childKey}/deep`;

        console.log('🔗 Trying deep API:', apiUrl);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Deep API Response:', data);

            if (data.success && data.data) {
              // Search for service in deep data
              const deepData = data.data;
              let foundService = null;

              for (const categoryKey in deepData) {
                const category = deepData[categoryKey];
                if (category && typeof category === 'object') {
                  // Check main category
                  if (category.documentId === serviceId ||
                    categoryKey === serviceId ||
                    (category.firstTitle && category.firstTitle.toLowerCase().includes(serviceId.toLowerCase()))) {
                    foundService = category;
                    break;
                  }

                  // Check sub categories
                  if (category.subDeepChildCategory) {
                    for (const subKey in category.subDeepChildCategory) {
                      const subService = category.subDeepChildCategory[subKey];
                      if (subService.documentId === serviceId ||
                        subKey === serviceId ||
                        (subService.firstTitle && subService.firstTitle.toLowerCase().includes(serviceId.toLowerCase()))) {
                        foundService = subService;
                        break;
                      }
                    }
                    if (foundService) break;
                  }
                }
              }

              if (foundService) {
                console.log('✅ Found service in deep API:', foundService);
                setServiceData(foundService);
                setLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.error("Deep API fetch failed", e);
        }
      }

      // STRATEGY 3: Try direct service API
      console.log('🔗 Trying direct service API');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const directApiUrl = `${baseUrl}/api/product-listing/service/${serviceId}`;

      try {
        const directResponse = await fetch(directApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (directResponse.ok) {
          const data = await directResponse.json();
          console.log('✅ Direct API Response:', data);

          if (data.success && data.data) {
            setServiceData(data.data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Direct API fetch failed", e);
      }

      throw new Error('Service details not found');

    } catch (err: any) {
      console.error('❌ Error fetching service details:', err);
      setError(err.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get mock service data
  const getMockServiceData = (id: string) => {
    const mockServices = [
      {
        id: '1',
        title: 'Advanced Foam Jet AC Service',
        description: 'Premium foam jet cleaning for superior AC performance. Removes deep-seated dirt and allergens.',
        price: 599,
        originalPrice: 899,
        rating: 4.8,
        warranty: '45 Days Service Warranty',
        serviceTime: '45-60 mins',
        brandsSupported: '15+ Brands',
        features: [
          'Deep cleaning of filters & coils',
          'Expert technician service',
          'Genuine parts (if required)',
          'Service report provided',
          'Anti-bacterial treatment',
          'Cooling performance check'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800',
      },
      {
        id: '2',
        title: 'Power Jet Basic Service',
        description: 'Basic power jet cleaning for regular AC maintenance.',
        price: 399,
        originalPrice: 499,
        rating: 4.5,
        warranty: '30 Days Warranty',
        serviceTime: '30-45 mins',
        brandsSupported: '10+ Brands',
        features: [
          'High pressure water cleaning',
          'Filter cleaning',
          'Basic performance check'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1560684352-8497838a2229?auto=format&fit=crop&w=800',
      },
      {
        id: '3',
        title: 'Anti-Rust Coating Service',
        description: 'Protective coating to prevent rust and corrosion on outdoor unit.',
        price: 299,
        originalPrice: null,
        rating: 4.9,
        warranty: '1 Year Warranty',
        serviceTime: '30 mins',
        brandsSupported: 'All Brands',
        features: [
          'Anti-rust protective coating',
          'Weather resistance',
          'Increases lifespan'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800',
      }
    ];

    return mockServices.find(service => service.id === id) || mockServices[0];
  };

  // Fetch related services from cache
  const fetchRelatedServicesFromCache = (services: any[], currentService: any) => {
    try {
      const related = services
        .filter((service: any) =>
          service.id !== currentService.id &&
          service._id !== currentService.id &&
          service.documentId !== currentService.id
        )
        .slice(0, 4)
        .map((service: any) => ({
          id: service.id || service._id || service.documentId,
          title: service.title || service.name || service.firstTitle,
          price: service.price || service.currentPrice || service.priceAfterGst || 499,
          originalPrice: service.originalPrice || null,
          rating: service.rating || 4.5,
          warranty: service.warranty || '30 Days'
        }));

      setRelatedServices(related);
    } catch (err) {
      console.error('Error fetching related services:', err);
    }
  };

  // Format price with commas
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (original: number, current: number) => {
    if (original && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  // Handle booking
  const handleBookNow = () => {
    if (!serviceData) return;

    const bookingData = {
      serviceId: serviceData.id || serviceData._id || serviceData.documentId || serviceId,
      serviceName: serviceData.title || serviceData.name || serviceData.firstTitle || 'Service',
      price: serviceData.price || serviceData.currentPrice || serviceData.priceAfterGst || 0,
      originalPrice: serviceData.originalPrice || null,
      quantity,
      selectedPackage,
      total: (serviceData.price || serviceData.currentPrice || serviceData.priceAfterGst || 0) * quantity
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
      console.log('📝 Saved booking data:', bookingData);
    }

    router.push('/booking');
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!serviceData) return;

    const cartItem = {
      id: serviceData.id || serviceData._id || serviceData.documentId || serviceId,
      title: serviceData.title || serviceData.name || serviceData.firstTitle || 'Service',
      price: serviceData.price || serviceData.currentPrice || serviceData.priceAfterGst || 0,
      originalPrice: serviceData.originalPrice || null,
      discount: serviceData.discount || null,
      mainId: serviceData.mainId || localStorage.getItem('mainId') || '',
      subId: serviceData.subId || localStorage.getItem('subId') || '',
      childKey: serviceData.childKey || (typeof window !== 'undefined' ? localStorage.getItem('childKey') : '') || 'Service',
      quantity,
      image: serviceData.imageUrl,
      warranty: serviceData.warranty
    };

    if (typeof window !== 'undefined') {
      // Use Context instead of manual localStorage
      addToCart(cartItem);
      console.log('🛒 Added to cart via Context:', cartItem);

      // Show success message
      // alert(`Added ${quantity} × "${cartItem.title}" to cart!`); // Optional, maybe use a toast or just let the floating cart animation handle it

      // The context handles localStorage updates, so we don't need to do it here manually anymore
      // window.dispatchEvent(new Event('cartUpdated')); // Context should handle re-renders
    }
  };

  // Initialize
  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    } else {
      setError('Service ID not found');
      setLoading(false);
    }
  }, [serviceId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-lg text-gray-700">Loading service details...</p>
          <p className="text-sm text-gray-500 mt-2">Service ID: {serviceId}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white sticky top-0 z-40 shadow-sm px-4 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={24} />
            <span className="text-lg font-bold text-gray-900">Go Back</span>
          </button>
        </header>

        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Available</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-6">Service ID: {serviceId}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-600 shadow-md transition-colors"
            >
              Browse Other Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract service details
  const serviceTitle = serviceData?.title || serviceData?.name || serviceData?.firstTitle || 'Service';
  const serviceDescription = serviceData?.description || serviceData?.desc || 'Premium service with expert technicians';
  const servicePrice = serviceData?.price || serviceData?.currentPrice || serviceData?.priceAfterGst || 599;
  const originalPrice = serviceData?.originalPrice || null;
  const rating = serviceData?.rating || serviceData?.ratingValue || 4.5;
  const warranty = serviceData?.warranty || '45 Days Service Warranty';
  const serviceTime = serviceData?.serviceTime || '45-60 mins';
  const brandSupport = serviceData?.brandsSupported || '15+ Brands';
  const features = serviceData?.features || [
    'Deep cleaning of filters & coils',
    'Expert technician service',
    'Genuine parts (if required)',
    'Service report provided'
  ];
  const imageUrl = serviceData?.imageUrl || null;

  const discountPercentage = originalPrice ? calculateDiscount(originalPrice, servicePrice) : 0;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pb-24 transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} sticky top-0 z-40 shadow-sm px-4 py-4 transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={24} className={darkMode ? 'text-gray-200' : 'text-gray-700'} />
            <span className={`text-lg font-bold truncate max-w-[200px] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {serviceTitle}
            </span>
          </button>
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <ShoppingCart size={22} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-r from-gray-800 to-gray-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={serviceTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.classList.add('bg-gradient-to-r', 'from-gray-800', 'to-gray-900');
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        )}

        {/* Warranty Badge */}
        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500 text-gray-900 text-[10px] font-bold">
            <Shield size={12} />
            <span>{warranty}</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
          <h2 className="text-white text-xl font-bold">{serviceTitle}</h2>
          <p className="text-white/80 text-xs mt-1">{serviceDescription}</p>
        </div>
      </div>

      {/* Offers */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white">
            <div className="text-[10px] font-medium text-blue-100 mb-1">HDFC Offer</div>
            <p className="font-extrabold text-2xl">15% OFF</p>
            <p className="text-[10px] opacity-90 mt-0.5">Instant cashback on cards</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-4 text-white">
            <div className="text-[10px] font-medium text-green-100 mb-1">New User</div>
            <p className="font-extrabold text-2xl">FLAT ₹100</p>
            <p className="text-[10px] opacity-90 mt-0.5">Use Code: FIRST100</p>
          </div>
        </div>
      </div>

      {/* Service Info */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} mx-4 mt-6 rounded-xl p-5 shadow-sm transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{serviceTitle}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-sm font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                <Star size={12} fill="currentColor" />
                {rating.toFixed(1)}
              </div>
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                <Verified size={12} className="text-yellow-500" />
                {warranty}
              </div>
            </div>
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Wrench size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Service Description */}
        {serviceDescription && (
          <div className="mb-6">
            <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Description</h3>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {serviceDescription}
            </p>
          </div>
        )}

        {/* Service Features */}
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-lg text-gray-900">Service Includes:</h3>
          {(showAllFeatures ? features : features.slice(0, 3)).map((feature: string, index: number) => (
            <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500" />
              <span>{feature}</span>
            </div>
          ))}

          {features.length > 3 && (
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="text-blue-600 text-sm font-medium mt-2 flex items-center gap-1"
            >
              {showAllFeatures ? 'Show Less' : `Show ${features.length - 3} More`}
              <span className="text-lg">{showAllFeatures ? '↑' : '↓'}</span>
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Clock size={16} className="text-blue-500" />
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Service Time</p>
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{serviceTime}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <ShieldCheck size={16} className="text-green-500" />
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brands Supported</p>
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{brandSupport}</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(servicePrice)}</span>
              {originalPrice && originalPrice > servicePrice && (
                <span className="text-gray-500 line-through ml-2">{formatPrice(originalPrice)}</span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                {discountPercentage}% OFF
              </span>
            )}
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inclusive of all taxes</p>

          {/* Quantity Selector */}
          <div className="mt-4">
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Quantity:</p>
            <div className="flex items-center gap-4">
              <div className={`flex items-center rounded-lg overflow-hidden border w-32 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300'}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="text-xl">−</span>
                </button>
                <span className={`flex-1 text-center text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="text-xl">+</span>
                </button>
              </div>
              <div className="text-sm">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Total:</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(servicePrice * quantity)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3 border-2 font-bold rounded-xl transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            Add to Cart
          </button>
          <button
            onClick={handleBookNow}
            className="flex-1 py-3 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-600 shadow-md transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} mx-4 mt-6 rounded-xl p-5 shadow-sm transition-colors duration-300`}>
          <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Related Services</h3>
          <div className="space-y-4">
            {relatedServices.map((service) => (
              <div
                key={service.id}
                onClick={() => router.push(`/service-detail/${service.id}?fromServices=true`)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${darkMode ? 'border-gray-700 hover:border-yellow-500 hover:bg-gray-700' : 'border-gray-200 hover:border-yellow-500 hover:shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-blue-100 to-blue-200'}`}>
                  <Toolbox size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{service.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                      <Star size={10} fill="currentColor" />
                      {service.rating}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{service.warranty}</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(service.price)}</p>
                  {service.originalPrice && (
                    <p className="text-xs text-gray-500 line-through">{formatPrice(service.originalPrice)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Highlights */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} mx-4 mt-6 rounded-xl p-5 shadow-sm transition-colors duration-300`}>
        <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose Us?</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center p-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Users size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
            </div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Expert Technicians</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Certified professionals</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Calendar size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Same Day Service</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick appointment slots</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <ShieldCheck size={20} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Genuine Parts</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>100% authentic components</p>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <Zap size={20} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
            </div>
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Quick Response</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Within 30 minutes</p>
          </div>
        </div>
      </div>

    </div>
  );
}