"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  darkMode?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = 'rectangular',
  width,
  height,
  borderRadius,
  darkMode = false,
}) => {
  const baseStyles: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: borderRadius || (variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '0px'),
  };

  return (
    <div
      className={`skeleton-base ${className}`}
      style={baseStyles}
    >
      <style jsx>{`
        .skeleton-base {
          position: relative;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.05);
          display: inline-block;
        }

        :global(.dark) .skeleton-base {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .skeleton-base::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: skeleton-shimmer 1.5s infinite;
          transform: translateX(-100%);
        }

        :global(.dark) .skeleton-base::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
        }

        @keyframes skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
