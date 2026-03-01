/**
 * Server-side redirect handler for post-login
 * 
 * This endpoint:
 * 1. Verifies the user is authenticated
 * 2. Ensures user record exists in database
 * 3. Fetches actual role from database
 * 4. Redirects to appropriate dashboard/homepage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabaseClient, requireAuthenticatedUser } from '@/lib/routeAuth';
import { supabaseAdmin, getUserRoleById, ensureUserRecord } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const auth = await requireAuthenticatedUser();
    if (auth.response || !auth.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Ensure user record exists in database (idempotent)
    // Use the authenticated client so RLS works with the user's session.
    // ensureUserRecord has safety filters - admin role can't be self-assigned.
    const metadataRole = auth.user.user_metadata?.role || 'user';
    await ensureUserRecord(auth.user.id, metadataRole, auth.supabase);

    // 3. Fetch the actual role from database (this is the source of truth)
    const role = await getUserRoleById(auth.user.id, auth.supabase);

    // 4. Determine redirect URL based on actual database role
    let redirectUrl = '/';
    switch (role) {
      case 'admin':
        redirectUrl = '/admin/dashboard';
        break;
      case 'seller':
        redirectUrl = '/seller/dashboard';
        break;
      case 'agent':
        redirectUrl = '/agent/dashboard';
        break;
      case 'user':
      default:
        redirectUrl = '/';
        break;
    }

    // 5. Return redirect response
    return NextResponse.json(
      { 
        success: true,
        role,
        redirectUrl
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Redirect handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
