"use client";

import { X, Star, Verified, Clock, CheckCircle, Shield, Tag } from 'lucide-react';
import Link from 'next/link';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, serviceName }) => {
  if (!isOpen) return null;

  const service = {
    title: 'Advanced Foam Jet Service',
    rating: 4.8,
    warranty: '45 Days Warranty',
    brandCount: 'Servicing 15+ Brands',
    features: [
      'Deep cleaning of filters & coils',
      '45-60 mins service time',
      'Professional technician',
      'All tools and equipment provided'
    ],
    price: 599,
    originalPrice: 899,
    discount: '33% OFF',
    includes: [
      'Advanced foam cleaning',
      'Filter replacement',
      'Cooling check',
      'Final testing'
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl w-[90%] max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-dark">{service.title}</h2>
            <button onClick={onClose} className="p-2">
              <X size={24} className="text-text-gray" />
            </button>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-sm font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
              <Star size={12} />
              {service.rating}
            </div>
            <div className="flex items-center gap-1 text-xs text-text-gray bg-gray-100 px-2 py-0.5 rounded">
              <Verified size={12} className="text-yellow-primary" />
              {service.warranty}
            </div>
            <div className="flex items-center gap-1 text-xs text-text-gray bg-blue-50 px-2 py-0.5 rounded">
              <Tag size={12} className="text-blue-icon" />
              {service.brandCount}
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center mb-2">
              <div className="text-sm text-text-gray mb-1">TOTAL SERVICE COST</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-bold text-text-dark">₹{service.price}</span>
                <span className="text-text-gray line-through">₹{service.originalPrice}</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                {service.discount}
              </span>
              <div className="text-xs text-text-gray mt-1">Inclusive of all taxes</div>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-dark mb-3">How it works</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-blue-icon rounded-full"></div>
                </div>
                <div>
                  <div className="font-bold text-text-dark">Technician Arrival & Safety</div>
                  <div className="text-sm text-text-gray">
                    Our verified technician arrives in uniform, wearing a mask and carrying a sanitization kit.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-bold text-text-dark">Service Documentation</div>
                  <div className="text-sm text-text-gray">
                    Complete service report with before-after photos and warranty certificate.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Includes */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-dark mb-3">Service Includes</h3>
            <div className="grid grid-cols-2 gap-2">
              {service.includes.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-sm text-text-gray">1 ITEM • ₹{service.price}</div>
                <div className="text-xs text-text-gray">Extra charges may apply</div>
              </div>
              <Link href="/cart" onClick={onClose}>
                <button className="text-yellow-primary font-bold hover:text-yellow-dark">
                  View Cart
                </button>
              </Link>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 text-text-gray font-bold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <Link href="/service-detail" onClick={onClose}>
                <button className="flex-1 py-3 bg-yellow-primary text-text-dark font-bold rounded-xl hover:bg-yellow-dark shadow-md">
                  Add to Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;