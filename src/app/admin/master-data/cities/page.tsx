'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAllCities, createCity, deleteCity } from '@/lib/dataService';

export default function CitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState('');

  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data } = await getAllCities();
      if (data) {
        // Map data to match expected columns
        const formattedData = data.map(city => ({
          ...city,
          properties: 0, // In a real app, these would be aggregates
          users: 0
        }));
        setCities(formattedData);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const columns = [
    { key: 'name', label: 'City Name' },
    { key: 'properties', label: 'Properties' },
    { key: 'users', label: 'Active Users' },
  ];

  const handleAddCity = async () => {
    if (newCity.trim()) {
      try {
        await createCity(newCity.trim());
        setNewCity('');
        fetchCities();
        alert(`City "${newCity}" added successfully!`);
      } catch (error) {
        console.error('Error adding city:', error);
        alert('Failed to add city');
      }
    }
  };

  const handleEdit = (city: { id: string; name: string }) => {
    // Implement edit logic if needed, for now just a placeholder
    alert(`Editing: ${city.name}`);
  };

  const handleDelete = async (city: { id: string; name: string }) => {
    if (confirm(`Delete ${city.name}? This might affect properties in this city.`)) {
      try {
        await deleteCity(city.id);
        fetchCities();
        alert('Deleted successfully');
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Failed to delete city. It may have associated areas.');
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
        <h1 className="text-3xl font-bold text-gray-900">Cities</h1>
        <p className="text-gray-600 mt-1">Manage all cities in the system</p>
      </div>

      {/* Add City Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New City</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Enter city name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            onClick={handleAddCity}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add City'}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && cities.length === 0 ? (
        <div className="text-center py-8">Loading cities...</div>
      ) : (
        <Table columns={columns} data={cities} actions={actions} />
      )}
    </div>
  );
}
