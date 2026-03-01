'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { getAllCities, getAreasList } from '@/lib/dataService';
import { City, Area } from '@/lib/types';
import { FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function LocationFilter() {
  const { filters, updateFilter } = useFilters();
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);

  useEffect(() => {
    loadMasterData();
  }, []);

  async function loadMasterData() {
    const [citiesResult, areasResult] = await Promise.all([
      getAllCities(),
      getAreasList(),
    ]);

    if (citiesResult.data) setCities(citiesResult.data);
    if (areasResult.data) setAreas(areasResult.data);
  }

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    return cities.filter(city =>
      city.name.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [cities, citySearch]);

  // Filter areas based on selected cities and search
  const filteredAreas = useMemo(() => {
    let result = areas;
    
    // Filter by selected cities
    if (filters.cities.length > 0) {
      result = result.filter(area =>
        filters.cities.includes(area.city || area.cityId)
      );
    }
    
    // Filter by search
    if (areaSearch) {
      result = result.filter(area =>
        area.name.toLowerCase().includes(areaSearch.toLowerCase())
      );
    }
    
    return result;
  }, [areas, filters.cities, areaSearch]);

  // Limit displayed items
  const displayedCities = showAllCities ? filteredCities : filteredCities.slice(0, 5);
  const displayedAreas = showAllAreas ? filteredAreas : filteredAreas.slice(0, 8);

  const handleCityToggle = (cityName: string) => {
    const newCities = filters.cities.includes(cityName)
      ? filters.cities.filter(c => c !== cityName)
      : [...filters.cities, cityName];
    
    updateFilter('cities', newCities);
    
    // Clear areas that don't belong to selected cities
    if (newCities.length > 0) {
      const validAreas = filters.areas.filter(area => {
        const areaObj = areas.find(a => a.name === area);
        return areaObj && newCities.includes(areaObj.city || areaObj.cityId);
      });
      updateFilter('areas', validAreas);
    }
  };

  const handleAreaToggle = (areaName: string) => {
    const newAreas = filters.areas.includes(areaName)
      ? filters.areas.filter(a => a !== areaName)
      : [...filters.areas, areaName];
    
    updateFilter('areas', newAreas);
  };

  return (
    <div className="space-y-6">
      {/* Cities */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">City</h3>
        
        {/* City Search */}
        {cities.length > 5 && (
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search cities..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
        )}
        
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {displayedCities.map((city) => (
            <label
              key={city.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={filters.cities.includes(city.name)}
                onChange={() => handleCityToggle(city.name)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-900 font-medium">{city.name}</span>
            </label>
          ))}
        </div>
        
        {/* Show More/Less for Cities */}
        {filteredCities.length > 5 && (
          <button
            onClick={() => setShowAllCities(!showAllCities)}
            className="w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAllCities ? (
              <>
                <FaChevronUp className="text-xs" />
                Show Less
              </>
            ) : (
              <>
                <FaChevronDown className="text-xs" />
                Show {filteredCities.length - 5} More
              </>
            )}
          </button>
        )}
      </div>

      {/* Areas */}
      {filteredAreas.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Area</h3>
          
          {/* Area Search */}
          {filteredAreas.length > 8 && (
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search areas..."
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>
          )}
          
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {displayedAreas.map((area) => (
              <label
                key={area.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  checked={filters.areas.includes(area.name)}
                  onChange={() => handleAreaToggle(area.name)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-900">{area.name}</span>
              </label>
            ))}
          </div>
          
          {/* Show More/Less for Areas */}
          {filteredAreas.length > 8 && (
            <button
              onClick={() => setShowAllAreas(!showAllAreas)}
              className="w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showAllAreas ? (
                <>
                  <FaChevronUp className="text-xs" />
                  Show Less
                </>
              ) : (
                <>
                  <FaChevronDown className="text-xs" />
                  Show {filteredAreas.length - 8} More
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
