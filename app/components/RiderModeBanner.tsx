"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RiderModeBanner() {
  const router = useRouter();

  const handleClick = () => {
    console.log("Rider Mode Activated");
  };

  return (
    <div className="w-full mb-8 pt-2">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="relative w-full h-4 overflow-hidden cursor-pointer group"
      >
        {/* 🛣️ ULTRA-THIN ROAD LINE */}
        <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-800/20 flex items-center justify-center px-4">
          {/* THE LINE */}
          <div className="absolute inset-x-0 h-[2px] bg-gray-300 dark:bg-gray-700 top-1/2 -translate-y-1/2" />

          {/* ROAD DASHES */}
          <div
            className="absolute inset-x-0 h-[2px] top-1/2 -translate-y-1/2 opacity-60 z-10"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, #fbbf24, #fbbf24 10px, transparent 10px, transparent 20px)",
              backgroundSize: "40px 100%",
            }}
          />

          {/* CENTERED LABEL */}
          <div className="relative z-20 bg-white dark:bg-gray-900 px-3 flex items-center gap-2">
            <span className="text-[9px] font-black italic text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase">
              Rider Mode
            </span>
            <span className="text-[7px] font-bold text-yellow-500/80 uppercase tracking-widest">
              Soon
            </span>
          </div>
        </div>

        {/* SUBTLE GLOW */}
        <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </div>
  );
}

