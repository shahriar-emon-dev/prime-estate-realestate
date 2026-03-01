'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PropertyFilters, FilterContextType } from '@/lib/types';
import { getDefaultFilters, countActiveFilters } from '@/lib/filterUtils';

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<PropertyFilters>(() => {
    const defaults = getDefaultFilters();
    
    // Parse URL params
    const params = new URLSearchParams(searchParams);
    
    return {
      searchQuery: params.get('q') || defaults.searchQuery,
      priceMin: params.get('minPrice') ? parseInt(params.get('minPrice')!) : defaults.priceMin,
      priceMax: params.get('maxPrice') ? parseInt(params.get('maxPrice')!) : defaults.priceMax,
      cities: params.getAll('city').length > 0 ? params.getAll('city') : defaults.cities,
      areas: params.getAll('area').length > 0 ? params.getAll('area') : defaults.areas,
      propertyTypes: params.getAll('type').length > 0 ? params.getAll('type') : defaults.propertyTypes,
      squareFeetMin: params.get('minSize') ? parseInt(params.get('minSize')!) : defaults.squareFeetMin,
      squareFeetMax: params.get('maxSize') ? parseInt(params.get('maxSize')!) : defaults.squareFeetMax,
      bedrooms: params.get('beds') ? parseInt(params.get('beds')!) : defaults.bedrooms,
      bathrooms: params.get('baths') ? parseInt(params.get('baths')!) : defaults.bathrooms,
      // Status: use URL params if present, otherwise use default (Available)
      status: params.getAll('status').length > 0 ? params.getAll('status') : defaults.status,
    };
  });

  // Draft filters for mobile (apply on button click)
  const [draftFilters, setDraftFilters] = useState<PropertyFilters>(filters);
  const [isDraft, setIsDraft] = useState(false);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    const defaults = getDefaultFilters();
    
    // Only add to URL if different from default
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      params.set('q', filters.searchQuery);
    }
    if (filters.priceMin !== null && filters.priceMin > 0) {
      params.set('minPrice', filters.priceMin.toString());
    }
    if (filters.priceMax !== null && filters.priceMax > 0) {
      params.set('maxPrice', filters.priceMax.toString());
    }
    filters.cities.forEach(city => params.append('city', city));
    filters.areas.forEach(area => params.append('area', area));
    filters.propertyTypes.forEach(type => params.append('type', type));
    if (filters.squareFeetMin !== null && filters.squareFeetMin > 0) {
      params.set('minSize', filters.squareFeetMin.toString());
    }
    if (filters.squareFeetMax !== null && filters.squareFeetMax > 0) {
      params.set('maxSize', filters.squareFeetMax.toString());
    }
    if (filters.bedrooms !== null && filters.bedrooms > 0) {
      params.set('beds', filters.bedrooms.toString());
    }
    if (filters.bathrooms !== null && filters.bathrooms > 0) {
      params.set('baths', filters.bathrooms.toString());
    }
    // Only add status to URL if it's different from default ['Available']
    const isDefaultStatus = filters.status.length === 1 && filters.status[0] === 'Available';
    if (!isDefaultStatus && filters.status.length > 0) {
      filters.status.forEach(status => params.append('status', status));
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, pathname, router]);

  const updateFilter = useCallback(<K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => {
    if (isDraft) {
      setDraftFilters(prev => ({ ...prev, [key]: value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  }, [isDraft]);

  const clearFilters = useCallback(() => {
    const defaults = getDefaultFilters();
    if (isDraft) {
      setDraftFilters(defaults);
    } else {
      setFilters(defaults);
    }
  }, [isDraft]);

  const applyDraftFilters = useCallback(() => {
    setFilters(draftFilters);
    setIsDraft(false);
  }, [draftFilters]);

  const setDraftMode = useCallback((enabled: boolean) => {
    setIsDraft(enabled);
    if (enabled) {
      setDraftFilters(filters);
    }
  }, [filters]);

  const activeFilterCount = useMemo(() => 
    countActiveFilters(isDraft ? draftFilters : filters), 
    [filters, draftFilters, isDraft]
  );

  const value: FilterContextType = {
    filters: isDraft ? draftFilters : filters,
    setFilters,
    updateFilter,
    clearFilters,
    activeFilterCount,
    applyDraftFilters,
    setDraftMode,
    isDraft,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
