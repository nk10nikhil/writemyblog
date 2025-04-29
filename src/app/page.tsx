import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthSessionProvider from '@/components/auth/AuthSessionProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ModernBlog - Share Your Stories',
  description: 'A modern blogging platform for writers and readers',
};

import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <AuthSessionProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}