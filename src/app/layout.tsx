import type { Metadata } from 'next';
import { SidebarProvider } from '../SidebarContext';
import { ThemeProvider } from '../ThemeContext';
import { GlobalProvider } from '../context/GlobalContext';
import LayoutClient from './LayoutClient';
import '../index.css';

export const metadata: Metadata = {
  title: 'Ravell Tech',
  description: 'Your Hub for Networking & Security Insights',
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
