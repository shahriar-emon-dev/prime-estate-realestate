'use client';

import { useFilters } from '@/contexts/FilterContext';
import { formatPrice } from '@/lib/filterUtils';
import { FaTimes } from 'react-icons/fa';

export default function FilterTags() {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useFilters();

  if (activeFilterCount === 0) return null;

  const removeTag = (key: keyof typeof filters, value?: string) => {
    switch (key) {
      case 'priceMin':
      case 'priceMax':
      case 'squareFeetMin':
      case 'squareFeetMax':
      case 'bedrooms':
      case 'bathrooms':
        updateFilter(key, null);
        break;
      case 'searchQuery':
        updateFilter(key, '');
        break;
      case 'cities':
        updateFilter('cities', filters.cities.filter(c => c !== value));
        break;
      case 'areas':
        updateFilter('areas', filters.areas.filter(a => a !== value));
        break;
      case 'propertyTypes':
        updateFilter('propertyTypes', filters.propertyTypes.filter(t => t !== value));
        break;
      case 'status':
        const newStatus = filters.status.filter(s => s !== value);
        // If removing leaves empty, reset to Available
        updateFilter('status', newStatus.length > 0 ? newStatus : ['Available']);
        break;
    }
  };

  // Check if status is non-default (not just Available)
  const isNonDefaultStatus = !(filters.status.length === 1 && filters.status[0] === 'Available');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
        
        {/* Search Query */}
        {filters.searchQuery && filters.searchQuery.trim() !== '' && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
            &quot;{filters.searchQuery}&quot;
            <button 
              aria-label="Remove search query" 
              onClick={() => removeTag('searchQuery')} 
              className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        )}

        {/* Status Tags - only show if not default */}
        {isNonDefaultStatus && filters.status.map((status) => (
          <span 
            key={status} 
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              status === 'Available' ? 'bg-green-100 text-green-700' :
              status === 'Sold' ? 'bg-red-100 text-red-700' :
              status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
              status === 'Rented' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}
          >
            {status}
            <button 
              aria-label={`Remove ${status} filter`} 
              onClick={() => removeTag('status', status)} 
              className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ))}

        {/* Price Range */}
        {(filters.priceMin !== null && filters.priceMin > 0) || (filters.priceMax !== null && filters.priceMax > 0) ? (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Price: {filters.priceMin && filters.priceMin > 0 ? formatPrice(filters.priceMin) : '0'} - {filters.priceMax && filters.priceMax > 0 ? formatPrice(filters.priceMax) : '∞'}
            <button 
              aria-label="Remove price filter" 
              onClick={() => { removeTag('priceMin'); removeTag('priceMax'); }} 
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ) : null}

        {/* Square Feet Range */}
        {(filters.squareFeetMin !== null && filters.squareFeetMin > 0) || (filters.squareFeetMax !== null && filters.squareFeetMax > 0) ? (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Size: {filters.squareFeetMin && filters.squareFeetMin > 0 ? filters.squareFeetMin.toLocaleString() : '0'} - {filters.squareFeetMax && filters.squareFeetMax > 0 ? filters.squareFeetMax.toLocaleString() : '∞'} sqft
            <button 
              aria-label="Remove size filter" 
              onClick={() => { removeTag('squareFeetMin'); removeTag('squareFeetMax'); }} 
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ) : null}

        {/* Cities */}
        {filters.cities.map((city) => (
          <span key={city} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {city}
            <button 
              aria-label={`Remove ${city} filter`} 
              onClick={() => removeTag('cities', city)} 
              className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ))}

        {/* Areas */}
        {filters.areas.map((area) => (
          <span key={area} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {area}
            <button 
              aria-label={`Remove ${area} filter`} 
              onClick={() => removeTag('areas', area)} 
              className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ))}

        {/* Property Types */}
        {filters.propertyTypes.map((type) => (
          <span key={type} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {type}
            <button 
              aria-label={`Remove ${type} filter`} 
              onClick={() => removeTag('propertyTypes', type)} 
              className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        ))}

        {/* Bedrooms */}
        {filters.bedrooms !== null && filters.bedrooms > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            {filters.bedrooms}+ Beds
            <button 
              aria-label="Remove bedrooms filter" 
              onClick={() => removeTag('bedrooms')} 
              className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        )}

        {/* Bathrooms */}
        {filters.bathrooms !== null && filters.bathrooms > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            {filters.bathrooms}+ Baths
            <button 
              aria-label="Remove bathrooms filter" 
              onClick={() => removeTag('bathrooms')} 
              className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </span>
        )}

        {/* Clear All Button */}
        <button
          onClick={clearFilters}
          className="ml-auto px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
