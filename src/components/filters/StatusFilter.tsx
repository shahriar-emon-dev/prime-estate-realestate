'use client';

import { useFilters } from '@/contexts/FilterContext';

const STATUS_OPTIONS = [
  { value: 'Available', label: 'Available', color: 'green' },
  { value: 'Sold', label: 'Sold', color: 'red' },
  { value: 'Pending', label: 'Pending', color: 'yellow' },
  { value: 'Rented', label: 'Rented', color: 'blue' },
];

export default function StatusFilter() {
  const { filters, updateFilter } = useFilters();

  const handleToggle = (statusValue: string) => {
    const newStatus = filters.status.includes(statusValue)
      ? filters.status.filter(s => s !== statusValue)
      : [...filters.status, statusValue];
    
    // If no status selected, default back to Available
    if (newStatus.length === 0) {
      updateFilter('status', ['Available']);
    } else {
      updateFilter('status', newStatus);
    }
  };

  const handleSelectAll = () => {
    updateFilter('status', STATUS_OPTIONS.map(s => s.value));
  };

  const handleSelectAvailable = () => {
    updateFilter('status', ['Available']);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Status</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAvailable}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Available Only
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Show All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = filters.status.includes(option.value);
          
          let bgClass = 'bg-gray-100 border-gray-300 text-gray-700';
          if (isSelected) {
            switch (option.color) {
              case 'green':
                bgClass = 'bg-green-100 border-green-500 text-green-700';
                break;
              case 'red':
                bgClass = 'bg-red-100 border-red-500 text-red-700';
                break;
              case 'yellow':
                bgClass = 'bg-yellow-100 border-yellow-500 text-yellow-700';
                break;
              case 'blue':
                bgClass = 'bg-blue-100 border-blue-500 text-blue-700';
                break;
            }
          }
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={`px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm ${bgClass} ${
                isSelected ? '' : 'hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500">
        {filters.status.length === 1 && filters.status[0] === 'Available' 
          ? 'Showing available properties only'
          : `Showing ${filters.status.length} status type${filters.status.length > 1 ? 's' : ''}`
        }
      </p>
    </div>
  );
}
