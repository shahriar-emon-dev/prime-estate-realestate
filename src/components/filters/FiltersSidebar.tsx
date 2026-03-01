'use client';

interface FiltersSidebarProps {
  children: React.ReactNode;
  resultCount: number;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export default function FiltersSidebar({
  children,
  resultCount,
  activeFilterCount,
  onClearFilters,
}: FiltersSidebarProps) {
  return (
    <aside className="hidden lg:block lg:w-80 flex-shrink-0">
      <div className="sticky top-20 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-lg font-bold text-gray-900">
            Filter Properties
            {activeFilterCount > 0 && (
              <span className="ml-2 text-sm text-blue-600">({activeFilterCount})</span>
            )}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div 
          className="overflow-y-auto p-6 space-y-8"
          style={{ maxHeight: 'calc(100vh - 12rem)' }}
        >
          {children}

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Result Count */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{resultCount}</span>{' '}
              {resultCount === 1 ? 'property' : 'properties'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
