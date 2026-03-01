import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminUser } from '@/lib/routeAuth';

// Input sanitization
function sanitizeInput(input: string): string {
  return input.trim().substring(0, 500);
}

function validatePropertyData(data: any): boolean {
  return (
    data.title &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    data.title.length <= 200 &&
    data.priceNumeric &&
    typeof data.priceNumeric === 'number' &&
    data.priceNumeric > 0 &&
    data.city &&
    data.area &&
    data.propertyType
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase server environment variables');
}

// Create a Supabase client with the Service Role Key for admin operations
// We need this to bypass RLS for uploads if necessary, or just use standard client if RLS allows
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey
);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminUser();
    if (auth.response) {
      return auth.response;
    }

    const formData = await request.formData();
    
    // Extract fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceText = formData.get('price') as string; // e.g. "2.5 Crore"
    const priceNumeric = parseFloat(formData.get('priceNumeric') as string || '0');
    const city = formData.get('city') as string;
    const area = formData.get('area') as string;
    const bedrooms = parseInt(formData.get('bedrooms') as string || '0');
    const bathrooms = parseInt(formData.get('bathrooms') as string || '0');
    const squareFeet = parseInt(formData.get('squareFeet') as string || '0');
    const propertyType = formData.get('propertyType') as string;
    const status = formData.get('status') as string || 'Available';
    const featuresRaw = formData.get('features') as string;
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];
    
    // Validate required fields
    if (!title || !priceText || !city || !area || !propertyType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert Property
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .insert({
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
        // Default agent for now (or get from session if we had full auth context)
        // For MVP, we'll try to get the first active agent or handle it gracefully
        // agent_id: '...', 
      })
      .select()
      .single();

    if (propertyError) {
      console.error('Property insert error:', propertyError);
      return NextResponse.json({ error: propertyError.message }, { status: 500 });
    }

    const propertyId = property.id;
    const uploadedImages = [];

    // 2. Handle Images
    const files = formData.getAll('images') as File[];
    
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.size) continue;

        // Generate a unique path: properties/{propertyId}/{timestamp}-{filename}
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${propertyId}/${fileName}`;

        // Upload to 'properties' bucket
        const { error: uploadError } = await supabaseAdmin
          .storage
          .from('properties')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue; // Skip failed uploads but continue with others
        }

        // Get Public URL
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('properties')
          .getPublicUrl(filePath);

        uploadedImages.push({
          property_id: propertyId,
          image_url: publicUrl,
          is_primary: i === 0, // First image is primary
          display_order: i,
        });
      }

      // 3. Insert Image Records
      if (uploadedImages.length > 0) {
        const { error: imagesError } = await supabaseAdmin
          .from('property_images')
          .insert(uploadedImages);

        if (imagesError) {
          console.error('Property images insert error:', imagesError);
          // Non-fatal, property is created, images uploaded, just db link failed
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      property, 
      imageCount: uploadedImages.length 
    }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
