'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavbarWrapper, type InitialSession } from './NavbarWrapper';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
  userSession: InitialSession;
}

export default function LayoutWrapper({ children, userSession }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering consistent content on server
  if (!mounted) {
    return <>{children}</>;
  }

  if (isAdminRoute) {
    // Admin routes: no header, no footer, no padding
    return <>{children}</>;
  }

  // Public routes: with header and footer
  return (
    <>
      <NavbarWrapper initialSession={userSession} />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
