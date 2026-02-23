import { Search, MapPin, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 pt-6 pb-3">
      {/* Top Row - User Info and Notification */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Profile Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-text">U</span>
          </div>
          
          {/* User Greeting and Location */}
          <div>
            <h1 className="text-lg font-semibold text-primary-text">Hi, User</h1>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-secondary-text" />
              <span className="text-xs text-secondary-text">New York, USA</span>
            </div>
          </div>
        </div>
        
        {/* Notification Bell */}
        <button className="w-10 h-10 rounded-full bg-white-surface flex items-center justify-center shadow-soft hover:shadow-medium transition-shadow">
          <Bell size={20} className="text-primary-text" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-yellow rounded-full border border-white-surface"></span>
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-12 pr-4 py-3 bg-white-surface rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow text-sm text-primary-text placeholder-muted-text shadow-soft"
        />
      </div>
    </header>
  );
}