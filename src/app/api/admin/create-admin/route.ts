// src/app/api/admin/create-admin/route.ts
// Secure API endpoint for creating admin accounts
// Protected by ADMIN_REGISTRATION_TOKEN environment variable

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    // Verify admin registration token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const validToken = process.env.ADMIN_REGISTRATION_TOKEN;

    if (!validToken || token !== validToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing admin token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create auth user via admin client
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: name,
        role: 'admin',
      },
    });

    if (authError) {
      console.error('Admin auth creation error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Failed to create auth user' },
        { status: 500 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user record in public.users table with admin role
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: data.user.id,
        role: 'admin',
      });

    if (dbError && dbError.code !== '23505') {
      console.error('Admin user record creation error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin creation endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
