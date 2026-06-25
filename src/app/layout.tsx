import type { Metadata } from 'next';
import { SidebarProvider } from '../SidebarContext';
import { ThemeProvider } from '../ThemeContext';
import '../index.css';

export const metadata: Metadata = {
  title: 'Ravell Tech',
  description: 'My IT Blog',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-500/30">
        <ThemeProvider>
          <SidebarProvider>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
