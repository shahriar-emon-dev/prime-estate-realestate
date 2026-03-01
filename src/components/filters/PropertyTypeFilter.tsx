'use client';

import { useEffect, useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { getAllPropertyTypes } from '@/lib/dataService';
import { PropertyType } from '@/lib/types';

export default function PropertyTypeFilter() {
  const { filters, updateFilter } = useFilters();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  useEffect(() => {
    loadPropertyTypes();
  }, []);

  async function loadPropertyTypes() {
    const { data } = await getAllPropertyTypes();
    if (data) setPropertyTypes(data);
  }

  const handleToggle = (typeName: string) => {
    const newTypes = filters.propertyTypes.includes(typeName)
      ? filters.propertyTypes.filter(t => t !== typeName)
      : [...filters.propertyTypes, typeName];
    
    updateFilter('propertyTypes', newTypes);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-black">Property Type</h3>
      
      <div className="space-y-2">
        {propertyTypes.map((type) => (
          <label
            key={type.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              checked={filters.propertyTypes.includes(type.name)}
              onChange={() => handleToggle(type.name)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-black font-medium">{type.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
