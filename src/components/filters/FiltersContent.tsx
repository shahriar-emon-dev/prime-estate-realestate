'use client';

import { useState } from 'react';
import PriceRangeFilter from './PriceRangeFilter';
import LocationFilter from './LocationFilter';
import SquareFeetFilter from './SquareFeetFilter';
import PropertyTypeFilter from './PropertyTypeFilter';
import BedroomBathroomFilter from './BedroomBathroomFilter';
import StatusFilter from './StatusFilter';
import { FaSearch } from 'react-icons/fa';

interface FiltersContentProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function FiltersContent({ searchQuery, onSearchChange }: FiltersContentProps) {
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  const handleSearchInput = (value: string) => {
    // Clear previous timeout
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    // Update immediately for UI responsiveness
    onSearchChange(value);

    // Debounce the actual filter application (if needed for API calls)
    const timeout = setTimeout(() => {
      // The filter is already updated, this is just for future API debouncing
      console.debug('Search debounced:', value);
    }, 300);

    setSearchDebounce(timeout);
  };

  return (
    <div className="space-y-8">
      {/* Search Box */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, city, area..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Search in title, description, city, area, or property type</p>
      </div>

      {/* Status Filter */}
      <div className="border-t border-gray-200 pt-6">
        <StatusFilter />
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-200 pt-6">
        <PriceRangeFilter />
      </div>

      {/* Location */}
      <div className="border-t border-gray-200 pt-6">
        <LocationFilter />
      </div>

      {/* Property Type */}
      <div className="border-t border-gray-200 pt-6">
        <PropertyTypeFilter />
      </div>

      {/* Square Feet */}
      <div className="border-t border-gray-200 pt-6">
        <SquareFeetFilter />
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="border-t border-gray-200 pt-6">
        <BedroomBathroomFilter />
      </div>
    </div>
  );
}
