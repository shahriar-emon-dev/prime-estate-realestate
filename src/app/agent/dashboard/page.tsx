// src/app/agent/dashboard/page.tsx
// Agent dashboard for managing client interactions and properties

'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaHome, FaCalendar, FaChartBar } from 'react-icons/fa';

interface AgentStats {
  totalClients: number;
  activeListings: number;
  upcomingMeetings: number;
  closedDeals: number;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats>({
    totalClients: 0,
    activeListings: 0,
    upcomingMeetings: 0,
    closedDeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load agent-specific stats
    // TODO: Implement agent stats API endpoint
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Manage your clients, properties, and real estate portfolio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeListings}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaHome className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Upcoming Meetings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingMeetings}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaCalendar className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Closed Deals */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Closed Deals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.closedDeals}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaChartBar className="text-purple-600 text-2xl" />
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
