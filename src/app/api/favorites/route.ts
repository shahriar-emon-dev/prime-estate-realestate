// src/app/api/favorites/route.ts
// Toggle favorite for a property
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/routeAuth';

// GET - Check if property is favorited by user
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth.response || !auth.user) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await auth.supabase
      .from('favorites')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', auth.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = No rows found, which is fine
      console.error('Favorite check error:', error);
      return NextResponse.json(
        { error: 'Failed to check favorite status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ isFavorited: !!data });
  } catch (error) {
    console.error('Favorite GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Toggle favorite (add or remove)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth.response || !auth.user) {
      return auth.response;
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await auth.supabase
      .from('favorites')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', auth.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Favorite check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to toggle favorite' },
        { status: 500 }
      );
    }

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await auth.supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Favorite delete error:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'removed',
        isFavorited: false,
      });
    } else {
      // Add favorite
      const { error: insertError } = await auth.supabase
        .from('favorites')
        .insert({
          property_id: propertyId,
          user_id: auth.user.id,
        });

      if (insertError) {
        console.error('Favorite insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to add favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'added',
        isFavorited: true,
      });
    }
  } catch (error) {
    console.error('Favorite POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
