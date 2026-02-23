'use client'

import { useState } from 'react'

export default function DepartmentTabs() {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'home', label: 'Home Appliances' },
    { id: 'computer', label: 'Computer' },
    { id: 'mobile', label: 'Mobile' },
  ]

  return (
    <div>
      <div className="flex space-x-4 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium ${activeTab === tab.id ? 'bg-yellow-gradient text-gray-800 shadow-sm' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}