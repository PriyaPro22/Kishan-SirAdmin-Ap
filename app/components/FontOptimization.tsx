'use client';

import { useEffect } from 'react';

/**
 * Font Loading Optimization Component
 * Prevents FOUT (Flash of Unstyled Text) and FLS (Font Layout Shift)
 */
export function OptimizeFontLoading() {
  useEffect(() => {
    // Detect when fonts are loaded and ready
    if ('fonts' in document) {
      (document.fonts as any).ready.then(() => {
        // Remove font-loading class when fonts are ready
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('fonts-loaded');
      });
    }

    // Fallback for older browsers
    const timer = setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <style jsx>{`
      /* Critical font sizes to prevent layout shift */
      :root {
        --heading-size-h1: 2.25rem;
        --heading-size-h2: 1.875rem;
        --heading-size-h3: 1.5rem;
        --body-size: 1rem;
        --small-size: 0.875rem;
      }

      /* Ensure consistent sizing during font load */
      html.font-loading h1 {
        font-size: var(--heading-size-h1);
        line-height: 1.2;
        min-height: 2.7rem;
      }

      html.font-loading h2 {
        font-size: var(--heading-size-h2);
        line-height: 1.3;
        min-height: 2.44rem;
      }

      html.font-loading h3 {
        font-size: var(--heading-size-h3);
        line-height: 1.4;
        min-height: 2.1rem;
      }

      html.font-loading p,
      html.font-loading body {
        font-size: var(--body-size);
        line-height: 1.5;
      }

      html.font-loading small {
        font-size: var(--small-size);
        line-height: 1.5;
      }

      /* Smooth transition when fonts load */
      html.fonts-loaded * {
        transition: font-family 0.3s ease-out;
      }

      /* Prevent layout shift on buttons and inputs */
      html.font-loading button,
      html.font-loading input,
      html.font-loading textarea,
      html.font-loading select {
        font-size: inherit;
        line-height: 1.5;
      }
    `}</style>
  );
}

/**
 * Font Fallback Optimization
 * Ensures better fallback fonts during loading
 */
export function FontFallbackOptimizer() {
  return (
    <style jsx>{`
      /* Better fallback metrics matching */
      @font-face {
        font-family: 'Inter Fallback';
        src: local('Arial');
        font-weight: 100 900;
        font-display: fallback;
        size-adjust: 97%;
        ascent-override: 90%;
        descent-override: 22%;
        line-gap-override: 0%;
      }

      @font-face {
        font-family: 'Poppins Fallback';
        src: local('Trebuchet MS');
        font-weight: 100 900;
        font-display: fallback;
        size-adjust: 98%;
        ascent-override: 89%;
        descent-override: 23%;
        line-gap-override: 0%;
      }

      /* Use fallback fonts initially */
      html.font-loading {
        font-family: 'Inter Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      html.font-loading h1,
      html.font-loading h2,
      html.font-loading h3,
      html.font-loading h4,
      html.font-loading h5,
      html.font-loading h6 {
        font-family: 'Poppins Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      /* Transition to actual fonts */
      html.fonts-loaded {
        font-family: var(--font-sans);
      }

      html.fonts-loaded h1,
      html.fonts-loaded h2,
      html.fonts-loaded h3,
      html.fonts-loaded h4,
      html.fonts-loaded h5,
      html.fonts-loaded h6 {
        font-family: var(--font-display);
      }
    `}</style>
  );
}
