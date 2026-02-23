'use client';

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useUltraAPI } from '@/app/lib/ultraAPI';
import { ultraCache } from '@/app/lib/ultraCache';

// Dynamically import heavy components
import { ModernHeader as Header } from '@/app/components/ModernHeader';
import { ServiceGrid } from '@/app/components/ModernServiceCard';

import { PerformanceOptimizer } from '@/app/components/PerformanceOptimizer';


// Dynamically import heavy components
// const Header = dynamic(() => import('@/app/components/ModernHeader'), { ssr: false });
// const ServiceGrid = dynamic(() => import('@/app/components/ModernServiceCard').then(m => ({ default: m.ServiceGrid })), { ssr: false });
// const LoadingSpinner = dynamic(() => import('@/app/components/Skeleton').then(m => ({ default: m.LoadingSpinner })), { ssr: false });

/**
 * Ultra-Optimized Home Page
 * Target: Page load < 50ms, API calls < 20ms
 */

// Memoized service card component to prevent re-renders
const OptimizedServiceCard = memo(({ service, onPress }: { service: any; onPress: (s: any) => void }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPress?.(service)}
      className="cursor-pointer"
    >
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{service.category}</p>
        <button className="w-full py-2 bg-yellow-500 text-white rounded-lg font-semibold">
          Book Now
        </button>
      </div>
    </motion.div>
  );
});

OptimizedServiceCard.displayName = 'OptimizedServiceCard';

export default function UltraOptimizedHomePage() {
  // Fetch data with ultra-fast caching (< 20ms)
  const { data: mainData, loading: mainLoading } = useUltraAPI<any[]>(
    '/product-listing/main',
    { cache: true, cacheTTL: 300000, immutable: false }
  );

  // Local state - minimized
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Memoize filtered services (< 1ms)
  const filteredServices = useMemo(() => {
    if (!mainData || !Array.isArray(mainData)) return [];

    if (selectedCategory === 'all') {
      return mainData.slice(0, 10); // Limit to 10 for performance
    }

    return mainData.filter((s: any) => s.category === selectedCategory).slice(0, 10);
  }, [mainData, selectedCategory]);

  // Memoize categories (< 1ms)
  const categories = useMemo(() => {
    if (!mainData || !Array.isArray(mainData)) return [];
    const cats = new Set(mainData.map((s: any) => s.category));
    return ['all', ...Array.from(cats)];
  }, [mainData]);

  // Optimize callbacks with useCallback
  const handleServicePress = useCallback((service: any) => {
    setSelectedService(service);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Preload next data on idle
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload sub-categories when idle
        mainData?.forEach((item: any) => {
          if (item.id) {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in';
            ultraCache.fetch(
              `sub-${item.id}`,
              () => fetch(`${baseUrl}/api/product-listing/main/${item.id}/sub`).then(r => r.json()),
              { ttl: 300000, immutable: false, priority: 'normal' }
            ).catch(() => null);
          }
        });
      });
    }
  }, [mainData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Performance Optimizer */}
      <PerformanceOptimizer />

      {/* Header */}
      <Header location="Your Location" showNotification={true} notificationCount={2} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Category Filter - Memoized */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Services Grid - Ultra-optimized */}
        {mainLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, staggerChildren: 0.05 }}
          >
            {filteredServices.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <OptimizedServiceCard
                  service={service}
                  onPress={handleServicePress}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Selected Service Details */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm"
          >
            <h3 className="font-bold text-xl mb-2">{selectedService.title}</h3>
            <button
              onClick={() => setSelectedService(null)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              Close
            </button>
          </motion.div>
        )}
      </div>

      {/* Performance Stats */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg text-sm font-mono max-w-xs">
          <div>Cache Hits: {ultraCache.getStats().hits}</div>
          <div>Cache Size: {(ultraCache.getStats().size / 1024).toFixed(2)}KB</div>
          <div>Pending Requests: {ultraCache.getStats().pending}</div>
        </div>
      )}
    </div>
  );
}
