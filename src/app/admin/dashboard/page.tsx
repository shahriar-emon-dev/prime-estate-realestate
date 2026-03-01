'use client';

import StatCard from '@/components/admin/dashboard/StatCard';
import MeetingOverview from '@/components/admin/dashboard/MeetingOverview';
import SiteVisitOverview from '@/components/admin/dashboard/SiteVisitOverview';
import { FaHome, FaCalendar, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/dataService';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
      {
        title: 'Total Properties',
        value: 0,
        change: 'Real-time',
        trend: 'up' as const,
        icon: <FaHome />,
        bgColor: 'bg-blue-600',
      },
      {
        title: 'Pending Requests',
        value: 0,
        change: 'New',
        trend: 'up' as const,
        icon: <FaCalendar />,
        bgColor: 'bg-orange-600',
      },
      {
        title: 'Property Types',
        value: 0,
        change: 'Active',
        trend: 'up' as const,
        icon: <FaUsers />,
        bgColor: 'bg-green-600',
      },
      {
        title: 'Available Properties',
        value: 0,
        change: 'Live',
        trend: 'up' as const,
        icon: <FaCheckCircle />,
        bgColor: 'bg-purple-600',
      },
    ]);
  
    useEffect(() => {
      async function loadDashboardStats() {
        try {
          const { data } = await getDashboardStats();

          setStats(prev => {
            const newStats = [...prev];
            newStats[0].value = data.totalProperties;
            newStats[1].value = data.pendingRequests;
            newStats[2].value = data.propertyTypes;
            newStats[3].value = data.availableProperties;
            return newStats;
          });
        } catch {
          setStats(prev => prev.map((item) => ({ ...item, value: 0 })));
        }
      }
      loadDashboardStats();
    }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Welcome back! Here&apos;s your admin overview.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeetingOverview />
        <SiteVisitOverview />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/properties/add"
            className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium text-blue-600 hover:text-blue-700"
          >
            Add New Property
          </a>
          <a
            href="/favorites"
            className="p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors text-center font-medium text-green-600 hover:text-green-700"
          >
            View Favorites
          </a>
          <a
            href="/admin/properties"
            className="p-4 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-center font-medium text-orange-600 hover:text-orange-700"
          >
            All Properties
          </a>
          <a
            href="/contact"
            className="p-4 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-center font-medium text-purple-600 hover:text-purple-700"
          >
            Messages
          </a>
        </div>
      </div>
    </div>
  );
}
