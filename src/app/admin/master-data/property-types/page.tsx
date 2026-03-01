'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAllPropertyTypes, createPropertyType, deletePropertyType } from '@/lib/dataService';

export default function PropertyTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('');

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const { data } = await getAllPropertyTypes();
      if (data) {
        setTypes(data.map(type => ({
          ...type,
          listings: 0, // Placeholder
          popular: 'No' // Placeholder
        })));
      }
    } catch (error) {
      console.error('Error fetching property types:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const columns = [
    { key: 'name', label: 'Property Type' },
    { key: 'listings', label: 'Listings' },
    { key: 'popular', label: 'Popular' },
  ];

  const handleAddType = async () => {
    if (newType.trim()) {
      try {
        await createPropertyType(newType.trim());
        setNewType('');
        fetchTypes();
        alert(`Property type "${newType}" added successfully!`);
      } catch (error) {
        console.error('Error adding type:', error);
        alert('Failed to add property type');
      }
    }
  };

  const handleEdit = (type: { id: string; name: string }) => {
    alert(`Editing: ${type.name}`);
  };

  const handleDelete = async (type: { id: string; name: string }) => {
    if (confirm(`Delete ${type.name}?`)) {
      try {
        await deletePropertyType(type.id);
        fetchTypes();
        alert('Deleted successfully');
      } catch (error) {
        console.error('Error deleting type:', error);
        alert('Failed to delete property type');
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
        <h1 className="text-3xl font-bold text-gray-900">Property Types</h1>
        <p className="text-gray-600 mt-1">Manage property types in the system</p>
      </div>

      {/* Add Type Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Property Type</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Enter property type"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button
            onClick={handleAddType}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Type'}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && types.length === 0 ? (
        <div className="text-center py-8">Loading property types...</div>
      ) : (
        <Table columns={columns} data={types} actions={actions} />
      )}
    </div>
  );
}
