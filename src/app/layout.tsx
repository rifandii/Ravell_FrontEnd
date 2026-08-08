import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { SidebarProvider } from '../SidebarContext';
import { ThemeProvider } from '../ThemeContext';
import { GlobalProvider } from '../context/GlobalContext';
import AnalyticsPageView from '../components/AnalyticsPageView';
import LayoutClient from './LayoutClient';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ravell.tech'),
  title: 'Ravell Tech',
  description: 'Your Hub for Networking & Security Insights',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-ravell.svg',
    shortcut: '/logo-ravell.svg',
    apple: '/logo-ravell.svg',
  },
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Providers live at the root so static pages, client widgets, and legacy shared
// components use the same theme, sidebar, and global navigation data.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the stored or system theme before React hydrates so dark-mode
            visitors never see a light-theme flash on first paint. The ThemeProvider
            resolves the same value after mount and keeps it in sync. */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {GA_MEASUREMENT_ID ? (
          <>
            <script
              id="ga4-init"
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('js', new Date());
window.gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, { send_page_view: false });
`,
              }}
            />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
              strategy="afterInteractive"
            />
          </>
        ) : null}
        <ThemeProvider>
          <SidebarProvider>
            <GlobalProvider>
              {GA_MEASUREMENT_ID ? (
                <Suspense fallback={null}>
                  <AnalyticsPageView measurementId={GA_MEASUREMENT_ID} />
                </Suspense>
              ) : null}
              <ServiceWorkerRegistration />
              <LayoutClient>
                {children}
              </LayoutClient>
            </GlobalProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
