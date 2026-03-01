/**
 * Server action for fetching user session with role
 * 
 * This is used to get the authenticated user and their role on the server-side
 * Prevents client-side role detection race conditions
 */

'use server';

import { createRouteSupabaseClient } from '@/lib/routeAuth';
import { getUserRoleById } from '@/lib/supabaseServer';

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  role: 'admin' | 'seller' | 'agent' | 'user' | null;
  isAuthenticated: boolean;
}

export async function getUserSession(): Promise<UserSession> {
  const supabase = await createRouteSupabaseClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        role: null,
        isAuthenticated: false,
      };
    }

    // Fetch role from database (source of truth)
    const role = await getUserRoleById(user.id, supabase);

    return {
      user: {
        id: user.id,
        email: user.email || '',
      },
      role,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Failed to get user session:', error);
    return {
      user: null,
      role: null,
      isAuthenticated: false,
    };
  }
}
