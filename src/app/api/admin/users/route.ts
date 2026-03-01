import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/routeAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';

/**
 * GET /api/admin/users - Get all users
 * Returns: { users: UserRecord[] }
 *
 * Delete users via DELETE /api/admin/users/[userId]
 */

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Users GET] Request started');

    // 1. Verify authentication
    const authResult = await requireAuthenticatedUser();
    if (authResult.response || !authResult.user) {
      console.log('[Admin Users GET] Not authenticated');
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult.user;

    // 2. Verify admin role
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !adminUser || adminUser.role !== 'admin') {
      console.log('[Admin Users GET] User is not an admin');
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Fetch all users
    console.log('[Admin Users GET] Fetching all users');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('user_id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('[Admin Users GET] Database error:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log('[Admin Users GET] Retrieved', users?.length || 0, 'users');
    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('[Admin Users GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
