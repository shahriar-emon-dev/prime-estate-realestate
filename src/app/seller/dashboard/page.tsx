// src/app/seller/dashboard/page.tsx
// Seller dashboard for managing properties and requests

'use client';

import { useState, useEffect } from 'react';
import { FaHome, FaEye, FaCheckCircle, FaHeart } from 'react-icons/fa';

interface SellerStats {
  totalListings: number;
  totalViews: number;
  soldProperties: number;
  favoriteCount: number;
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats>({
    totalListings: 0,
    totalViews: 0,
    soldProperties: 0,
    favoriteCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load seller-specific stats
    // TODO: Implement seller stats API endpoint
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Manage your property listings and track performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Listings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Listings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalListings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaHome className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Views</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaEye className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Sold Properties */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sold Properties</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.soldProperties}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaCheckCircle className="text-purple-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Favorited</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.favoriteCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FaHeart className="text-red-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future sections */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">More features coming soon...</p>
      </div>
    </div>
  );
}
