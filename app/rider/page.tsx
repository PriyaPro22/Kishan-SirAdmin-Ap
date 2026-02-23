'use client'

import { useState } from 'react'
import { Lamp, MapPin, Clock, Phone, Navigation, ChevronRight, DollarSign, Star, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RiderPage() {
    const router = useRouter()
    const [isOnline, setIsOnline] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white pb-20">
            {/* Header */}
            <header className="bg-yellow-400 pt-12 pb-6 px-5 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Lamp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Rider Mode</h1>
                            <p className="text-sm text-gray-700">Deliver & Earn</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-md"
                    >
                        Exit
                    </button>
                </div>

                {/* Online/Offline Toggle */}
                <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="font-semibold text-gray-900">
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${isOnline
                                ? 'bg-red-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}
                    >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-5 mt-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600">Today's Earnings</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹0</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-gray-600">Deliveries</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                </div>

                {/* Current Status */}
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <Lamp className="w-8 h-8 text-white" />
                        <h2 className="text-xl font-bold text-white">Ready to Ride?</h2>
                    </div>
                    <p className="text-white/90 mb-4">
                        {isOnline
                            ? 'Waiting for new delivery requests...'
                            : 'Go online to start accepting deliveries'}
                    </p>
                    {!isOnline && (
                        <button
                            onClick={() => setIsOnline(true)}
                            className="w-full bg-white text-yellow-600 font-bold py-3 rounded-xl hover:bg-yellow-50 transition-all"
                        >
                            Start Delivering
                        </button>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-5 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-medium text-gray-700">My Ratings</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-gray-700">Earnings History</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-gray-700">Support</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-purple-500" />
                                <span className="font-medium text-gray-700">Profile Settings</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <Navigation className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Navigation Tips</h4>
                            <p className="text-sm text-blue-700">
                                Keep your GPS on for accurate location tracking. This helps customers track their deliveries in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
