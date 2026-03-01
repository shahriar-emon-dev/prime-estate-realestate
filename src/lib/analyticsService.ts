/**
 * Analytics Service
 * Track property views, user interactions, and generate insights
 */

import { supabase } from './supabaseClient';

/**
 * Track property view
 */
export async function trackPropertyView(propertyId: string, userId?: string) {
  try {
    // Increment view count (Supabase JS v2: use .increment, v1: fetch, increment, update)
    // Always use fetch-increment-update for compatibility
    let updateError = null;
    const { data: prop, error: fetchError } = await supabase
      .from('properties')
      .select('views_count')
      .eq('id', propertyId)
      .single();
    if (!fetchError && prop) {
      const { error } = await supabase
        .from('properties')
        .update({ views_count: (prop.views_count || 0) + 1 })
        .eq('id', propertyId);
      updateError = error;
    } else {
      updateError = fetchError;
    }

    if (updateError) {
      console.error('Error updating view count:', updateError);
    }

    // Track detailed view (if property_views table exists)
    const { error: trackError } = await supabase
      .from('property_views')
      .insert({
        property_id: propertyId,
        user_id: userId,
        viewed_at: new Date().toISOString(),
      });

    if (trackError) {
      console.error('Error tracking view:', trackError);
    }

    return { error: null };
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return { error: 'Failed to track view' };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get property counts by status
    const { data: propertyCounts, error: countError } = await supabase
      .from('properties')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        
        const counts = {
          total: data?.length || 0,
          available: data?.filter(p => p.status === 'Available').length || 0,
          pending: data?.filter(p => p.status === 'Pending').length || 0,
          sold: data?.filter(p => p.status === 'Sold').length || 0,
        };
        
        return { data: counts, error: null };
      });

    if (countError) throw countError;

    // Get meeting request stats
    const { data: meetingStats, error: meetingError } = await supabase
      .from('meeting_requests')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        
        const stats = {
          total: data?.length || 0,
          pending: data?.filter(m => m.status === 'Pending').length || 0,
          approved: data?.filter(m => m.status === 'Approved').length || 0,
          completed: data?.filter(m => m.status === 'Completed').length || 0,
        };
        
        return { data: stats, error: null };
      });

    if (meetingError) throw meetingError;

    // Get site visit stats
    const { data: visitStats, error: visitError } = await supabase
      .from('site_visit_requests')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        
        const stats = {
          total: data?.length || 0,
          pending: data?.filter(v => v.status === 'Pending').length || 0,
          scheduled: data?.filter(v => v.status === 'Scheduled').length || 0,
          completed: data?.filter(v => v.status === 'Completed').length || 0,
        };
        
        return { data: stats, error: null };
      });

    if (visitError) throw visitError;

    return {
      data: {
        properties: propertyCounts,
        meetings: meetingStats,
        visits: visitStats,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    };
  }
}

/**
 * Get trending properties (most viewed)
 */
export async function getTrendingProperties(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, price, city, area, views_count, images:property_images(image_url, is_primary)')
      .eq('status', 'Available')
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching trending properties:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch trending properties',
    };
  }
}

/**
 * Get agent performance metrics
 */
export async function getAgentPerformance(agentId: string) {
  try {
    // Get properties by agent
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, status, price, created_at')
      .eq('agent_id', agentId);

    if (propError) throw propError;

    const metrics = {
      total_listings: properties?.length || 0,
      active_listings: properties?.filter(p => p.status === 'Available').length || 0,
      sold_properties: properties?.filter(p => p.status === 'Sold').length || 0,
      total_value: properties?.reduce((sum, p) => sum + (Number(p.price) || 0), 0) || 0,
      avg_listing_price: properties?.length 
        ? (properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / properties.length)
        : 0,
    };

    return { data: metrics, error: null };
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch agent performance',
    };
  }
}
