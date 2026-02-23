
// 'use client';

// import React, { useState, useEffect, useRef } from 'react';

// const PRICE_PER_ITEM = 199;

// const SmartToolboxCart = () => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [position, setPosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
//   const [isPanelVisible, setIsPanelVisible] = useState(false);

//   // ✅ REAL STATE (no fake data)
//   const [itemsCount, setItemsCount] = useState(1);

//   const toolboxRef = useRef<HTMLDivElement | null>(null);
//   const panelRef = useRef<HTMLDivElement | null>(null);

//   const totalAmount = itemsCount * PRICE_PER_ITEM;

//   // initial position + drag
//   useEffect(() => {
//     if (toolboxRef.current && position.x === null) {
//       setPosition({
//         x: window.innerWidth - toolboxRef.current.offsetWidth - 20,
//         y: window.innerHeight * 0.45,
//       });
//     }

//     const move = (e: MouseEvent) => {
//       if (!isDragging || !toolboxRef.current) return;

//       const newX = e.clientX - toolboxRef.current.offsetWidth / 2;
//       const newY = e.clientY - toolboxRef.current.offsetHeight / 2;

//       setPosition({
//         x: Math.max(10, Math.min(window.innerWidth - toolboxRef.current.offsetWidth - 10, newX)),
//         y: Math.max(10, Math.min(window.innerHeight - toolboxRef.current.offsetHeight - 10, newY)),
//       });
//     };

//     const up = () => setIsDragging(false);

//     document.addEventListener('mousemove', move);
//     document.addEventListener('mouseup', up);

//     return () => {
//       document.removeEventListener('mousemove', move);
//       document.removeEventListener('mouseup', up);
//     };
//   }, [isDragging, position.x]);

//   const handleToolboxClick = () => {
//     if (!toolboxRef.current || !panelRef.current) return;

//     const rect = toolboxRef.current.getBoundingClientRect();
//     const vh = window.innerHeight;
//     const vw = window.innerWidth;

//     panelRef.current.style.left = 'auto';
//     panelRef.current.style.right = 'auto';
//     panelRef.current.style.top = 'auto';
//     panelRef.current.style.bottom = 'auto';
//     panelRef.current.style.transform = 'none';

//     if (rect.top < 120) {
//       panelRef.current.style.top = '100%';
//       panelRef.current.style.left = '50%';
//       panelRef.current.style.transform = 'translateX(-50%)';
//     } else if (vh - rect.bottom < 120) {
//       panelRef.current.style.bottom = '100%';
//       panelRef.current.style.left = '50%';
//       panelRef.current.style.transform = 'translateX(-50%)';
//     } else if (rect.left > vw / 2) {
//       panelRef.current.style.right = '100%';
//       panelRef.current.style.top = '50%';
//       panelRef.current.style.transform = 'translateY(-50%)';
//     } else {
//       panelRef.current.style.left = '100%';
//       panelRef.current.style.top = '50%';
//       panelRef.current.style.transform = 'translateY(-50%)';
//     }

//     setIsPanelVisible(!isPanelVisible);
//   };

//   return (
//     <div
//       ref={toolboxRef}
//       onMouseDown={(e) => {
//         e.stopPropagation();
//         setIsDragging(true);
//       }}
//       onClick={() => !isDragging && handleToolboxClick()}
//       className="fixed z-50 bg-gray-900 text-white rounded-full px-5 py-3 flex items-center gap-3 shadow-2xl cursor-grab"
//       style={{
//         left: position.x ?? 'auto',
//         top: position.y ?? 'auto',
//         right: position.x === null ? 20 : 'auto',
//       }}
//     >
//       🛒

//       {!isPanelVisible && (
//         <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm">
//           {itemsCount}
//         </div>
//       )}

//       <span className="text-sm">₹{totalAmount}</span>

//       {/* PANEL */}
//       <div
//         ref={panelRef}
//         className={`absolute bg-gray-900 rounded-2xl p-3 flex items-center gap-3 transition-all ${
//           isPanelVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         {/* circles */}
//         <div className="flex -space-x-3">
//           {Array.from({ length: itemsCount }).map((_, i) => (
//             <div
//               key={i}
//               className="w-8 h-8 rounded-full border-2 border-yellow-400 bg-gray-800"
//               style={{ opacity: 1 - i * 0.15 }}
//             />
//           ))}
//         </div>

//         <span className="text-sm">₹{totalAmount}</span>

//         <button className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold">
//           Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SmartToolboxCart;


// 'use client';

// import React, { useRef, useState, useEffect } from 'react';

// const PRICE = 199;
// const MIN_WIDTH = 90;      // ⬅️ thoda bada base
// const STEP_WIDTH = 20;     // ⬅️ smooth grow

// const SmartToolboxCart = () => {
//   const [count, setCount] = useState(0);
//   const [visible, setVisible] = useState(false);

//   const [redPos, setRedPos] = useState({ x: 16, y: 16 });
//   const [bandPos, setBandPos] = useState({ x: 90, y: 18 });

//   const dragging = useRef<'red' | 'band' | null>(null);

//   const total = count * PRICE;
//   const bandWidth = MIN_WIDTH + count * STEP_WIDTH;

//   /* ---------------- POINTER MOVE ---------------- */
//   useEffect(() => {
//     const move = (e: PointerEvent) => {
//       if (!dragging.current) return;

//       e.preventDefault();

//       if (dragging.current === 'red') {
//         setRedPos({
//           x: e.clientX - 32,
//           y: e.clientY - 22,
//         });
//       }

//       if (dragging.current === 'band') {
//         setBandPos({
//           x: e.clientX - bandWidth / 2,
//           y: e.clientY - 22,
//         });
//       }
//     };

//     const stop = () => {
//       dragging.current = null;
//     };

//     window.addEventListener('pointermove', move);
//     window.addEventListener('pointerup', stop);

//     return () => {
//       window.removeEventListener('pointermove', move);
//       window.removeEventListener('pointerup', stop);
//     };
//   }, [bandWidth]);

//   /* ---------------- ADD / REMOVE ---------------- */
//   const addItem = () => {
//     setVisible(true);
//     setCount(c => c + 1);

//     setBandPos({
//       x: redPos.x - bandWidth - 12,
//       y: redPos.y,
//     });
//   };

//   const removeItem = () => {
//     setCount(c => {
//       const next = Math.max(0, c - 1);
//       if (next === 0) setVisible(false);
//       return next;
//     });
//   };

//   return (
//     <>
//       {/* 🔴 RED DRAGGABLE BUTTON */}
//       <button
//         onPointerDown={(e) => {
//           e.preventDefault();
//           dragging.current = 'red';
//         }}
//         onClick={addItem}
//         className="fixed z-50 bg-black text-white px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-1.5 touch-none"
//         style={{
//           left: redPos.x,
//           top: redPos.y,
//         }}
//       >
//         🧰 <span className="text-sm font-bold">₹{PRICE}</span>
//       </button>

//       {/* 🔵 FLOATING BAND */}
//       {visible && (
//         <div
//           onPointerDown={(e) => {
//             e.preventDefault();
//             dragging.current = 'band';
//           }}
//           className="fixed z-40 bg-[#0B1220] text-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 touch-none"
//           style={{
//             left: bandPos.x,
//             top: bandPos.y,
//             width: bandWidth,
//             transition: 'width 0.25s ease',
//           }}
//         >
//           {/* icon */}
//           <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[11px]">
//             🛒
//           </div>

//           {/* circles */}
//           <div className="flex overflow-hidden">
//             {Array.from({ length: count }).map((_, i) => (
//               <div
//                 key={i}
//                 className="w-4 h-4 rounded-full border-2 border-yellow-400 bg-gray-800 -ml-1"
//               />
//             ))}
//           </div>

//           <span className="text-xs ml-1 whitespace-nowrap">
//             ₹{total}
//           </span>

//           <button
//             onClick={removeItem}
//             className="text-xs bg-gray-700 px-1.5 rounded"
//           >
//             −
//           </button>

//           <button className="bg-yellow-400 text-black px-3 py-[3px] rounded-full text-xs font-bold">
//             Checkout
//           </button>
//         </div>
//       )}
//     </>
//   );
// };

// export default SmartToolboxCart;


// 'use client';

// import React, { useRef, useState, useEffect } from 'react';

// const PRICE = 199;

// // 🔥 Bigger & premium sizing
// const MIN_WIDTH = 130;
// const STEP_WIDTH = 26;

// const SmartToolboxCart = () => {
//   const [count, setCount] = useState(0);
//   const [visible, setVisible] = useState(false);

//   const [redPos, setRedPos] = useState({ x: 16, y: 16 });
//   const [bandPos, setBandPos] = useState({ x: 120, y: 20 });

//   const dragging = useRef<'red' | 'band' | null>(null);

//   const total = count * PRICE;
//  const visibleCircles = Math.min(count, 5);
// const bandWidth = MIN_WIDTH + visibleCircles * STEP_WIDTH;

//   /* ---------------- POINTER MOVE ---------------- */
//   useEffect(() => {
//     const move = (e: PointerEvent) => {
//       if (!dragging.current) return;

//       e.preventDefault();

//       if (dragging.current === 'red') {
//         setRedPos({
//           x: e.clientX - 36,
//           y: e.clientY - 26,
//         });
//       }

//       if (dragging.current === 'band') {
//         setBandPos({
//           x: e.clientX - bandWidth / 2,
//           y: e.clientY - 26,
//         });
//       }
//     };

//     const stop = () => (dragging.current = null);

//     window.addEventListener('pointermove', move);
//     window.addEventListener('pointerup', stop);

//     return () => {
//       window.removeEventListener('pointermove', move);
//       window.removeEventListener('pointerup', stop);
//     };
//   }, [bandWidth]);

//   /* ---------------- ADD / REMOVE ---------------- */
//   const addItem = () => {
//     setVisible(true);
//     setCount(c => c + 1);

//     setBandPos({
//       x: redPos.x - bandWidth - 14,
//       y: redPos.y,
//     });
//   };

//   const removeItem = () => {
//     setCount(c => {
//       const next = Math.max(0, c - 1);
//       if (next === 0) setVisible(false);
//       return next;
//     });
//   };

//   return (
//     <>
//       {/* 🔴 RED DRAGGABLE BUTTON */}
//       <button
//         onPointerDown={(e) => {
//           e.preventDefault();
//           dragging.current = 'red';
//         }}
//         onClick={addItem}
//         className="fixed z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 touch-none"
//         style={{ left: redPos.x, top: redPos.y }}
//       >
//         🧰 <span className="text-sm font-bold">₹{PRICE}</span>
//       </button>

//       {/* 🔵 PREMIUM FLOATING BAND */}
//       {visible && (
//         <div
//           onPointerDown={(e) => {
//             e.preventDefault();
//             dragging.current = 'band';
//           }}
//           className="fixed z-40 bg-[#0B1220] text-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2 touch-none"
//           style={{
//             left: bandPos.x,
//             top: bandPos.y,
//             width: bandWidth,
//             transition: 'width 0.3s ease',
//           }}
//         >
//           {/* icon */}
//           <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-sm">
//             🛒
//           </div>

//           {/* circles */}
//         <div className="flex items-center">

//            {Array.from({ length: Math.min(count, 5) }).map((_, i) => (

//               <div
//                 key={i}
//                className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-gray-700 ml-1"

//               />
//             ))}
//           </div>

//           <span className="text-sm ml-2 whitespace-nowrap font-medium">
//             ₹{total}
//           </span>

//           <button
//             onClick={removeItem}
//             className="text-sm bg-gray-700 px-2 rounded-md"
//           >
//             −
//           </button>

//           <button className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-sm font-bold">
//             Checkout
//           </button>
//         </div>
//       )}
//     </>
//   );
// };

// export default SmartToolboxCart;



'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const MIN_WIDTH = 130;
const STEP_WIDTH = 26;

type CartItem = {
  id: number;
  price: number;
  image?: string | null;
};

type Props = {
  items: CartItem[];
  onRemove?: () => void;
};

const SmartToolboxCart = ({ items, onRemove }: Props) => {
  const count = items.length;
  const visible = count > 0;
  const router = useRouter();
  const total = items.reduce((sum, i) => sum + i.price, 0);

  const visibleItems = items.slice(0, 5);
  const bandWidth = MIN_WIDTH + visibleItems.length * STEP_WIDTH;

  const [redPos, setRedPos] = useState({ x: 16, y: 16 });
  const [bandPos, setBandPos] = useState({ x: 120, y: 20 });

  const dragging = useRef<'red' | 'band' | null>(null);

  /* drag logic same */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;

      if (dragging.current === 'red') {
        setRedPos({ x: e.clientX - 36, y: e.clientY - 26 });
      }

      if (dragging.current === 'band') {
        setBandPos({ x: e.clientX - bandWidth / 2, y: e.clientY - 26 });
      }
    };

    const stop = () => (dragging.current = null);

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [bandWidth]);

  return (
    <>
      {/* 🔴 Drag Button (NO ADD LOGIC HERE) */}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = 'red';
        }}
        className="fixed z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 touch-none"
        style={{ left: redPos.x, top: redPos.y }}
      >
        🧰 <span className="text-sm font-bold">{count}</span>
      </button>

      {/* 🔵 Floating Cart */}
      {visible && (
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = 'band';
          }}
          className="fixed z-40 bg-[#0B1220] text-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2 touch-none"
          style={{ left: bandPos.x, top: bandPos.y, width: bandWidth }}
        >
          {/* cart icon */}
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            🛒
          </div>

          {/* circles with IMAGE */}
          <div className="flex items-center">
            {visibleItems.map((item, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-yellow-400 overflow-hidden ml-1 bg-gray-700"
              >
                {item.image && (
                  <img
                    src={item.image}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}

            {count > 5 && (
              <span className="text-xs text-yellow-400 ml-1">
                +{count - 5}
              </span>
            )}
          </div>

          <span className="text-sm ml-2 font-medium">₹{total}</span>

          <button
            onClick={onRemove}
            className="text-sm bg-gray-700 px-2 rounded-md"
          >
            −
          </button>

          <button onClick={() => router.push('/booking-summary')} className="bg-yellow-400 text-black px-4 py-1.5 rounded-xl text-sm font-bold active:scale-95 transition-all">
            Checkout
          </button>
        </div>
      )}
    </>
  );
};

export default SmartToolboxCart;







