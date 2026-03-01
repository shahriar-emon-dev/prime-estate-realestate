'use client';

import { useState, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import FiltersDrawer from './FiltersDrawer';
import FiltersSidebar from './FiltersSidebar';
import FiltersContent from './FiltersContent';
import { FaFilter } from 'react-icons/fa';

interface PropertyFiltersProps {
  resultCount: number;
}

export default function PropertyFilters({ resultCount }: PropertyFiltersProps) {
  const { 
    filters, 
    updateFilter, 
    clearFilters, 
    activeFilterCount,
    applyDraftFilters,
    setDraftMode,
  } = useFilters();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Enable draft mode when drawer opens, disable when it closes
  useEffect(() => {
    if (setDraftMode) {
      setDraftMode(isDrawerOpen);
    }
  }, [isDrawerOpen, setDraftMode]);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleApply = () => {
    if (applyDraftFilters) {
      applyDraftFilters();
    }
  };

  const handleReset = () => {
    clearFilters();
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={handleOpenDrawer}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-900">
            <FaFilter className="text-blue-600" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <FiltersSidebar
        resultCount={resultCount}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      >
        <FiltersContent
          searchQuery={filters.searchQuery}
          onSearchChange={(value) => updateFilter('searchQuery', value)}
        />
      </FiltersSidebar>

      {/* Mobile Drawer */}
      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onApply={handleApply}
        onReset={handleReset}
        activeFilterCount={activeFilterCount}
      >
        <FiltersContent
          searchQuery={filters.searchQuery}
          onSearchChange={(value) => updateFilter('searchQuery', value)}
        />
      </FiltersDrawer>
    </>
  );
}
