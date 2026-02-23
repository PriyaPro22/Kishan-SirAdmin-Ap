import { X } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSelect, department }) => {
  if (!isOpen) return null;

  const categories = {
    'Home Appliances': ['AC', 'Refrigerator', 'Washing Machine', 'Microwave'],
    'Computer & Laptop': ['Desktop', 'Laptop', 'Printer', 'Accessories'],
    'Mobile & Tablets': ['Smartphone', 'Tablet', 'Accessories', 'Repair'],
    'All Departments': ['Electronics', 'Home', 'Personal Care', 'Automotive']
  };

  const deptCategories = categories[department] || categories['All Departments'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Select Category</h2>
              <p className="text-gray-600 text-sm">Department: {department}</p>
            </div>
            <button onClick={onClose} className="p-2">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {deptCategories.map((category) => (
              <button
                key={category}
                className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 flex flex-col items-center"
                onClick={() => onSelect(category)}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                </div>
                <span className="font-medium">{category}</span>
              </button>
            ))}
          </div>
          
          <button
            className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
            onClick={() => onSelect('All Categories')}
          >
            View All Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;