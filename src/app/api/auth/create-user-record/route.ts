// src/app/api/auth/create-user-record/route.ts
// API route to create user record in public.users table after registration

import { NextRequest, NextResponse } from 'next/server';
import { ensureUserRecord } from '@/lib/supabaseServer';
import { requireAuthenticatedUser } from '@/lib/routeAuth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth.response || !auth.user) {
      console.error('[Create User Record] User not authenticated');
      return auth.response;
    }

    const body = await request.json();
    const { userId, role, fullName } = body;

    // Validate required fields
    if (!userId) {
      console.error('[Create User Record] User ID is required');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (userId !== auth.user.id) {
      console.error('[Create User Record] User ID mismatch - Forbidden');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    console.log(`[Create User Record] Creating record for user: ${userId}, role: ${role}`);

    // ensureUserRecord has its own safety filter:
    // only 'seller' and 'agent' are allowed as non-user roles through public flow.
    // 'admin' must be assigned directly by an existing admin.
    const result = await ensureUserRecord(userId, role || 'user', auth.supabase);

    if (!result.success) {
      console.error(`[Create User Record] Failed - ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Failed to create user record' },
        { status: 500 }
      );
    }

    console.log(`[Create User Record] Success - role: ${result.role}`);
    return NextResponse.json({ success: true, role: result.role, fullName });
  } catch (error) {
    console.error('[Create User Record] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
