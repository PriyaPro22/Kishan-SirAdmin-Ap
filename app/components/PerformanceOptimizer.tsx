'use client';

import React, { useEffect } from 'react';

/**
 * Service Worker Registration & Performance Setup
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Register Service Worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Prefetch critical resources
    const prefetchLinks = [
      { rel: 'prefetch', href: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bijliwalaaya.in'}/api/product-listing/main` },
      { rel: 'dns-prefetch', href: 'https://api.bijliwalaaya.in' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    ];

    prefetchLinks.forEach(({ rel, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    });

    // Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Load analytics or other non-critical scripts
        console.log('🚀 Non-critical tasks loaded');
      });
    }

    // Monitor performance
    if (window.performance && window.performance.getEntriesByType) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as any;
      if (perfData) {
        const pageLoadTime = perfData.loadEventEnd - perfData.loadEventStart;
        console.log(`📊 Page Load Time: ${pageLoadTime.toFixed(2)}ms`);

        // Send to analytics
        if (pageLoadTime < 50) {
          console.log('🎉 Ultra-fast page load achieved!');
        } else if (pageLoadTime < 100) {
          console.log('⚡ Fast page load!');
        }
      }
    }
  }, []);

  return null;
}

/**
 * Preload Critical Data
 */
export async function prefetchCriticalData() {
  if (typeof window === 'undefined') return;

  const { ultraAPI } = await import('@/app/lib/ultraAPI');

  // Preload main data
  await ultraAPI.prefetch([
    '/product-listing/main',
    '/product-listing/main/ac_auEm/sub',
  ]);
}
