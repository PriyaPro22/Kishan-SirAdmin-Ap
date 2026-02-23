'use client';
import { Search, MapPin, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { BrandLogo } from './Branding';
import { IconButton } from './ModernButton';

interface ModernHeaderProps {
  location?: string;
  onMenuClick?: () => void;
  showNotification?: boolean;
  notificationCount?: number;
}

export function ModernHeader({
  location = 'New York, USA',
  onMenuClick,
  showNotification = false,
  notificationCount = 0,
}: ModernHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-4 py-4">
        {/* Top Row - Logo and Actions */}
        <div className="flex items-center justify-between mb-4">
          {/* Brand Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BrandLogo size="md" variant="animated" />
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            {showNotification && (
              <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
                  <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                  {notificationCount > 0 && (
                    <motion.div
                      className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </motion.div>
                  )}
                </button>
              </motion.div>
            )}

            {/* Menu Button */}
            <motion.button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Search and Location */}
        <div className="space-y-3">
          {/* Location */}
          <motion.div
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            whileHover={{ x: 4 }}
          >
            <MapPin size={16} className="text-yellow-500 flex-shrink-0" />
            <span className="font-medium truncate">{location}</span>
          </motion.div>

          {/* Search Bar */}
          <motion.div className="relative">
            <motion.div
              className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
              animate={{
                borderColor: isSearchExpanded ? 'rgb(250, 204, 21)' : 'rgb(209, 213, 219)',
                boxShadow: isSearchExpanded ? '0 0 0 3px rgba(250, 204, 21, 0.1)' : 'none',
              }}
            >
              <Search size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setIsSearchExpanded(false)}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
