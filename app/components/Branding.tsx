'use client';
import { motion } from 'framer-motion';
import { Zap, Lightbulb } from 'lucide-react';

/**
 * Professional Brand Logo
 * Company: Bijli Wala Aya
 * Focus: Electricity & Home Services
 */
export function BrandLogo({ size = 'md', variant = 'default' }: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'animated';
}) {
  const sizeMap = {
    sm: { container: 'w-8 h-8', icon: 24 },
    md: { container: 'w-12 h-12', icon: 32 },
    lg: { container: 'w-16 h-16', icon: 48 },
  };

  const currentSize = sizeMap[size];

  if (variant === 'minimal') {
    return (
      <div className={`${currentSize.container} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg`}>
        <Zap size={currentSize.icon} className="text-white" strokeWidth={2.5} />
      </div>
    );
  }

  if (variant === 'animated') {
    return (
      <motion.div
        className={`${currentSize.container} bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg overflow-hidden cursor-pointer`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 20px rgba(250, 204, 21, 0.3)', '0 0 30px rgba(250, 204, 21, 0.5)', '0 0 20px rgba(250, 204, 21, 0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap size={currentSize.icon} className="text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`${currentSize.container} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg`}>
      <Zap size={currentSize.icon} className="text-white" strokeWidth={2.5} />
    </div>
  );
}

/**
 * Brand Header with Logo & Text
 */
export function BrandHeader() {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BrandLogo size="md" variant="animated" />
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bijli Wala</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Instant Home Services</p>
      </div>
    </motion.div>
  );
}

/**
 * Service Icons with Brand Colors
 */
export function BrandedServiceIcon({ 
  icon: Icon, 
  category 
}: { 
  icon: React.ComponentType<any>; 
  category?: string;
}) {
  const categoryColors: Record<string, string> = {
    electrical: 'from-yellow-400 to-yellow-600',
    plumbing: 'from-blue-400 to-blue-600',
    maintenance: 'from-purple-400 to-purple-600',
    cleaning: 'from-green-400 to-green-600',
    default: 'from-gray-400 to-gray-600',
  };

  const gradient = categoryColors[category || 'default'];

  return (
    <motion.div
      className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-md`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Icon size={24} />
    </motion.div>
  );
}

/**
 * Quality Badge Component
 */
export function QualityBadge() {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-full border border-yellow-200 dark:border-yellow-700"
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Lightbulb size={14} className="text-yellow-600 dark:text-yellow-400" />
      <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Verified Service</span>
    </motion.div>
  );
}

/**
 * Brand Accent - Used for highlights
 */
export function BrandAccent() {
  return (
    <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
  );
}
