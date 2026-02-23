'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Wraps page content with a smooth fade+slide animation.
 * Use this at the top level of each page for app-like transitions.
 */
export default function PageTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Stagger children animation - each child fades in sequentially
 * Use for lists, cards, sections that should appear one by one
 */
export function StaggerContainer({ children, className = '', staggerDelay = 0.08 }: {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Individual stagger item - use inside StaggerContainer
 */
export function StaggerItem({ children, className = '' }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Skeleton loader with shimmer animation
 */
export function SkeletonLoader({ className = '', rounded = 'rounded-xl' }: {
    className?: string;
    rounded?: string;
}) {
    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${rounded} ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
        </div>
    );
}
