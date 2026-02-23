"use client";

import { X, ChevronRight, Home, Monitor, Smartphone, Tv, Refrigerator, Wrench, Microwave, Car, Dumbbell, Sofa } from 'lucide-react';
import Link from 'next/link';

interface DepartmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentSheet: React.FC<DepartmentSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const departments = [
    { name: 'All Departments', icon: <div className="text-lg font-bold">All</div>, color: 'bg-gray-card' },
    { name: 'Home Appliances', icon: <Home size={22} className="text-text-dark" />, color: 'bg-pink-100' },
    { name: 'Computer & Laptop', icon: <Monitor size={22} className="text-text-dark" />, color: 'bg-orange-100' },
    { name: 'Mobile & Tablets', icon: <Smartphone size={22} className="text-text-dark" />, color: 'bg-green-100' },
    { name: 'Electronics', icon: <Tv size={20} className="text-text-dark" />, color: 'bg-blue-100' },
    { name: 'Kitchen Appliances', icon: <Microwave size={22} className="text-text-dark" />, color: 'bg-red-100' },
    { name: 'Furniture', icon: <Sofa size={22} className="text-text-dark" />, color: 'bg-yellow-100' },
    { name: 'Health & Fitness', icon: <Dumbbell size={22} className="text-text-dark" />, color: 'bg-purple-100' },
    { name: 'Automotive', icon: <Car size={22} className="text-text-dark" />, color: 'bg-indigo-100' },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="p-5">
          {/* Drag Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-dark">Select Department</h2>
            <button onClick={onClose} className="p-2">
              <X size={24} className="text-text-gray" />
            </button>
          </div>
          
          <div className="space-y-2">
            {departments.map((dept, index) => (
              <Link key={index} href="/category" onClick={onClose}>
                <div className="w-full text-left p-4 rounded-lg hover:bg-gray-50 flex justify-between items-center group border border-transparent hover:border-gray-200 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${dept.color} rounded-full flex items-center justify-center mr-3`}>
                      {dept.icon}
                    </div>
                    <span className="font-medium text-text-dark">{dept.name}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-yellow-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSheet;