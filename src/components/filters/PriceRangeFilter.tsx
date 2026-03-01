'use client';

import { useFilters } from '@/contexts/FilterContext';
import { priceRanges } from '@/lib/filterUtils';

export default function PriceRangeFilter() {
  const { filters, updateFilter } = useFilters();

  const handlePriceRangeSelect = (min: number, max: number | null) => {
    updateFilter('priceMin', min === 0 ? null : min);
    updateFilter('priceMax', max);
  };

  const handleCustomPriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    if (type === 'min') {
      updateFilter('priceMin', numValue);
    } else {
      updateFilter('priceMax', numValue);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-black">Price Range</h3>
      
      {/* Predefined Ranges */}
      <div className="space-y-2">
        {priceRanges.map((range, index) => {
          const isActive = 
            (filters.priceMin === (range.min === 0 ? null : range.min) || (!filters.priceMin && range.min === 0)) &&
            (filters.priceMax === (range.max === Infinity ? null : range.max) || (!filters.priceMax && range.max === Infinity));
          
          return (
            <button
              key={index}
              onClick={() => handlePriceRangeSelect(range.min, range.max)}
              className={`w-full text-left px-4 py-2 rounded-lg border transition-all text-base font-medium ${
                isActive
                  ? 'bg-blue-50 border-blue-600 text-blue-700'
                  : 'border-gray-200 text-gray-900 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {/* Custom Range Inputs */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-black mb-3">Custom Range</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-black/60 mb-1 block">Min Price</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => handleCustomPriceChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-black/60 mb-1 block">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => handleCustomPriceChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
