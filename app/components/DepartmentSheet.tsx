import React, { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './Skeleton';

interface DepartmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDepartment?: string;
  services?: any[];
  onServiceClick?: (service: any, event?: React.MouseEvent<HTMLButtonElement>) => void;
  darkMode?: boolean;
  loading?: boolean;
}

const DepartmentSheet: React.FC<DepartmentSheetProps> = ({
  isOpen,
  onClose,
  selectedDepartment = "all",
  services = [],
  onServiceClick,
  darkMode = false,
  loading = false,
}) => {
  const router = useRouter();

  // Scroll lock when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Prevent pull-to-refresh
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleServiceClick = (service: any, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (onServiceClick) {
      // Use the parent's handler which properly checks for subcategories and child categories
      onServiceClick(service, event);
      // Close the sheet after the parent handler executes
      onClose();
    } else {
      // Fallback: Direct navigation (this shouldn't happen if parent passes handler)
      localStorage.setItem('mainId', service._id);
      localStorage.setItem('mainCategoryTitle', service.name || service.serviceName);
      localStorage.removeItem('subId');
      localStorage.removeItem('subCategoryTitle');
      localStorage.removeItem('childId');
      localStorage.removeItem('childCategoryTitle');
      router.push('/services');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />

          {/* Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              // Close if dragged down significantly or with high velocity
              if (info.offset.y > 80 || info.velocity.y > 400) {
                onClose();
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 350
            }}
            className={`relative w-full max-h-[90%] rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col border-none pointer-events-auto ${darkMode ? "bg-[#0A0F1C]" : "bg-[#F3F4F8]"
              }`}
          >
            {/* Header / Drag Area */}
            <div className="shrink-0">
              {/* Drag Handle Area */}
              <div className="flex flex-col items-center py-4">
                <div className={`w-12 h-1.5 ${darkMode ? "bg-white/10" : "bg-gray-300"} rounded-full`} />
              </div>

              <div className="px-7 pb-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-2xl font-black tracking-tight leading-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {selectedDepartment === "all" ? "All Services" : selectedDepartment}
                    </h2>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {services.length} items found
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-none pointer-events-auto ${darkMode
                      ? "bg-white/10 text-white"
                      : "bg-white text-gray-600 shadow-lg"
                      }`}
                  >
                    <X size={18} className="stroke-[3px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable grid area - height adjusts automatically up to max-h */}
            <div className="px-6 pt-2 pb-16 overflow-y-auto overflow-x-hidden scroll-smooth min-h-[150px]">
              <div className="grid grid-cols-4 gap-2 min-[375px]:gap-4">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-2">
                      <Skeleton
                        variant="rectangular"
                        className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 rounded-2xl"
                        darkMode={darkMode}
                      />
                      <Skeleton
                        variant="text"
                        width="80%"
                        height={10}
                        darkMode={darkMode}
                      />
                    </div>
                  ))
                ) : services.map((service, index) => {
                  const serviceName = service.name || service.serviceName || `Service ${index + 1}`;
                  const isImageVisible = service.isMainCategoryImageVisible !== false;

                  return (
                    <button
                      key={service._id || index}
                      onClick={(e) => handleServiceClick(service, e)}
                      className="group flex flex-col items-center gap-2 p-2 rounded-2xl transition-all active:scale-95 pointer-events-auto"
                    >
                      <div className={`w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm transition-all group-hover:-translate-y-1 ${darkMode ? "bg-[#1E2536]" : "bg-white"
                        }`}>
                        {isImageVisible && service.imageUri ? (
                          <div className="w-full h-full p-1 min-[375px]:p-2 flex items-center justify-center">
                            <img
                              src={service.imageUri}
                              alt={serviceName}
                              className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl">⚡</span>
                        )}
                      </div>
                      <span className={`text-[9px] min-[375px]:text-[11px] font-semibold text-center leading-tight line-clamp-2 break-words hyphens-auto ${darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                        {serviceName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {services.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <p className="font-bold">No items found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepartmentSheet;