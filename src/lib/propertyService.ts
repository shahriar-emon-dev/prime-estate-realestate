/**
 * Property CRUD Operations
 * 
 * Complete Create, Read, Update, Delete operations for properties
 */

import { supabase } from './supabaseClient';

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  status: 'Available' | 'Pending' | 'Sold' | 'Rented';
  agent_id: string;
  features: string[];
  furnishing?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  parking_spaces?: number;
  floor_number?: number;
  total_floors?: number;
  facing?: string;
  age_years?: number;
  is_featured?: boolean;
}

/**
 * Create a new property
 */
export async function createProperty(propertyData: PropertyFormData) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating property:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create property'
    };
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(id: string, propertyData: Partial<PropertyFormData>) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update property'
    };
  }
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string) {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete property'
    };
  }
}

/**
 * Upload property images
 */
export async function uploadPropertyImages(propertyId: string, files: File[]) {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}_${index}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      // Save image record to database
      const { error: dbError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: publicUrl,
          display_order: index,
          is_primary: index === 0,
        });

      if (dbError) {
        throw dbError;
      }

      return publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return { data: urls, error: null };
  } catch (error) {
    console.error('Error uploading images:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to upload images'
    };
  }
}

/**
 * Delete property image
 */
export async function deletePropertyImage(imageId: string, imageUrl: string) {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(-2).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('property-images')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      throw dbError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete image'
    };
  }
}

/**
 * Bulk update property status
 */
export async function bulkUpdatePropertyStatus(
  propertyIds: string[],
  status: 'Available' | 'Pending' | 'Sold' | 'Rented'
) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({ status })
      .in('id', propertyIds)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error bulk updating properties:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update properties'
    };
  }
}

/**
 * Export properties to CSV
 */
export async function exportPropertiesToCSV() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        city,
        area,
        bedrooms,
        bathrooms,
        square_feet,
        property_type,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Convert to CSV
    if (!data || data.length === 0) {
      return { data: null, error: 'No data to export' };
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    return { data: csv, error: null };
  } catch (error) {
    console.error('Error exporting properties:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to export properties'
    };
  }
}
