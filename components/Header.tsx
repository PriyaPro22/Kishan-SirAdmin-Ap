'use client'

import { Search, Bell, Menu, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-yellow-100 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu Button */}
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Center: Location & Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex flex-col">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="font-medium">New York, USA</span>
              </div>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Notification & User */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2">
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>
            <Link href="/profile" className="p-2">
              <User className="h-6 w-6 text-gray-700" />
            </Link>
          </div>
        </div>

        {/* Rider Mode Badge */}
        {pathname === '/' && (
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 bg-yellow-gradient rounded-full text-gray-800 text-sm font-semibold">
              <span className="mr-2">🚀</span>
              RIDER MODE
            </div>
          </div>
        )}
      </div>
    </header>
  )
}