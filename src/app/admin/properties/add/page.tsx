'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

import { getAllAgents, getAllCities, getAreasList, getAllPropertyTypes } from '@/lib/dataService';

// Status options - these are fixed application constants
const STATUS_OPTIONS = [
  { value: 'Available', label: 'Available' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Rented', label: 'Rented' },
];

function AddPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  
  // Master Data state
  const [agents, setAgents] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  
  // Unified image state
  type ImageItem = {
    id: string;
    url: string;
    file?: File;
    isExisting: boolean;
  };
  
  const [images, setImages] = useState<ImageItem[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceNumeric: '',
    priceDisplay: '',
    city: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    type: '',
    status: 'Available',
    features: '',
    agentId: '',
  });

  // Fetch all master data on mount
  useEffect(() => {
    async function loadMasterData() {
      setMasterDataLoading(true);
      try {
        const [agentsRes, citiesRes, areasRes, typesRes] = await Promise.all([
          getAllAgents(),
          getAllCities(),
          getAreasList(),
          getAllPropertyTypes(),
        ]);
        
        if (agentsRes.data) setAgents(agentsRes.data);
        if (citiesRes.data) setCities(citiesRes.data);
        if (areasRes.data) setAreas(areasRes.data);
        if (typesRes.data) setPropertyTypes(typesRes.data);
      } catch (error) {
        console.error('Error loading master data:', error);
      } finally {
        setMasterDataLoading(false);
      }
    }
    loadMasterData();
  }, []);

  // Filter areas based on selected city
  const filteredAreas = formData.city 
    ? areas.filter(area => area.city === formData.city || area.cityId === formData.city)
    : areas;

  // Fetch existing data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProperty = async () => {
        setFetching(true);
        try {
          const res = await fetch(`/api/properties/${editId}`);
          if (!res.ok) throw new Error('Failed to fetch property');
          const { property } = await res.json();

          setFormData({
            title: property.title,
            description: property.description || '',
            priceNumeric: property.price_numeric?.toString() || '',
            priceDisplay: property.price,
            city: property.city,
            area: property.area,
            bedrooms: property.bedrooms?.toString() || '0',
            bathrooms: property.bathrooms?.toString() || '0',
            squareFeet: property.square_feet?.toString() || '0',
            type: property.property_type,
            status: property.status || 'Available',
            features: property.features?.join(', ') || '',
            agentId: property.agent_id || '',
          });

          // Populate existing images
          if (property.images && Array.isArray(property.images)) {
            const existing = property.images.map((img: any) => ({
              id: img.image_url,
              url: img.image_url,
              isExisting: true
            }));
            setImages(existing);
          }
        } catch (err) {
          console.error(err);
          alert('Error loading property data');
          router.push('/admin/properties');
        } finally {
          setFetching(false);
        }
      };
      
      fetchProperty();
    }
  }, [editId, isEditMode, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Reset area when city changes
      if (name === 'city') {
        updated.area = '';
      }
      return updated;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newItems = newFiles.map(file => ({
        id: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
        file,
        isExisting: false
      }));
      setImages(prev => [...prev, ...newItems]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const item = newImages[index];
      if (!item.isExisting) {
        URL.revokeObjectURL(item.url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.priceDisplay || `৳${formData.priceNumeric}`);
      submitData.append('priceNumeric', formData.priceNumeric);
      submitData.append('city', formData.city);
      submitData.append('area', formData.area);
      submitData.append('bedrooms', formData.bedrooms);
      submitData.append('bathrooms', formData.bathrooms);
      submitData.append('squareFeet', formData.squareFeet);
      submitData.append('propertyType', formData.type);
      submitData.append('status', formData.status);
      submitData.append('features', formData.features);
      submitData.append('agentId', formData.agentId);

      // Separate existing vs new images
      images.forEach(img => {
        if (img.isExisting) {
          submitData.append('keptImages', img.url);
        } else if (img.file) {
          submitData.append('newImages', img.file);
          submitData.append('images', img.file); 
        }
      });

      const url = isEditMode ? `/api/properties/${editId}` : '/api/properties';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} property`);
      }

      alert(`Property ${isEditMode ? 'updated' : 'added'} successfully!`);
      router.push('/admin/properties');
      router.refresh(); 
    } catch (error) {
      console.error('Error submitting property:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching || masterDataLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading {fetching ? 'property data' : 'form options'}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-gray-600 mt-1">{isEditMode ? 'Update existing property details' : 'Create a new property listing with images'}</p>
        </div>
        <Link href="/admin/properties" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Properties
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Luxury Apartment in Gulshan"
              />
            </div>
            
            {/* Agent Selection */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Agent</label>
              <select
                name="agentId"
                value={formData.agentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">No Agent Assigned</option>
                {agents.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (Numeric) *</label>
              <input
                type="number"
                name="priceNumeric"
                value={formData.priceNumeric}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., 25000000"
              />
              <p className="text-xs text-gray-500 mt-1">Used for filtering/sorting</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Price</label>
              <input
                type="text"
                name="priceDisplay"
                value={formData.priceDisplay}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., ৳2.5 Crore"
              />
            </div>
          </div>
        </div>

        {/* Location & Type */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Location & Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* City - Dynamic from Database */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select City</option>
                {cities.map((city: any) => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              {cities.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">No cities found. Add cities in Master Data.</p>
              )}
            </div>
            
            {/* Area - Dynamic based on selected city */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area / Location *</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={!formData.city}
              >
                <option value="">{formData.city ? 'Select Area' : 'Select City First'}</option>
                {filteredAreas.map((area: any) => (
                  <option key={area.id} value={area.name}>{area.name}</option>
                ))}
              </select>
              {formData.city && filteredAreas.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">No areas found for this city. Add areas in Master Data.</p>
              )}
            </div>
            
            {/* Property Type - Dynamic from Database */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select Type</option>
                {propertyTypes.map((type: any) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
              {propertyTypes.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">No property types found. Add types in Master Data.</p>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms *</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size (Sq Ft) *</label>
              <input
                type="number"
                name="squareFeet"
                value={formData.squareFeet}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description & Features */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Description & Features</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Describe the property..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma separated)</label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Swimming Pool, Gym, Parking, Security, Garden"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Property Images</h2>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Click to upload images</p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[4/3]">
                  <img 
                    src={img.url} 
                    alt={`Preview ${idx}`} 
                    className="w-full h-full object-cover" 
                  />
                  {!img.isExisting && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">New</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Property' : 'Create Property')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/properties')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium border border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddPropertyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <AddPropertyContent />
    </Suspense>
  );
}
