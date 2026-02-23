// import { Home, Monitor, Smartphone, Grid } from 'lucide-react';

// export default function DepartmentSection() {
//   const departments = [
//     {
//       name: 'All',
//       icon: <Grid size={22} className="text-white" />,
//       bgColor: 'bg-primary-text',
//     },
//     {
//       name: 'Home\nAppliances',
//       icon: <Home size={22} className="text-primary-text" />,
//       bgColor: 'bg-pink-100',
//     },
//     {
//       name: 'Computer',
//       icon: <Monitor size={22} className="text-primary-text" />,
//       bgColor: 'bg-orange-100',
//     },
//     {
//       name: 'Mobile',
//       icon: <Smartphone size={22} className="text-primary-text" />,
//       bgColor: 'bg-green-100',
//     },
//   ];

//   return (
//     <section className="px-4 mb-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <h2 className="text-lg font-bold text-primary-text">Department</h2>
//         <button className="text-sm font-medium text-primary-yellow hover:text-primary-yellow-dark transition-colors">
//           See all
//         </button>
//       </div>

//       {/* Icons Grid */}
//       <div className="grid grid-cols-4 gap-4">
//         {departments.map((dept, index) => (
//           <button
//             key={index}
//             className="flex flex-col items-center active:scale-[0.95] transition-transform"
//           >
//             <div className={`w-16 h-16 ${dept.bgColor} rounded-full flex items-center justify-center mb-2 shadow-soft`}>
//               {dept.icon}
//             </div>
//             <span className="text-xs font-medium text-primary-text text-center whitespace-pre-line leading-tight">
//               {dept.name}
//             </span>
//           </button>
//         ))}
//       </div>
//     </section>
//   );
// }

// "use client";

// import React, { useState } from "react";
// import { Home, Monitor, Smartphone, Grid } from "lucide-react";

// type Department = {
//   name: string;
//   icon: React.ElementType;
// };

// const departments: Department[] = [
//   { name: "All", icon: Grid },
//   { name: "Home\nAppliances", icon: Home },
//   { name: "Computer", icon: Monitor },
//   { name: "Mobile", icon: Smartphone },
// ];

// export default function DepartmentSection() {
//   const [activeDept, setActiveDept] = useState(0);

//   return (
//     <section
//       className="
//         mx-4 mb-6 px-4 py-4
//         bg-gray-800 rounded-xl
//         overflow-visible
//       "
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <h2 className="text-lg font-bold text-white">Department</h2>
//         <button className="text-sm font-medium text-yellow-400">
//           See all
//         </button>
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-4 gap-4 overflow-visible">
//         {departments.map((dept, index) => {
//           const Icon = dept.icon;
//           const isActive = activeDept === index;

//           return (
//             <button
//               key={dept.name}
//               onClick={() => setActiveDept(index)}
//               className="flex flex-col items-center outline-none"
//             >
//               {/* ICON HOLDER */}
//               <div
//                 className={`
//                   relative w-16 h-16 rounded-full
//                   flex items-center justify-center
//                   overflow-visible
//                   transition-all duration-300
//                   ${
//                     isActive
//                       ? "bg-zinc-900 ring-1 ring-yellow-400/40"
//                       : "bg-zinc-700"
//                   }
//                 `}
//               >
//                 {/* 💡 LAMP HEAD */}
//                 {isActive && (
//                   <div
//                     className="
//                       absolute -top-3 left-1/2 -translate-x-1/2
//                       w-7 h-2.5 rounded-b-full
//                       bg-yellow-400
//                       z-50
//                       shadow-[0_0_22px_8px_rgba(250,204,21,0.95)]
//                     "
//                   />
//                 )}

//                 {/* 🔦 LIGHT CONE */}
//                 {isActive && (
//                   <div
//                     className="
//                       absolute inset-0 z-10 pointer-events-none
//                     "
//                     style={{
//                       clipPath:
//                         "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
//                       background:
//                         "linear-gradient(to bottom, rgba(250,204,21,0.35), rgba(250,204,21,0.08), transparent)",
//                     }}
//                   />
//                 )}

//                 {/* ICON */}
//                 <div
//                   className={`
//                     relative z-40 transition-all
//                     ${
//                       isActive
//                         ? "text-yellow-400 scale-110 drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]"
//                         : "text-gray-300"
//                     }
//                   `}
//                 >
//                   <Icon size={22} />
//                 </div>
//               </div>

//               {/* LABEL */}
//               <span
//                 className={`
//                   mt-1 text-[10px] font-bold text-center whitespace-pre-line
//                   ${
//                     isActive
//                       ? "text-yellow-400"
//                       : "text-gray-400"
//                   }
//                 `}
//               >
//                 {dept.name}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

"use client";

import React, { useState } from "react";
import { Home, Monitor, Smartphone, Grid } from "lucide-react";

export default function DepartmentSection({
  onChange,
  onOpen,
}: {
  onChange: (dept: string) => void;
  onOpen: () => void;
}) {
  const [activeDept, setActiveDept] = useState(0);

  const departments = [
    { label: "All", value: "all", icon: Grid, image: null },
    { label: "Home\nAppliances", value: "Home Appliances", icon: Home, image: "/home-appliances.png" },
    { label: "Computer", value: "Computer", icon: Monitor, image: "/computer.png" },
    { label: "Mobile", value: "Mobile", icon: Smartphone, image: "/mobile.png" },
  ];

  return (
    <section className="mx-4 mb-6 px-4 py-4 bg-gray-800 rounded-xl overflow-visible">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white">Department</h2>

        <button
          onClick={() => {
            setActiveDept(0);
            onChange("all");
            onOpen();
          }}
          className="text-sm font-medium text-yellow-400"
        >
          See all
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {departments.map((dept, index) => {
          const Icon = dept.icon;
          const isActive = activeDept === index;

          return (
            <button
              key={dept.value}
              onClick={() => {
                setActiveDept(index);
                onChange(dept.value);
                onOpen(); // 🔥 YAHI MISSING THA
              }}
              className="flex flex-col items-center"
            >
              <div
                className={`relative w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 rounded-full flex items-center justify-center overflow-hidden
                ${isActive ? "bg-zinc-900 ring-1 ring-yellow-400/40" : "bg-zinc-700"}`}
              >
                {isActive && (
                  <div className="absolute -top-2.5 min-[375px]:-top-3 left-1/2 -translate-x-1/2 w-6 min-[375px]:w-7 h-2 min-[375px]:h-2.5 rounded-b-full bg-yellow-400 shadow-[0_0_22px_8px_rgba(250,204,21,0.95)]" />
                )}

                {dept.image ? (
                  <img
                    src={dept.image}
                    alt={dept.label}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Icon
                    size={22}
                    className={isActive ? "text-yellow-400" : "text-gray-300"}
                  />
                )}
              </div>

              <span
                className={`mt-1 text-[9px] min-[375px]:text-[10px] font-bold text-center whitespace-pre-line leading-tight break-words hyphens-auto ${isActive ? "text-yellow-400" : "text-gray-400"
                  }`}
              >
                {dept.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}


