
// "use client";

// import React, { useState } from 'react';
// import { Home, Laptop, Briefcase, ShoppingCart, User } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// interface BottomNavProps {
//   darkMode: boolean;
// }

// const BottomNav = ({ darkMode }: BottomNavProps) => {
//   const router = useRouter();
//   const [activeIndex, setActiveIndex] = useState(0);
//   const totalItems = 2;

//   const navItems = [
//     { id: 0, label: "Home", icon: Home, path: "/" },
//     { id: 1, label: "Services", icon: Laptop, path: "/services" },
//     { id: 2, label: "Hiring", icon: Briefcase, isSpecial: true, path: "/" },
//     { id: 3, label: "Cart", icon: ShoppingCart, path: "/payment", showBadge: true },
//     { id: 4, label: "Profile", icon: User, path: "/my-bookings" },
//   ];

//   const handleNavClick = (item: any, index: number) => {
//     setActiveIndex(index);
//     if (item.path) router.push(item.path);
//   };

//   return (
//     <div className={`fixed bottom-2 left-0 right-0 z-[100] flex justify-center transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
//       <div className="relative w-full max-w-[450px] px-4">

//         {/* 💡 MAIN ACTIVE LAMP - Clicking par ye move karta hai */}
//         <div className="absolute inset-x-4 top-0 h-16 pointer-events-none z-30">
//           <div
//             className="absolute w-1/5 h-full flex flex-col items-center transition-all duration-500 ease-in-out"
//             style={{ 
//               transform: `translateX(${activeIndex * 100}%)`,
//               opacity: activeIndex === 2 ? 0 : 1 
//             }}
//           >
//             <div className="w-8 h-[3px] rounded-b-full bg-yellow-400 z-40 shadow-[0_0_15px_#facc15]" />
//             <div 
//               className="w-full h-full"
//               style={{
//                 clipPath: 'polygon(35% 0%, 65% 0%, 95% 100%, 5% 100%)',
//                 background: darkMode 
//                   ? 'linear-gradient(to bottom, rgba(250, 204, 21, 0.45) 0%, rgba(250, 204, 21, 0.05) 70%, transparent 100%)'
//                   : 'linear-gradient(to bottom, rgba(250, 204, 21, 0.35) 0%, rgba(250, 204, 21, 0.05) 70%, transparent 100%)',
//               }}
//             />
//           </div>
//         </div>

//         {/* 🚀 NAV BAR CONTAINER */}
//         <nav className={`relative h-16 grid grid-cols-5 rounded-2xl shadow-2xl border-t transition-all duration-300 ${
//             darkMode ? "bg-[#1e2330] border-gray-700/50" : "bg-white border-gray-100"
//           }`}>

//           {navItems.map((item, index) => {
//             const Icon = item.icon;
//             const isActive = index === activeIndex;

//             if (item.isSpecial) {
//               return (
//                 <div key={item.id} className="relative flex flex-col items-center justify-center z-50">
//                   <button
//                     onClick={() => handleNavClick(item, index)}
//                     className="absolute -top-7 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all duration-300 group"
//                   >
//                     <Icon size={24} className="text-gray-900 transition-transform group-hover:rotate-12" />
//                   </button>
//                   <span className={`mt-8 text-[9px] font-bold uppercase ${isActive ? "text-yellow-400" : (darkMode ? "text-gray-400" : "text-gray-500")}`}>
//                     {item.label}
//                   </span>
//                 </div>
//               );
//             }

//             return (
//               <button
//                 key={item.id}
//                 onClick={() => handleNavClick(item, index)}
//                 className="relative z-20 flex flex-col items-center justify-center group outline-none"
//               >
//                 {/* 🔦 HOVER BEAM - Ye sirf hover par dikhega */}
//                 {!isActive && (
//                   <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center">
//                     <div className="w-6 h-[2px] bg-yellow-400/50 rounded-b-full" />
//                     <div 
//                       className="w-full h-full"
//                       style={{
//                         clipPath: 'polygon(35% 0%, 65% 0%, 95% 100%, 5% 100%)',
//                         background: 'linear-gradient(to bottom, rgba(250, 204, 21, 0.15) 0%, transparent 90%)',
//                       }}
//                     />
//                   </div>
//                 )}

//                 {/* ICON & LABEL */}
//                 <div className={`relative z-20 transition-all duration-300 flex flex-col items-center ${isActive ? "scale-110" : "group-hover:-translate-y-1"}`}>
//                   <div className="relative">
//                     <Icon 
//                       size={22} 
//                       className={`transition-all duration-500 ${
//                         isActive ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : (darkMode ? "text-gray-400" : "text-gray-500")
//                       }`} 
//                     />
//                     {item.showBadge && totalItems > 0 && (
//                       <span className={`absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 ${darkMode ? "border-[#1e2330]" : "border-white"}`}>
//                         {totalItems}
//                       </span>
//                     )}
//                   </div>
//                   <span className={`text-[9px] font-bold uppercase mt-1 tracking-tighter ${isActive ? "text-yellow-400" : (darkMode ? "text-gray-400" : "text-gray-500")}`}>
//                     {item.label}
//                   </span>
//                 </div>
//               </button>
//             );
//           })}
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default BottomNav;

"use client";

import React, { useState } from 'react';
import { Home, Laptop, Lamp, ShoppingCart, User, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from "../context/AppContext";

const BottomNav = () => {
  const { darkMode, showBottomNav, activeNavIndex, setActiveNavIndex } = useApp();
  const router = useRouter();
  const totalItems = 0; // In reality, get from cart count

  const navItems = [
    { label: "Home", icon: Home, id: "home", path: "/" },
    { label: "My Bookings", icon: Laptop, id: "history", path: "/booking-summary" },
    { label: "Hire", icon: Wrench, id: "hire", isSpecial: true, path: "/" },
    { label: "Rewards", icon: Lamp, id: "rewards" },
    { label: "Profile", icon: User, id: "profile" }
  ];

  return (
    <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-[60] transition-transform duration-[600ms] ease-[cubic-bezier(0.4, 0, 0.2, 1)] pointer-events-none ${showBottomNav ? 'translate-y-0' : 'translate-y-[120%]'}`}>
      <nav
        className={`relative flex justify-between items-center w-full h-[66px] transition-all duration-500 rounded-t-[2.5rem] shadow-[0_-15px_50px_rgba(0,0,0,0.15)] border-x-4 ${darkMode ? 'border-[#111827]' : 'border-white'} pointer-events-auto ${darkMode
          ? "bg-[#111827]/95 backdrop-blur-2xl border-t border-white/5"
          : "bg-white/95 backdrop-blur-2xl border-t border-gray-100"
          }`}
      >
        {navItems.map((item, idx) => {
          const Icon: any = item.icon;
          const isActive = activeNavIndex === idx;

          if (item.isSpecial) {
            return (
              <div key={item.id || idx} className="flex-1 flex justify-center items-center relative h-full">
                <div className="absolute top-[-30px] flex flex-col items-center group">
                  <button
                    onClick={() => {
                      setActiveNavIndex(idx);
                      if (item.path) router.push(item.path);
                    }}
                    className={`w-[62px] h-[62px] rounded-full flex items-center justify-center transition-all duration-500 bg-[#FFC42E] shadow-[0_0_30px_rgba(255,196,46,0.6),0_10px_20px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-90 border-4 border-white dark:border-[#111827]`}
                  >
                    <Icon className="text-gray-900" size={28} />
                  </button>
                  <div className="absolute inset-0 rounded-full bg-[#FFC42E]/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
            );
          }

          return (
            <div key={item.id || idx} className="flex-1 flex justify-center items-center h-full">
              <button
                onClick={() => {
                  setActiveNavIndex(idx);
                  if (item.path) router.push(item.path);
                }}
                className="group relative flex flex-col items-center justify-center gap-1 w-full h-full outline-none pt-2"
              >
                <div className={`relative transition-all duration-300 ${isActive
                  ? "text-[#FFC42E] -translate-y-0.5"
                  : darkMode ? "text-gray-500 group-hover:text-gray-300" : "text-gray-400 group-hover:text-gray-700"
                  }`}>
                  <Icon size={isActive ? 22 : 20} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
                </div>
                <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive
                  ? "text-[#FFC42E]"
                  : darkMode ? "text-gray-500" : "text-gray-400"
                  }`}>
                  {item.label}
                </span>
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;