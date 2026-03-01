'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage your real estate platform efficiently</p>
        </div>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← Back to Homepage
        </Link>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a
          href="/admin/dashboard"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:border-blue-600 border-2 border-transparent"
        >
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold text-gray-900 mb-1">Dashboard</h3>
          <p className="text-sm text-gray-600">View overview and statistics</p>
        </a>

        <a
          href="/admin/properties"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:border-blue-600 border-2 border-transparent"
        >
          <div className="text-3xl mb-2">🏠</div>
          <h3 className="font-bold text-gray-900 mb-1">Properties</h3>
          <p className="text-sm text-gray-600">Manage all properties</p>
        </a>

        <a
          href="/admin/master-data/cities"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:border-blue-600 border-2 border-transparent"
        >
          <div className="text-3xl mb-2">⚙️</div>
          <h3 className="font-bold text-gray-900 mb-1">Master Data</h3>
          <p className="text-sm text-gray-600">Manage system data</p>
        </a>

        <a
          href="/admin/requests/meeting-requests"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow hover:border-blue-600 border-2 border-transparent"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-bold text-gray-900 mb-1">Requests</h3>
          <p className="text-sm text-gray-600">View user requests</p>
        </a>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Properties</p>
              <p className="text-sm text-gray-600">Start by adding new property listings to the system</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Master Data</p>
              <p className="text-sm text-gray-600">Configure cities, areas, projects, and property types</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Handle Requests</p>
              <p className="text-sm text-gray-600">Respond to meeting and site visit requests from clients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
