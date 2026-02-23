'use client';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin } from 'lucide-react';
import { cardHoverAnimation } from '@/app/lib/animations';
import { BrandedServiceIcon, QualityBadge } from './Branding';
import Image from 'next/image';

interface ModernServiceCardProps {
  id: number;
  title: string;
  category: string;
  icon?: any;
  image?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  time?: string;
  location?: string;
  onPress?: (service: any) => void;
  featured?: boolean;
}

export function ModernServiceCard({
  id,
  title,
  category,
  icon,
  image,
  price,
  rating = 4.5,
  reviews = 100,
  time = '30 mins',
  location = 'Your location',
  onPress,
  featured = false,
}: ModernServiceCardProps) {
  return (
    <motion.div
      className={`relative${featured ? ' bg-gradient-to-br from-yellow-50 dark:from-yellow-950 to-orange-50 dark:to-orange-950' : ''} rounded-2xl overflow-hidden cursor-pointer group`}
      {...cardHoverAnimation}
      onClick={() => onPress?.({ id, title, category, icon, image, price })}
    >
      <div className={`rounded-2xl border ${featured ? 'border-yellow-200 dark:border-yellow-700' : 'border-gray-200 dark:border-gray-700'} overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition-shadow group-hover:shadow-lg`}>
        {/* Image Section */}
        {image ? (
          <div className="relative w-full h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            <motion.img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            {icon && <BrandedServiceIcon icon={icon} category={category} />}
            {featured && (
              <motion.div
                className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Popular
              </motion.div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-4">
          {/* Title and Badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{category}</p>
            </div>
          </div>

          {/* Quality Badge */}
          {featured && <div className="mb-3"><QualityBadge /></div>}

          {/* Rating and Time */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.1 }}>
              <Star size={14} className="text-yellow-500" fill="currentColor" />
              <span className="font-semibold text-gray-900 dark:text-white">{rating}</span>
              <span className="text-gray-500 dark:text-gray-400">({reviews})</span>
            </motion.div>
            {time && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock size={14} />
                <span>{time}</span>
              </div>
            )}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            {price && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{price}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ onwards</span>
              </motion.div>
            )}
            <motion.button
              className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg font-semibold text-xs shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Service Card Grid Layout
 */
export function ServiceGrid({
  services,
  columns = 2,
  onSelectService,
}: {
  services: ModernServiceCardProps[];
  columns?: number;
  onSelectService?: (service: ModernServiceCardProps) => void;
}) {
  return (
    <motion.div
      className={`grid grid-cols-${columns} gap-4`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
    >
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ModernServiceCard
            {...service}
            onPress={onSelectService}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
