/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFC42E", // Bright yellow
        "background-light": "#F3F4F8", // Soft light gray
        "background-dark": "#050B14", // Deepest blue/black
        "card-dark": "#121826", // Slightly lighter dark for cards
        "card-light": "#FFFFFF",
        "text-subtle-light": "#6B7280",
        "text-subtle-dark": "#9CA3AF",
        "nav-dark": "#1F2937",
        "nav-light": "#FFFFFF",

        // Keeping previous colors for backward compatibility if needed, but primary overrides
        'yellow-primary': '#FFC42E',
        'yellow-dark': '#EAB308',
        'gray-bg': '#F9FAFB',
        'gray-card': '#F3F4F6',
        'text-dark': '#111827',
        'text-gray': '#6B7280',
        'text-light': '#9CA3AF',
        'white': '#FFFFFF',
        'black': '#000000',
        'blue-icon': '#2563EB',
        'dark-card': '#1F2937',
        'success-green': '#16A34A',
        'error-red': '#DC2626',
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'nav': '0 -4px 20px -5px rgba(0, 0, 0, 0.1)',
        '3d-light': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        '3d-btn': '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
        'inner-light': 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff',
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}