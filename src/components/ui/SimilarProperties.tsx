'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProperties } from '@/lib/dataService';
import { Property } from '@/lib/types';
import { FaBed, FaBath, FaRuler } from 'react-icons/fa';

interface SimilarPropertiesProps {
  currentPropertyId: string;
  propertyType?: string;
}

export default function SimilarProperties({ currentPropertyId, propertyType }: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSimilar() {
      try {
        // In a real app, we might want to filter by propertyType closely
        // For now, we fetch latest properties and exclude the current one
        const filter = propertyType ? { 
            propertyTypes: [propertyType],
            status: ['Available'],
            priceMin: null, priceMax: null, cities: [], areas: [], bedrooms: null, bathrooms: null, squareFeetMin: null, squareFeetMax: null, searchQuery: ''
        } : undefined;

        const { data } = await getAllProperties(filter, 'created_at', 'desc', 8);
        
        if (data) {
          const filtered = data
            .filter(p => p.id !== currentPropertyId)
            .slice(0, 4);
          setProperties(filtered);
        }
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadSimilar();
  }, [currentPropertyId, propertyType]);

  if (loading) return null; // Or a skeleton
  if (properties.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Similar Properties</h2>
        <p className="text-gray-600 mt-2">Check out other properties you might be interested in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/properties/${property.id}`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative h-40 bg-gray-200 overflow-hidden">
              <Image
                src={property.images?.[0] || 'https://placehold.co/400x300/e2e8f0/64748b?text=Property'}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                {property.propertyType}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {property.title}
              </h3>

              <p className="text-xl font-bold text-blue-600 mt-2">{property.price}</p>

              <p className="text-sm text-gray-600 mt-1 truncate">
                {property.area}, {property.city}
              </p>

              {/* Property Meta */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaBed /> {property.bedrooms} bed
                </span>
                <span className="flex items-center gap-1">
                  <FaBath /> {property.bathrooms} bath
                </span>
                <span className="flex items-center gap-1">
                  <FaRuler /> {property.squareFeet.toLocaleString()} sqft
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  View Details →
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
