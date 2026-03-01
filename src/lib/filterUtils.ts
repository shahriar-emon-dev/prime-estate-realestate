/**
 * Filter Utility Functions
 */

import { Property, PropertyFilters, SortState } from './types';

/**
 * Initialize empty filters
 */
export const getDefaultFilters = (): PropertyFilters => ({
  priceMin: null,
  priceMax: null,
  cities: [],
  areas: [],
  squareFeetMin: null,
  squareFeetMax: null,
  propertyTypes: [],
  bedrooms: null,
  bathrooms: null,
  status: ['Available'],
  searchQuery: '',
});

/**
 * Count active filters (for display purposes)
 */
export const countActiveFilters = (filters: PropertyFilters): number => {
  let count = 0;
  
  // Price range
  if ((filters.priceMin !== null && filters.priceMin > 0) || 
      (filters.priceMax !== null && filters.priceMax > 0)) {
    count++;
  }
  
  // Cities
  if (filters.cities.length > 0) count++;
  
  // Areas
  if (filters.areas.length > 0) count++;
  
  // Square feet range
  if ((filters.squareFeetMin !== null && filters.squareFeetMin > 0) || 
      (filters.squareFeetMax !== null && filters.squareFeetMax > 0)) {
    count++;
  }
  
  // Property types
  if (filters.propertyTypes.length > 0) count++;
  
  // Bedrooms
  if (filters.bedrooms !== null && filters.bedrooms > 0) count++;
  
  // Bathrooms
  if (filters.bathrooms !== null && filters.bathrooms > 0) count++;
  
  // Status - only count if not default (Available only)
  const isDefaultStatus = filters.status.length === 1 && filters.status[0] === 'Available';
  if (!isDefaultStatus && filters.status.length > 0) count++;
  
  // Search query
  if (filters.searchQuery && filters.searchQuery.trim() !== '') count++;
  
  return count;
};

/**
 * Apply filters to properties array (client-side filtering, backup for mock data)
 */
export const applyFilters = (properties: Property[], filters: PropertyFilters): Property[] => {
  return properties.filter(property => {
    // Price filter
    if (filters.priceMin !== null && filters.priceMin > 0 && property.priceNumeric < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== null && filters.priceMax > 0 && property.priceNumeric > filters.priceMax) {
      return false;
    }
    
    // City filter
    if (filters.cities.length > 0 && !filters.cities.includes(property.city)) {
      return false;
    }
    
    // Area filter
    if (filters.areas.length > 0 && !filters.areas.includes(property.area)) {
      return false;
    }
    
    // Square feet filter
    if (filters.squareFeetMin !== null && filters.squareFeetMin > 0 && property.squareFeet < filters.squareFeetMin) {
      return false;
    }
    if (filters.squareFeetMax !== null && filters.squareFeetMax > 0 && property.squareFeet > filters.squareFeetMax) {
      return false;
    }
    
    // Property type filter
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) {
      return false;
    }
    
    // Bedrooms filter (at least X bedrooms)
    if (filters.bedrooms !== null && filters.bedrooms > 0 && property.bedrooms < filters.bedrooms) {
      return false;
    }
    
    // Bathrooms filter (at least X bathrooms)
    if (filters.bathrooms !== null && filters.bathrooms > 0 && property.bathrooms < filters.bathrooms) {
      return false;
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(property.status)) {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        property.title,
        property.description,
        property.city,
        property.area,
        property.propertyType,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Apply sorting to properties array
 */
export const applySorting = (properties: Property[], sortState: SortState): Property[] => {
  const sorted = [...properties];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortState.sortBy) {
      case 'price':
      case 'priceNumeric':
        comparison = a.priceNumeric - b.priceNumeric;
        break;
      case 'size':
      case 'squareFeet':
        comparison = a.squareFeet - b.squareFeet;
        break;
      case 'date':
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'bedrooms':
        comparison = a.bedrooms - b.bedrooms;
        break;
      default:
        comparison = 0;
    }
    
    return sortState.sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Predefined price ranges (in BDT)
 */
export const priceRanges = [
  { label: 'Under ৳50 Lakh', min: 0, max: 5000000 },
  { label: '৳50L - ৳1 Crore', min: 5000000, max: 10000000 },
  { label: '৳1Cr - ৳3 Crore', min: 10000000, max: 30000000 },
  { label: '৳3Cr - ৳5 Crore', min: 30000000, max: 50000000 },
  { label: 'Above ৳5 Crore', min: 50000000, max: null },
];

/**
 * Predefined square feet ranges
 */
export const squareFeetRanges = [
  { label: 'Under 1,000 sqft', min: 0, max: 1000 },
  { label: '1,000 - 2,000 sqft', min: 1000, max: 2000 },
  { label: '2,000 - 3,000 sqft', min: 2000, max: 3000 },
  { label: '3,000 - 4,000 sqft', min: 3000, max: 4000 },
  { label: 'Above 4,000 sqft', min: 4000, max: null },
];

/**
 * Sort options
 */
export const sortOptions = [
  { label: 'Newest First', value: 'date-desc', field: 'createdAt' as const, order: 'desc' as const },
  { label: 'Oldest First', value: 'date-asc', field: 'createdAt' as const, order: 'asc' as const },
  { label: 'Price: Low to High', value: 'price-asc', field: 'priceNumeric' as const, order: 'asc' as const },
  { label: 'Price: High to Low', value: 'price-desc', field: 'priceNumeric' as const, order: 'desc' as const },
  { label: 'Size: Small to Large', value: 'size-asc', field: 'squareFeet' as const, order: 'asc' as const },
  { label: 'Size: Large to Small', value: 'size-desc', field: 'squareFeet' as const, order: 'desc' as const },
];

/**
 * Format price to readable format (BDT)
 */
export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `৳${(price / 10000000).toFixed(1)} Cr`;
  } else if (price >= 100000) {
    return `৳${(price / 100000).toFixed(0)} L`;
  } else if (price >= 1000) {
    return `৳${(price / 1000).toFixed(0)}K`;
  } else {
    return `৳${price.toLocaleString()}`;
  }
};

/**
 * Format square feet to readable format
 */
export const formatSquareFeet = (sqft: number): string => {
  return sqft.toLocaleString() + ' sqft';
};

/**
 * Parse price string to number (handles various formats)
 */
export const parsePrice = (priceString: string): number => {
  // Remove currency symbols and commas
  const cleaned = priceString.replace(/[৳,\s]/g, '');
  
  // Handle Crore (Cr)
  if (cleaned.toLowerCase().includes('cr')) {
    const value = parseFloat(cleaned.replace(/cr/i, ''));
    return value * 10000000;
  }
  
  // Handle Lakh (L)
  if (cleaned.toLowerCase().includes('l')) {
    const value = parseFloat(cleaned.replace(/l/i, ''));
    return value * 100000;
  }
  
  // Handle K (thousands)
  if (cleaned.toLowerCase().includes('k')) {
    const value = parseFloat(cleaned.replace(/k/i, ''));
    return value * 1000;
  }
  
  return parseFloat(cleaned) || 0;
};
