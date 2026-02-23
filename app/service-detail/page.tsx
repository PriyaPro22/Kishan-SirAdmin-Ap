"use client";

import { ArrowLeft, Star, Verified, CheckCircle, Shield, Clock, Home, Grid3x3, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ServiceDetailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-bg pb-24">
      <header className="bg-white sticky top-0 z-40 shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft size={24} />
            <span className="text-lg font-bold text-text-dark">AC Repair</span>
          </button>
        </div>
      </header>

      <div className="relative w-full aspect-[16/10] bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-primary text-text-dark text-[10px] font-bold mb-2">
            <Shield size={12} />
            <span>45 Days Service Warranty</span>
          </div>
          <h2 className="text-white text-xl font-bold">Why choose Bijli Wala Aya?</h2>
          <p className="text-white/80 text-xs mt-1">Experience premium service quality & fast support.</p>
        </div>
      </div>

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

      <div className="bg-white mx-4 mt-6 rounded-xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-dark">Advanced Foam Jet Service</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-sm font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                <Star size={12} />
                4.8
              </div>
              <div className="flex items-center gap-1 text-xs text-text-gray bg-gray-100 px-2 py-0.5 rounded">
                <Verified size={12} className="text-yellow-primary" />
                45 Days Warranty
              </div>
            </div>
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Wrench size={24} className="text-blue-icon" />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-lg text-text-dark">Service Includes:</h3>
          <div className="flex items-center gap-3 text-sm text-text-gray">
            <CheckCircle size={16} className="text-green-500" />
            <span>Deep cleaning of filters & coils</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-gray">
            <Clock size={16} className="text-blue-500" />
            <span>45-60 mins service time</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-gray">
            <Verified size={16} className="text-yellow-primary" />
            <span>Servicing 15+ Brands</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl font-bold text-text-dark">₹599</span>
              <span className="text-text-gray line-through ml-2">₹899</span>
            </div>
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              33% OFF
            </span>
          </div>
          <p className="text-xs text-text-gray">Inclusive of all taxes</p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 border-2 border-gray-300 text-text-gray font-bold rounded-xl hover:bg-gray-50">
            Save for Later
          </button>
          <Link href="/booking">
            <button className="flex-1 py-3 bg-yellow-primary text-text-dark font-bold rounded-xl hover:bg-yellow-dark shadow-md">
              Book Now
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
}

import { Wrench } from 'lucide-react';