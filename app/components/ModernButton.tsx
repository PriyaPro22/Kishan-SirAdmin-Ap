'use client';
import { motion } from 'framer-motion';
import { buttonClickAnimation } from '@/app/lib/animations';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface ModernButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white shadow-md',
  outline: 'border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-transparent',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-lg',
};

export function ModernButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className,
}: ModernButtonProps) {
  return (
    <motion.button
      className={clsx(
        'font-semibold transition-all duration-200 flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...buttonClickAnimation}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { y: -2 } : {}}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : icon ? (
        <>
          {icon}
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

/**
 * FAQ Button - Quick action button with ripple effect
 */
export function QuickActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="text-3xl"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">{label}</span>
    </motion.button>
  );
}

/**
 * Icon Button with ripple effect
 */
export function IconButton({
  icon: Icon,
  onClick,
  className,
}: {
  icon: any;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      className={clsx(
        'p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <Icon size={24} />
    </motion.button>
  );
}
