import './globals.css';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import { getUserSession } from '@/lib/auth-actions';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata = {
  title: 'PrimeEstate - Find Your Dream Property in Bangladesh',
  description: 'Discover the perfect property across major cities in Bangladesh. Browse through thousands of listings and find your ideal home.',
  keywords: 'real estate, property, Bangladesh, Dhaka, apartments, villas, buy property, rent property',
  icons: {
    icon: '/prime_estate.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get user session server-side to pass to navbar
  // This prevents hydration mismatch and role detection race conditions
  const userSession = await getUserSession();

  return (
    <html lang="en" className={inter.className}>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <LayoutWrapper userSession={userSession}>{children}</LayoutWrapper>
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
