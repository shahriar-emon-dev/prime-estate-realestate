'use client';

import { useEffect, useState, ReactNode } from 'react';
import Navbar from './Navbar';
import { supabase } from '@/lib/supabaseClient';

export interface InitialSession {
  user: {
    id: string;
    email: string;
  } | null;
  role: 'admin' | 'seller' | 'agent' | 'user' | null;
  isAuthenticated: boolean;
}

interface NavbarWrapperProps {
  initialSession: InitialSession;
}

/**
 * Navbar Wrapper Component
 * 
 * This component:
 * 1. Receives server-side session data to prevent hydration mismatch
 * 2. Manages client-side auth state changes
 * 3. Passes data to the actual Navbar component
 */
export function NavbarWrapper({ initialSession }: NavbarWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<InitialSession>(initialSession);

  // Only mount after hydration to prevent mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isClient) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        if (authSession?.user) {
          // Fetch updated role from database
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('user_id', authSession.user.id)
              .single();

            setSession({
              user: {
                id: authSession.user.id,
                email: authSession.user.email || '',
              },
              role: userData?.role || 'user',
              isAuthenticated: true,
            });
          } catch (error) {
            setSession({
              user: null,
              role: null,
              isAuthenticated: false,
            });
          }
        } else {
          setSession({
            user: null,
            role: null,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [isClient]);

  // Don't render until client-side (prevents hydration mismatch)
  if (!isClient) {
    return <Navbar userSession={initialSession} />;
  }

  return <Navbar userSession={session} />;
}
