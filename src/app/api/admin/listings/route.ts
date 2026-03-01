// src/app/api/admin/listings/route.ts
// Admin listing management actions
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireAdminUser } from '@/lib/routeAuth';

// Rate limiting map: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// PATCH - Update listing status
export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const auth = await requireAdminUser();
    if (auth.response) {
      return auth.response;
    }

    // Verify admin role is actually admin
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listingId, status } = body;

    if (!listingId || !status) {
      return NextResponse.json(
        { error: 'Listing ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Available', 'Pending', 'Sold'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Available, Pending, or Sold.' },
        { status: 400 }
      );
    }

    // Update listing status
    const { data, error } = await supabaseAdmin
      .from('properties')
      .update({ status })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      console.error('Status update error:', error);
      return NextResponse.json(
        { error: 'Failed to update listing status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Listing status updated to ${status}`,
      listing: data,
    });
  } catch (error) {
    console.error('Admin listing PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const auth = await requireAdminUser();
    if (auth.response) {
      return auth.response;
    }

    // Verify admin role is actually admin
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Delete listing images first (cascade might handle this, but being safe)
    await supabaseAdmin
      .from('property_images')
      .delete()
      .eq('property_id', listingId);

    // Delete the listing
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('Listing delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Admin listing DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
