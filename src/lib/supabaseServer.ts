// src/lib/supabaseServer.ts
// Server-side Supabase client with service role key for admin operations

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables');
}

// This client bypasses RLS - use only on server for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type AppRole = 'admin' | 'seller' | 'agent' | 'user';

/**
 * Create a user record in public.users table with their role
 * This should be called after successful Supabase auth signup
 * Note: full_name is stored in Supabase user metadata, not in this table
 */
export async function createUserRecord(
  userId: string,
  role: AppRole,
  fullName?: string // Kept for logging/debugging, not inserted into DB
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: userId,
        role: role,
        // Note: full_name is not in the users table schema
        // It's stored in Supabase user_metadata instead
      });

    if (error) {
      // If duplicate key, user already exists - not an error
      if (error.code === '23505') {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to create user record' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientLike = { from: (...args: any[]) => any };

export async function getUserRoleById(
  userId: string,
  client?: SupabaseClientLike
): Promise<AppRole> {
  const db = client ?? supabaseAdmin;
  try {
    const { data, error } = await db
      .from('users')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data?.role) {
      return 'user';
    }

    return data.role as AppRole;
  } catch {
    return 'user';
  }
}

export async function ensureUserRecord(
  userId: string,
  desiredRole: AppRole = 'user',
  client?: SupabaseClientLike
): Promise<{ success: boolean; role: AppRole; error?: string }> {
  // Safe roles: only 'user', 'seller', 'agent' can be assigned during signup
  // 'admin' can only be assigned by existing admins via direct DB update
  const safeRole: AppRole = ['seller', 'agent'].includes(desiredRole) 
    ? desiredRole 
    : 'user';
  const db = client ?? supabaseAdmin;

  try {
    const { data: existing, error: selectError } = await db
      .from('users')
      .select('role')
      .eq('user_id', userId)
      .single();

    // User record already exists - return existing role
    if (existing?.role) {
      console.log(`[ensureUserRecord] User exists with role: ${existing.role}`);
      return { success: true, role: existing.role as AppRole };
    }

    // No record found - proceed to insert
    if (selectError) {
      console.log(`[ensureUserRecord] No existing record found (expected), creating new one`);
    }

    // Create new user record with safe role
    const { error: insertError } = await db
      .from('users')
      .insert({ user_id: userId, role: safeRole });

    if (insertError) {
      // If duplicate key error, user was just created by another process - not an error
      if (insertError.code === '23505') {
        console.log(`[ensureUserRecord] Duplicate key - user already created`);
        return { success: true, role: safeRole };
      }
      
      console.error(`[ensureUserRecord] Insert error:`, insertError.code, insertError.message);
      return { success: false, role: 'user', error: `Database error: ${insertError.message}` };
    }

    console.log(`[ensureUserRecord] User record created with role: ${safeRole}`);
    return { success: true, role: safeRole };
  } catch (err) {
    console.error('[ensureUserRecord] Exception:', err);
    return { success: false, role: 'user', error: 'Failed to ensure user record' };
  }
}
