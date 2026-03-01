'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProperties } from '@/lib/dataService';
import { Property } from '@/lib/types';
import { FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const RecentSales = () => {
  const [soldProperties, setSoldProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSoldProperties() {
      try {
        // Fetch sold/rented properties
        const { data } = await getAllProperties(
          { 
            status: ['Sold', 'Rented'],
            priceMin: null,
            priceMax: null,
            cities: [],
            areas: [],
            propertyTypes: [],
            squareFeetMin: null,
            squareFeetMax: null,
            bedrooms: null,
            bathrooms: null,
            searchQuery: ''
          },
          'createdAt',
          'desc',
          3
        );
        if (data) {
          setSoldProperties(data as Property[]);
        }
      } catch {
        setSoldProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadSoldProperties();
  }, []);

  // Don't show section if loading or no sold properties
  if (loading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Recent Sales
            </h2>
            <p className="mt-4 text-lg text-gray-500">Loading sold properties...</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Hide section completely if no sold properties
  if (soldProperties.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Recent Sales
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Explore our recently sold properties in Bangladesh
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {soldProperties.map((property) => (
            <div 
              key={property.id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={property.images[0] || 'https://placehold.co/600x400?text=No+Image'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium z-10 flex items-center gap-1 ${
                  property.status === 'Sold' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                }`}>
                  <FaCheckCircle className="text-xs" />
                  {property.status}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                <div className="mt-2 flex items-center gap-1 text-gray-500">
                  <FaMapMarkerAlt className="text-green-600 text-sm" />
                  <span>{property.area}, {property.city}</span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">{property.price}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{property.propertyType}</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/properties/${property.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {soldProperties.length >= 3 && (
          <div className="mt-12 text-center">
            <Link
              href="/properties?status=Sold&status=Rented"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              View All Completed Sales
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSales;