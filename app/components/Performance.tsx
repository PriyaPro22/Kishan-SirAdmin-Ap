'use client';
import { useEffect, useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  pageLoadTime: number;
}

/**
 * Performance Monitor - Shows real-time performance metrics
 * Only visible in development mode
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Collect Core Web Vitals
    if ('web-vital' in window) {
      const webVital = (require('web-vitals') as any);
      
      webVital.getCLS((metric: any) => {
        setMetrics(prev => ({ ...prev, cls: metric.value } as any));
      });
      
      webVital.getFID((metric: any) => {
        setMetrics(prev => ({ ...prev, fid: metric.value } as any));
      });
      
      webVital.getFCP((metric: any) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value } as any));
      });
      
      webVital.getLCP((metric: any) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value } as any));
      });
    }

    // Page load time
    if (window.performance) {
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        setMetrics(prev => ({ ...prev, pageLoadTime } as any));
      });
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) return null;

  const getMetricColor = (value: number, metric: string) => {
    // Good, Needs Improvement, Poor
    const thresholds: Record<string, [number, number]> = {
      fcp: [1800, 3000],
      lcp: [2500, 4000],
      cls: [0.1, 0.25],
      fid: [100, 300],
      pageLoadTime: [2000, 3000],
    };

    const [good, poor] = thresholds[metric] || [0, Infinity];
    if (value <= good) return 'text-green-500';
    if (value <= poor) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Activity size={20} />
      </motion.button>

      {/* Metrics Panel */}
      {isVisible && (
        <motion.div
          className="fixed bottom-20 left-4 z-40 bg-gray-900 text-white p-4 rounded-lg shadow-2xl border border-purple-500/30 w-64 font-mono text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-500/20">
            <Zap size={16} className="text-yellow-400" />
            <span className="font-bold">Performance Metrics</span>
          </div>

          <div className="space-y-2">
            {metrics.fcp && (
              <div className="flex justify-between items-center">
                <span>FCP:</span>
                <span className={getMetricColor(metrics.fcp, 'fcp')}>
                  {metrics.fcp.toFixed(0)}ms
                </span>
              </div>
            )}
            {metrics.lcp && (
              <div className="flex justify-between items-center">
                <span>LCP:</span>
                <span className={getMetricColor(metrics.lcp, 'lcp')}>
                  {metrics.lcp.toFixed(0)}ms
                </span>
              </div>
            )}
            {metrics.cls && (
              <div className="flex justify-between items-center">
                <span>CLS:</span>
                <span className={getMetricColor(metrics.cls, 'cls')}>
                  {metrics.cls.toFixed(3)}
                </span>
              </div>
            )}
            {metrics.fid && (
              <div className="flex justify-between items-center">
                <span>FID:</span>
                <span className={getMetricColor(metrics.fid, 'fid')}>
                  {metrics.fid.toFixed(0)}ms
                </span>
              </div>
            )}
            {metrics.pageLoadTime && (
              <div className="flex justify-between items-center">
                <span>Load:</span>
                <span className={getMetricColor(metrics.pageLoadTime, 'pageLoadTime')}>
                  {metrics.pageLoadTime.toFixed(0)}ms
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs text-gray-400">
            <p>🟢 Good | 🟡 Needs Work | 🔴 Poor</p>
          </div>
        </motion.div>
      )}
    </>
  );
}

/**
 * Quick Stats Component - Shows key metrics in a card format
 */
export function PerformanceStats() {
  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 dark:from-blue-950 to-purple-50 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Activity size={20} className="text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-gray-900 dark:text-white">Performance Optimizations Active</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">✓ Code Splitting</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">✓ Image Optimization</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">✓ Lazy Loading</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">✓ Animations</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">✓ Caching</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">✓ Font Optimization</span>
        </div>
      </div>
    </motion.div>
  );
}
