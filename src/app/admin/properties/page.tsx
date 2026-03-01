'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Property } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { FaEdit, FaTrash, FaCheckCircle, FaUndo, FaPlus } from 'react-icons/fa';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);
    try {
      // Fetch all properties directly from Supabase (admin view shows all statuses)
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          price_numeric,
          city,
          area,
          bedrooms,
          bathrooms,
          square_feet,
          property_type,
          status,
          description,
          features,
          created_at,
          images:property_images(image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to Property interface
      const mappedData: Property[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        priceNumeric: item.price_numeric,
        city: item.city,
        area: item.area,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        squareFeet: item.square_feet,
        propertyType: item.property_type,
        status: item.status as 'Available' | 'Sold' | 'Pending' | 'Rented',
        description: item.description,
        features: item.features || [],
        agentId: item.agent_id || '',
        createdAt: item.created_at,
        images: item.images?.map((img: any) => img.image_url) || [],
      }));

      setProperties(mappedData);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (property: Property) => {
    router.push(`/admin/properties/add?id=${property.id}`);
  };

  const handleDelete = async (property: Property) => {
    if (confirm(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`)) {
      try {
        // First delete associated images
        await supabase
          .from('property_images')
          .delete()
          .eq('property_id', property.id);
          
        // Then delete the property
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', property.id);
          
        if (error) throw error;
        
        alert('Property deleted successfully');
        loadProperties();
      } catch (err: any) {
        alert('Error deleting property: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (property: Property, newStatus: string) => {
    setUpdatingId(property.id);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', property.id);
        
      if (error) throw error;
      
      // Update local state
      setProperties(prev => 
        prev.map(p => p.id === property.id ? { ...p, status: newStatus as any } : p)
      );
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter properties based on search and status
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.area?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Available': 'bg-green-100 text-green-800 border-green-200',
      'Sold': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Rented': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage all properties in your listing</p>
        </div>
        <Link
          href="/admin/properties/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <FaPlus />
          Add New Property
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title, city, or area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          aria-label="Filter by status"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
          <option value="Pending">Pending</option>
          <option value="Rented">Rented</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Property</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image 
                          src={property.images?.[0] || 'https://placehold.co/100x80/e2e8f0/64748b?text=No+Image'} 
                          alt={property.title}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{property.title}</p>
                        <p className="text-xs text-gray-500">{property.propertyType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <p>{property.area}</p>
                    <p className="text-gray-500">{property.city}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {property.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span>{property.bedrooms} Beds</span>
                    <span className="mx-1">•</span>
                    <span>{property.bathrooms} Baths</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(property)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <FaEdit className="text-xs" />
                        Edit
                      </button>
                      
                      {/* Dynamic Status Toggle Button */}
                      {property.status === 'Available' ? (
                        <button
                          onClick={() => handleStatusChange(property, 'Sold')}
                          disabled={updatingId === property.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                          title="Mark as Sold"
                        >
                          <FaCheckCircle className="text-xs" />
                          {updatingId === property.id ? 'Updating...' : 'Mark Sold'}
                        </button>
                      ) : property.status === 'Sold' ? (
                        <button
                          onClick={() => handleStatusChange(property, 'Available')}
                          disabled={updatingId === property.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                          title="Mark as Available"
                        >
                          <FaUndo className="text-xs" />
                          {updatingId === property.id ? 'Updating...' : 'Relist'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(property, 'Available')}
                          disabled={updatingId === property.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                          title="Mark as Available"
                        >
                          <FaUndo className="text-xs" />
                          {updatingId === property.id ? 'Updating...' : 'Available'}
                        </button>
                      )}
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(property)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProperties.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No properties found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 font-medium text-sm">Total</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{properties.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 font-medium text-sm">Available</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {properties.filter(p => p.status === 'Available').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 font-medium text-sm">Sold</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {properties.filter(p => p.status === 'Sold').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 font-medium text-sm">Pending/Rented</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">
            {properties.filter(p => p.status === 'Pending' || p.status === 'Rented').length}
          </p>
        </div>
      </div>
    </div>
  );
}
