'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAreasList, createArea, deleteArea, getAllCities } from '@/lib/dataService';

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArea, setNewArea] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: areasData } = await getAreasList();
      const { data: citiesData } = await getAllCities();
      
      if (areasData) {
        const formattedAreas = areasData.map((area: any) => ({
          ...area,
          // area.city is already the city name (string) from getAreasList mapping
          cityName: area.city || 'Unknown',
          properties: 0 // Placeholder for aggregate
        }));
        setAreas(formattedAreas);
      }
      
      if (citiesData) {
        setCities(citiesData);
        if (citiesData.length > 0 && !selectedCityId) {
          setSelectedCityId(citiesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'name', label: 'Area Name' },
    { key: 'cityName', label: 'City' },
    { key: 'properties', label: 'Properties' },
  ];

  const handleAddArea = async () => {
    if (newArea.trim() && selectedCityId) {
      try {
        await createArea(newArea.trim(), selectedCityId);
        setNewArea('');
        fetchData();
        alert(`Area "${newArea}" added successfully!`);
      } catch (error) {
        console.error('Error adding area:', error);
        alert('Failed to add area');
      }
    }
  };

  const handleEdit = (area: { id: string; name: string }) => {
    alert(`Editing: ${area.name}`);
  };

  const handleDelete = async (area: { id: string; name: string }) => {
    if (confirm(`Delete ${area.name}?`)) {
      try {
        await deleteArea(area.id);
        fetchData();
        alert('Deleted successfully');
      } catch (error) {
        console.error('Error deleting area:', error);
        alert('Failed to delete area');
      }
    }
  };

  const actions = [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete, color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Areas</h1>
        <p className="text-gray-600 mt-1">Manage all areas by city</p>
      </div>

      {/* Add Area Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Area</h2>
        <div className="flex gap-2">
          <select
            aria-label="Select city"
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="" disabled>Select City</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Enter area name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            onClick={handleAddArea}
            disabled={loading || !selectedCityId}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Area'}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && areas.length === 0 ? (
        <div className="text-center py-8">Loading areas...</div>
      ) : (
        <Table columns={columns} data={areas} actions={actions} />
      )}
    </div>
  );
}
