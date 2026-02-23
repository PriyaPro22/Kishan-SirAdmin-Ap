'use client'

import { useState } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}