'use client'

import { Home, ShoppingBag, Calendar, User, Package, Lamp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'HOME', href: '/' },
    { icon: Lamp, label: 'RIDER', href: '/rider' },
    { icon: ShoppingBag, label: 'SERVICES', href: '/services' },
    { icon: Package, label: 'SHOPPING', href: '/shopping' },
    { icon: Calendar, label: 'BOOKINGS', href: '/bookings' },
    { icon: User, label: 'PROFILE', href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-end py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center gap-1 py-2 px-3 group transition-all duration-300"
            >
              {/* Glow Effect Background - Only for active state */}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-b from-yellow-400/30 via-yellow-300/20 to-transparent rounded-t-full blur-sm" />
              )}

              {/* Icon Container */}
              <div className={`relative z-10 p-2.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-transparent text-gray-500 group-hover:bg-yellow-100 group-hover:text-yellow-600'
                }`}>
                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span className={`text-[10px] font-semibold tracking-tight transition-all duration-300 ${isActive
                  ? 'text-yellow-600'
                  : 'text-gray-500 group-hover:text-yellow-600'
                }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}