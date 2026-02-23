'use client'

import { X, Home, Settings, HelpCircle, Shield, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Home, label: 'My Bookings', href: '/bookings' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
    { icon: LogOut, label: 'Logout', href: '/logout' },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                BW
              </div>
              <div className="ml-3">
                <h1 className="font-bold text-lg">Bijli Wala</h1>
                <p className="text-sm text-gray-600">AC Service & Repair</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                U
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">Hi, User</h3>
                <p className="text-sm text-gray-600">New York, USA</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Wallet: $250
              </button>
              <button className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium">
                Rewards
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Promo Banner */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
            <div className="text-sm font-semibold mb-1">LIMITED OFFER</div>
            <p className="text-sm mb-3">Get 20% off on your first AC Service</p>
            <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}