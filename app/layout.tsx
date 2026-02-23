import type { Metadata } from 'next';
import './globals.css';
import { inter, poppins } from './lib/fonts';
import { CartProvider } from './context/CartContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider as AppToastProvider } from './components/ToastProvider';
import { OptimizeFontLoading, FontFallbackOptimizer } from './components/FontOptimization';
import FloatingCart from './components/FloatingCart';
import GlobalAuthPopup from './components/GlobalAuthPopup';
import DesktopBlocker from './components/DesktopBlocker';
import NotificationWrapper from './components/NotificationWrapper';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import LiveLocationSync from './components/LiveLocationSync';
import SessionHandler from './components/SessionHandler';

export const metadata: Metadata = {
  title: 'Bijli Wala Aya - Instant Home Services',
  description: 'Instant home services at your doorstep. Professional technicians, verified services.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Bijli Wala Aya',
    description: 'Instant home services',
    url: 'https://bijliwalaaya.com',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BijliWalaAya" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className={`${inter.className} antialiased bg-slate-100 dark:bg-[#0b0f1a] transition-colors duration-300`}
        style={{
          fontFeatureSettings: '"kern" 1, "liga" 1',
          textRendering: 'optimizeLegibility',
        } as React.CSSProperties}
      >
        <OptimizeFontLoading />
        <FontFallbackOptimizer />

        {/* Mobile Viewport Wrapper */}
        <div className="flex justify-center items-start min-h-screen bg-slate-200 dark:bg-[#060912]">
          <main className="w-full max-w-[500px] min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,0.2)] bg-white dark:bg-[#0f172a] overflow-x-hidden transition-all duration-300">
            <CartProvider>
              <AppProvider>
                <DesktopBlocker>
                  <AppToastProvider>
                    {children}
                  </AppToastProvider>
                  <FloatingCart />
                  <GlobalAuthPopup darkMode={true} />
                  <NotificationWrapper />
                  <IOSInstallPrompt />
                  <LiveLocationSync />
                  <SessionHandler />
                </DesktopBlocker>
              </AppProvider>
            </CartProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
