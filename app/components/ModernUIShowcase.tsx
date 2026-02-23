'use client';
import { ModernHeader } from '@/app/components/ModernHeader';
import { ModernButton, QuickActionButton } from '@/app/components/ModernButton';
import { ServiceGrid } from '@/app/components/ModernServiceCard';
import { BrandHeader } from '@/app/components/Branding';

import { showSuccess, showError } from '@/app/components/Toast';
import { AnimatedServiceIcon } from '@/app/components/Animations';
import { PerformanceStats } from '@/app/components/Performance';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wrench, Droplet, Wind } from 'lucide-react';

/**
 * Example Page showcasing all new components
 * This is a reference implementation - adapt to your needs
 */
export default function ModernUIShowcase() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const mockServices = [
    {
      id: 1,
      title: 'Electrical Repair',
      category: 'electrical',
      price: 299,
      rating: 4.8,
      reviews: 234,
      time: '20 mins',
      icon: Zap,
      featured: true,
    },
    {
      id: 2,
      title: 'Plumbing Service',
      category: 'plumbing',
      price: 199,
      rating: 4.5,
      reviews: 156,
      time: '30 mins',
      icon: Droplet,
    },
    {
      id: 3,
      title: 'AC Maintenance',
      category: 'hvac',
      price: 499,
      rating: 4.7,
      reviews: 189,
      time: '45 mins',
      icon: Wind,
    },
    {
      id: 4,
      title: 'General Repair',
      category: 'repair',
      price: 149,
      rating: 4.3,
      reviews: 101,
      time: '25 mins',
      icon: Wrench,
    },
  ];

  const handleBooking = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    showSuccess('✨ Booking confirmed! Technician arriving soon.');
  };

  const handleQuickAction = (action: string) => {
    showSuccess(`📌 ${action} service selected!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Header */}
      <ModernHeader
        location="Mumbai, India"
        showNotification={true}
        notificationCount={2}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <BrandHeader />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold">Instant Home Services</p>
            <p className="text-xs">24/7 Available</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '⚡', label: 'Electrical', action: 'Electrical' },
              { icon: '🔧', label: 'Maintenance', action: 'Maintenance' },
              { icon: '💧', label: 'Plumbing', action: 'Plumbing' },
              { icon: '❄️', label: 'AC Service', action: 'AC' },
            ].map((item, idx) => (
              <QuickActionButton
                key={idx}
                icon={item.icon}
                label={item.label}
                onClick={() => handleQuickAction(item.action)}
              />
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Available Services</h2>
          <ServiceGrid
            services={mockServices}
            columns={2}
            onSelectService={(service) => {
              setSelectedService(service);
              showSuccess(`Selected: ${service.title}`);
            }}
          />
        </motion.div>

        {/* Selected Service Details */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-50 dark:from-yellow-950 to-orange-50 dark:to-orange-950 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedService.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Price: <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">₹{selectedService.price}</span>
            </p>

            <div className="flex gap-3">
              <ModernButton
                variant="primary"
                size="lg"
                loading={isLoading}
                onClick={handleBooking}
                fullWidth
              >
                {isLoading ? 'Booking...' : 'Book Now'}
              </ModernButton>
              <ModernButton
                variant="outline"
                size="lg"
                onClick={() => setSelectedService(null)}
              >
                Cancel
              </ModernButton>
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 dark:from-yellow-700 dark:via-yellow-600 dark:to-orange-700 rounded-2xl p-8 text-center text-white shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-4">Need Instant Help?</h2>
          <p className="text-lg mb-6 opacity-90">Professional technicians ready in your area, right now!</p>
          <ModernButton
            variant="secondary"
            size="lg"
            onClick={() => showSuccess('Opening chat with support...')}
          >
            Chat with Support
          </ModernButton>
        </motion.div>

        {/* Performance Stats */}
        <PerformanceStats />
      </div>
    </div>
  );
}
