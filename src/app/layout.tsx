import type { Metadata } from 'next';
import { SidebarProvider } from '../SidebarContext';
import { ThemeProvider } from '../ThemeContext';
import { GlobalProvider } from '../context/GlobalContext';
import LayoutClient from './LayoutClient';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';
import '../index.css';

export const metadata: Metadata = {
  title: 'Ravell Tech',
  description: 'Your Hub for Networking & Security Insights',
  manifest: '/manifest.json',
};

// Providers live at the root so static pages, client widgets, and legacy shared
// components use the same theme, sidebar, and global navigation data.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <SidebarProvider>
            <GlobalProvider>
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
