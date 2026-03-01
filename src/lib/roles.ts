// src/lib/roles.ts
// Role-based access control utilities
import { supabase } from '@/lib/supabaseClient';

// =====================================================
// ROLE DEFINITIONS (Source of Truth)
// =====================================================
// ADMIN  - Full access to admin dashboard, properties, agents
// SELLER - Access to admin dashboard, can manage properties
// BUYER  - Can only browse properties and submit requests (no admin access)

export type UserRole = 'admin' | 'seller' | 'user';

// Role display labels for UI
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  seller: 'Property Seller',
  user: 'Buyer',
};

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

/**
 * Get the current user's role
 * Priority: 1) public.users table, 2) user_metadata, 3) default to 'user'
 */
export async function getCurrentUserRole(): Promise<UserWithRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get data from user metadata (set during registration)
    const metadataRole = user.user_metadata?.role as UserRole | undefined;
    const metadataFullName = user.user_metadata?.full_name as string | undefined;

    // Try to get role from public.users table first
    // Note: users table only has 'role' column, full_name comes from metadata
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !userData) {
      // If no record in users table, use metadata role (set during registration)
      // This is the FIX for the "Admin showing as Buyer" bug
      const role = metadataRole || 'user';
      
      console.log('[roles] No users table record, using metadata role:', role);
      
      return {
        id: user.id,
        email: user.email || '',
        role: role,
        fullName: metadataFullName,
      };
    }

    // Use database role (most authoritative)
    return {
      id: user.id,
      email: user.email || '',
      role: userData.role as UserRole,
      fullName: metadataFullName, // Always from metadata
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Get role display label for UI
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUserRole();
  return user?.role === 'admin';
}

/**
 * Check if user has seller role (or admin, who can do everything)
 */
export async function isSeller(): Promise<boolean> {
  const user = await getCurrentUserRole();
  return user?.role === 'seller' || user?.role === 'admin';
}

/**
 * Check if user can access admin dashboard
 * Only ADMIN and SELLER roles allowed
 */
export async function canAccessAdmin(): Promise<boolean> {
  const user = await getCurrentUserRole();
  if (!user) return false;
  return user.role === 'admin' || user.role === 'seller';
}

/**
 * Check if user is a buyer (can only submit requests, no admin access)
 */
export async function isBuyer(): Promise<boolean> {
  const user = await getCurrentUserRole();
  return user?.role === 'user';
}

/**
 * Check if user can manage a specific listing
 */
export async function canManageListing(listingAgentId: string | null): Promise<boolean> {
  const user = await getCurrentUserRole();
  
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'seller') return true;
  
  return false;
}

/**
 * Hook-friendly role checker
 */
export function useRoleCheck() {
  return {
    checkRole: getCurrentUserRole,
    isAdmin,
    isSeller,
    isBuyer,
    canAccessAdmin,
    canManageListing,
    getRoleLabel,
  };
}
