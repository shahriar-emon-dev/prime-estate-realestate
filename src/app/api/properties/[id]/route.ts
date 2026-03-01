import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminUser } from '@/lib/routeAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase server environment variables');
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .select(`
        *,
        images:property_images(id, image_url, is_primary, display_order)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAdminUser();
    if (auth.response) {
      return auth.response;
    }

    const formData = await request.formData();
    
    // Extract fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceText = formData.get('price') as string;
    const priceNumeric = parseFloat(formData.get('priceNumeric') as string || '0');
    const city = formData.get('city') as string;
    const area = formData.get('area') as string;
    const bedrooms = parseInt(formData.get('bedrooms') as string || '0');
    const bathrooms = parseInt(formData.get('bathrooms') as string || '0');
    const squareFeet = parseInt(formData.get('squareFeet') as string || '0');
    const propertyType = formData.get('propertyType') as string;
    const status = formData.get('status') as string;
    const featuresRaw = formData.get('features') as string;
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];
    
    const keptImages = formData.getAll('keptImages') as string[]; // URLs of images to keep
    
    // 1. Update Property
    const { error: updateError } = await supabaseAdmin
      .from('properties')
      .update({
        title,
        description,
        price: priceText,
        price_numeric: priceNumeric,
        city,
        area,
        bedrooms,
        bathrooms,
        square_feet: squareFeet,
        property_type: propertyType,
        status,
        features,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Property update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Handle Images
    
    // 2a. Delete removed images from DB
    // Fetch current images first
    const { data: currentImages, error: fetchImagesError } = await supabaseAdmin
      .from('property_images')
      .select('image_url')
      .eq('property_id', id);
      
    if (fetchImagesError) {
        console.error('Error fetching images for cleanup:', fetchImagesError);
    }
      
    const currentUrls = currentImages?.map(i => i.image_url) || [];
    const urlsToDelete = currentUrls.filter(url => !keptImages.includes(url));
    
    if (urlsToDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('property_images')
        .delete()
        .eq('property_id', id)
        .in('image_url', urlsToDelete);
        
      if (deleteError) {
          console.error('Error deleting removed images:', deleteError);
      }
    }

    // 2b. Add new images
    const newFiles = formData.getAll('newImages') as File[];
    const newUploadedImages = [];

    if (newFiles.length > 0) {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        if (!file.size) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabaseAdmin
          .storage
          .from('properties')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('properties')
          .getPublicUrl(filePath);

        newUploadedImages.push({
          property_id: id,
          image_url: publicUrl,
          is_primary: false, // Logic for primary needs refinement if all old primaries removed, but simple appending for now
          display_order: 99 + i,
        });
      }

      if (newUploadedImages.length > 0) {
        const { error: itemsInsertError } = await supabaseAdmin
          .from('property_images')
          .insert(newUploadedImages);
          
        if (itemsInsertError) {
            console.error('Error inserting new image records:', itemsInsertError);
        }
      }
    }
    
    // Ensure at least one image is primary if possible (optional polish)

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error in PUT /api/properties/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
