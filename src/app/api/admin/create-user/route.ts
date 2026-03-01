import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/routeAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import type { AppRole } from '@/lib/supabaseServer';

/**
 * API handler to create users from admin panel
 * POST /api/admin/create-user
 * Body: { email, password, name, role: 'seller' | 'agent' }
 * Returns: { success: boolean, userId?: string, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Create User] Request started');

    // 1. Verify authentication and get user
    const authResult = await requireAuthenticatedUser();
    if (authResult.response || !authResult.user) {
      console.log('[Admin Create User] Not authenticated');
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult.user;

    // 2. Verify admin role by checking database
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !adminUser || adminUser.role !== 'admin') {
      console.log('[Admin Create User] User is not an admin:', adminUser?.role);
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse request body
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate inputs
    if (!email || !password || !name || !role) {
      console.log('[Admin Create User] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, role' },
        { status: 400 }
      );
    }

    // Validate role — admin can create buyer, seller, or agent (but NOT another admin)
    const allowedRoles = ['user', 'seller', 'agent'];
    if (!allowedRoles.includes(role)) {
      console.log('[Admin Create User] Invalid role:', role);
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" (buyer), "seller", or "agent"' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[Admin Create User] Invalid email format');
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      console.log('[Admin Create User] Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // 4. Create auth user
    console.log('[Admin Create User] Creating auth user:', email);
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // Auto-confirm since admin is creating
      user_metadata: {
        full_name: name,
        role: role as AppRole,
      },
    });

    if (authCreateError || !authData.user) {
      console.error('[Admin Create User] Auth creation failed:', authCreateError);
      return NextResponse.json(
        { error: `Failed to create auth account: ${authCreateError?.message}` },
        { status: 400 }
      );
    }

    const newUserId = authData.user.id;
    console.log('[Admin Create User] Auth user created:', newUserId);

    // 5. Create user record in database (users table only has user_id, role, created_at, updated_at)
    console.log('[Admin Create User] Creating user record with role:', role);
    const { data: userRecord, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: newUserId,
        role: role as AppRole,
      })
      .select()
      .single();

    if (dbError || !userRecord) {
      // If user record creation fails, we should delete the auth user to keep in sync
      console.error('[Admin Create User] Database insert failed:', dbError);
      console.log('[Admin Create User] Cleaning up auth user:', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        { error: `Failed to create user record: ${dbError?.message}` },
        { status: 400 }
      );
    }

    console.log('[Admin Create User] User created successfully:', newUserId);
    return NextResponse.json(
      {
        success: true,
        userId: newUserId,
        email: email.toLowerCase().trim(),
        role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Create User] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
