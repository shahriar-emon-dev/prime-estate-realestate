import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/routeAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';

/**
 * DELETE /api/admin/users/[userId] - Delete a specific user
 * Returns: { success: boolean }
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('[Admin Users DELETE] Request started for userId:', userId);

    // 1. Verify authentication
    const authResult = await requireAuthenticatedUser();
    if (authResult.response || !authResult.user) {
      console.log('[Admin Users DELETE] Not authenticated');
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
      console.log('[Admin Users DELETE] User is not an admin');
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Validate user ID
    if (!userId) {
      console.log('[Admin Users DELETE] No user ID provided');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // 4. Prevent self-deletion
    if (userId === user.id) {
      console.log('[Admin Users DELETE] Attempt to delete self');
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // 5. Delete user record from database
    console.log('[Admin Users DELETE] Deleting user record:', userId);
    const { error: dbDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('user_id', userId);

    if (dbDeleteError) {
      console.error('[Admin Users DELETE] Database error:', dbDeleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    // 6. Delete auth user
    console.log('[Admin Users DELETE] Deleting auth user:', userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    console.log('[Admin Users DELETE] User deleted successfully:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Users DELETE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
