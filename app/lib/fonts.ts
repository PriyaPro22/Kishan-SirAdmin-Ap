// Font configuration with optimal loading strategy
import { Inter, Poppins, Playfair_Display } from 'next/font/google';

// Primary font - Inter (fast, optimized for small screens)
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap', // Show fallback immediately, swap when ready
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Heading font - Poppins (modern, professional)
export const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Optional: Display/Serif font for special elements
export const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
  fallback: ['serif'],
});

export default inter;
