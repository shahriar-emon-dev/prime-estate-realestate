'use client';

import { useFilters } from '@/contexts/FilterContext';
import { squareFeetRanges } from '@/lib/filterUtils';

export default function SquareFeetFilter() {
  const { filters, updateFilter } = useFilters();

  const handleRangeSelect = (min: number, max: number | null) => {
    updateFilter('squareFeetMin', min === 0 ? null : min);
    updateFilter('squareFeetMax', max);
  };

  const handleCustomChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    if (type === 'min') {
      updateFilter('squareFeetMin', numValue);
    } else {
      updateFilter('squareFeetMax', numValue);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-black">Property Size</h3>
      
      {/* Predefined Ranges */}
      <div className="space-y-2">
        {squareFeetRanges.map((range, index) => {
          const isActive = 
            (filters.squareFeetMin === (range.min === 0 ? null : range.min) || (!filters.squareFeetMin && range.min === 0)) &&
            (filters.squareFeetMax === (range.max === Infinity ? null : range.max) || (!filters.squareFeetMax && range.max === Infinity));
          
          return (
            <button
              key={index}
              onClick={() => handleRangeSelect(range.min, range.max)}
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
        <p className="text-sm font-medium text-black mb-3">Custom Size</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-black mb-1 block">Min (sqft)</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.squareFeetMin || ''}
              onChange={(e) => handleCustomChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-black mb-1 block">Max (sqft)</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.squareFeetMax || ''}
              onChange={(e) => handleCustomChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
