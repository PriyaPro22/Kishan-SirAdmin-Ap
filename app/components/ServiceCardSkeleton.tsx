"use client";

import React from 'react';
import { Skeleton } from './Skeleton';

interface ServiceCardSkeletonProps {
    darkMode?: boolean;
}

export const ServiceCardSkeleton: React.FC<ServiceCardSkeletonProps> = ({ darkMode = false }) => {
    return (
        <div className={`relative rounded-[2rem] p-3 min-[375px]:p-4 mb-6 ${darkMode ? 'bg-[#111623] border border-white/5' : 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            }`}>
            <div className="flex flex-col">
                <div className="flex gap-4 min-[375px]:gap-5">
                    {/* LEFT: Image Container Placeholder */}
                    <div className="w-[115px] min-[375px]:w-[135px] shrink-0">
                        <Skeleton
                            variant="rectangular"
                            className="w-full aspect-square rounded-2xl"
                            borderRadius="1rem"
                        />
                        <div className="mt-2.5 flex justify-center">
                            <Skeleton variant="text" width="60%" height={14} />
                        </div>
                    </div>

                    {/* RIGHT: Details Placeholder */}
                    <div className="flex-1 flex flex-col min-w-0 py-0.5">
                        <Skeleton variant="text" width="90%" height={24} className="mb-3" />

                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                                <Skeleton variant="rectangular" width={40} height={20} borderRadius="6px" />
                                <Skeleton variant="text" width={60} height={14} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Skeleton variant="rectangular" width="100%" height={36} borderRadius="1rem" />
                                <Skeleton variant="rectangular" width="100%" height={36} borderRadius="1rem" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM: Price area Placeholder */}
                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.03] flex items-end justify-between">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton variant="text" width={40} height={16} />
                        <Skeleton variant="text" width={80} height={28} />
                        <Skeleton variant="rectangular" width={100} height={20} borderRadius="8px" />
                    </div>

                    <Skeleton variant="rectangular" width={80} height={40} borderRadius="12px" />
                </div>
            </div>
        </div>
    );
};

export const ServiceGridSkeleton: React.FC<{ count?: number, darkMode?: boolean }> = ({ count = 3, darkMode = false }) => {
    return (
        <div className="w-full px-4">
            {/* Title Placeholder */}
            <div className="flex items-center gap-3 mb-6 mt-4">
                <Skeleton variant="rectangular" width={6} height={28} borderRadius="9999px" />
                <Skeleton variant="text" width={200} height={32} />
            </div>

            <div className="space-y-6">
                {Array.from({ length: count }).map((_, i) => (
                    <ServiceCardSkeleton key={i} darkMode={darkMode} />
                ))}
            </div>
        </div>
    );
};
