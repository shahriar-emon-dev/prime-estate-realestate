'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
  showEditButton?: boolean; // Only show for admin context
}

export default function PropertyCard({ property, showEditButton = false }: PropertyCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/admin/properties/add?id=${property.id}`;
  };

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300 hover:-translate-y-1 block"
    >
      {/* Property Image */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        <Image
          src={property.images?.[0] || 'https://placehold.co/400x300/e2e8f0/64748b?text=Property'}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Property';
          }}
        />
        {/* Property Type Badge - Top Left */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.propertyType}
        </div>
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
          {property.status}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 space-y-3">
        {/* Title and Location Row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-blue-600 text-xs flex-shrink-0" />
              <span className="truncate">{property.area}, {property.city}</span>
            </div>
          </div>
          
          {/* Admin Edit Button - Positioned in content area, not on image */}
          {showEditButton && (
            <button
              onClick={handleEdit}
              className="flex-shrink-0 bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white p-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="Edit Property"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-blue-600">
          {property.price}
        </div>

        {/* Property Meta */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-700">
            <FaBed className="text-blue-600" />
            <span className="text-sm font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <FaBath className="text-blue-600" />
            <span className="text-sm font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <FaRuler className="text-blue-600" />
            <span className="text-sm font-medium">{property.squareFeet?.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
