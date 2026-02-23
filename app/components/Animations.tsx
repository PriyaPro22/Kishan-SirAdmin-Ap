'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Zap, Wrench, Droplet, Flame, Wind, Home } from 'lucide-react';

/**
 * Lottie Animation Wrapper
 * This component will display Lottie animations
 * Place your .json animation files in /public/animations/
 */
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function AnimationSuccess() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl"
        >
          ✓
        </motion.div>
      </motion.div>
      <p className="mt-4 text-green-600 dark:text-green-400 font-semibold">Booking Confirmed!</p>
    </motion.div>
  );
}

export function AnimationLoading() {
  return (
    <motion.div className="flex items-center justify-center p-8">
      <motion.div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-yellow-500 rounded-full"
            animate={{ y: [-8, 0, -8] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export function AnimationError() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 flex items-center justify-center"
        animate={{ x: [-5, 5, -5, 5, 0] }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-4xl"
        >
          ✕
        </motion.div>
      </motion.div>
      <p className="mt-4 text-red-600 dark:text-red-400 font-semibold">Something went wrong</p>
    </motion.div>
  );
}

export function AnimationEmpty() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Home size={40} className="text-gray-400" />
      </motion.div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">No services found</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
    </motion.div>
  );
}

/**
 * Service Category Animations
 */
export function AnimatedServiceIcon({ type }: { type: 'electrical' | 'plumbing' | 'hvac' | 'cleaning' | 'repair' | 'home' }) {
  const iconMap = {
    electrical: <Zap className="w-full h-full" />,
    plumbing: <Droplet className="w-full h-full" />,
    hvac: <Wind className="w-full h-full" />,
    cleaning: <div className="text-2xl">🧹</div>,
    repair: <Wrench className="w-full h-full" />,
    home: <Home className="w-full h-full" />,
  };

  const colorMap = {
    electrical: 'from-yellow-400 to-yellow-600',
    plumbing: 'from-blue-400 to-blue-600',
    hvac: 'from-cyan-400 to-cyan-600',
    cleaning: 'from-green-400 to-green-600',
    repair: 'from-violet-400 to-violet-600',
    home: 'from-amber-400 to-amber-600',
  };

  return (
    <motion.div
      className={`w-16 h-16 bg-gradient-to-br ${colorMap[type]} rounded-2xl flex items-center justify-center text-white shadow-lg`}
      whileHover={{ 
        scale: 1.15,
        rotate: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
    >
      {iconMap[type]}
    </motion.div>
  );
}

export function AnimatedFloatingAction() {
  return (
    <motion.div
      className="fixed bottom-24 right-6 z-40"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer">
        <Zap size={24} />
      </div>
    </motion.div>
  );
}
