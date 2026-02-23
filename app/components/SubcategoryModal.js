import { X } from 'lucide-react';

const SubcategoryModal = ({ isOpen, onClose, onSelect, category }) => {
  if (!isOpen) return null;

  const subcategories = {
    'AC': ['AC Installation', 'AC Repair', 'AC Service', 'Gas Refill'],
    'Refrigerator': ['Repair', 'Service', 'Installation'],
    'Laptop': ['Screen Repair', 'Software', 'Hardware', 'Cleaning'],
    'Smartphone': ['Screen Repair', 'Battery', 'Software', 'Water Damage']
  };

  const categorySubs = subcategories[category] || ['Repair', 'Service', 'Installation', 'Maintenance'];

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
              <h2 className="text-xl font-bold">Select Service</h2>
              <p className="text-gray-600 text-sm">Category: {category}</p>
            </div>
            <button onClick={onClose} className="p-2">
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-3">
            {categorySubs.map((sub) => (
              <button
                key={sub}
                className="w-full p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 flex justify-between items-center"
                onClick={onSelect}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{sub}</div>
                    <div className="text-sm text-gray-600">Starting from ₹499</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ))}
          </div>
          
          <button
            className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
            onClick={onSelect}
          >
            Proceed to Service Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryModal;