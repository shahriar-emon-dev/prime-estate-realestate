'use client';

import { useFilters } from '@/contexts/FilterContext';

export default function BedroomBathroomFilter() {
  const { filters, updateFilter } = useFilters();

  const bedroomOptions = [1, 2, 3, 4, 5];
  const bathroomOptions = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      {/* Bedrooms */}
      <div>
        <h3 className="font-semibold text-black mb-3">Bedrooms</h3>
        <div className="grid grid-cols-6 gap-2">
          <button
            onClick={() => updateFilter('bedrooms', null)}
            className={`px-3 py-2 rounded-lg border transition-all font-medium ${
              filters.bedrooms === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:border-blue-300 text-black'
            }`}
          >
            Any
          </button>
          {bedroomOptions.map((num) => (
            <button
              key={num}
              onClick={() => updateFilter('bedrooms', num)}
              className={`px-3 py-2 rounded-lg border transition-all font-medium ${
                filters.bedrooms === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:border-blue-300 text-black'
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <h3 className="font-semibold text-black mb-3">Bathrooms</h3>
        <div className="grid grid-cols-6 gap-2">
          <button
            onClick={() => updateFilter('bathrooms', null)}
            className={`px-3 py-2 rounded-lg border transition-all font-medium ${
              filters.bathrooms === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:border-blue-300 text-black'
            }`}
          >
            Any
          </button>
          {bathroomOptions.map((num) => (
            <button
              key={num}
              onClick={() => updateFilter('bathrooms', num)}
              className={`px-3 py-2 rounded-lg border transition-all font-medium ${
                filters.bathrooms === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:border-blue-300 text-black'
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
