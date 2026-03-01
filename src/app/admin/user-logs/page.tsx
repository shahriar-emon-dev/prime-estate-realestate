'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

// Type for activity log
interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

// Mock activity data - In production, this would come from a database table
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: 'user-1',
    userEmail: 'admin@primeestate.com',
    userRole: 'admin',
    action: 'LOGIN',
    details: 'Admin logged in successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: '2',
    userId: 'user-2',
    userEmail: 'agent1@primeestate.com',
    userRole: 'seller',
    action: 'ADD_PROPERTY',
    details: 'Added new property: Luxury Apartment in Gulshan',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: '3',
    userId: 'user-1',
    userEmail: 'admin@primeestate.com',
    userRole: 'admin',
    action: 'EDIT_PROPERTY',
    details: 'Updated property: Modern Villa in Banani',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: '4',
    userId: 'user-2',
    userEmail: 'agent1@primeestate.com',
    userRole: 'seller',
    action: 'DELETE_PROPERTY',
    details: 'Deleted property: Old Apartment in Mirpur',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: '5',
    userId: 'user-2',
    userEmail: 'agent1@primeestate.com',
    userRole: 'seller',
    action: 'LOGOUT',
    details: 'Agent logged out',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
];

export default function UserLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    // Simulate loading from database
    setTimeout(() => {
      setLogs(mockActivityLogs);
      setLoading(false);
    }, 500);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <FaSignInAlt className="text-green-500" />;
      case 'LOGOUT':
        return <FaSignOutAlt className="text-orange-500" />;
      case 'ADD_PROPERTY':
        return <FaPlus className="text-blue-500" />;
      case 'EDIT_PROPERTY':
        return <FaEdit className="text-purple-500" />;
      case 'DELETE_PROPERTY':
        return <FaTrash className="text-red-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-orange-100 text-orange-800';
      case 'ADD_PROPERTY':
        return 'bg-blue-100 text-blue-800';
      case 'EDIT_PROPERTY':
        return 'bg-purple-100 text-purple-800';
      case 'DELETE_PROPERTY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-indigo-100 text-indigo-800' 
      : 'bg-teal-100 text-teal-800';
  };

  const filteredLogs = filterAction === 'ALL' 
    ? logs 
    : logs.filter(log => log.action === filterAction);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Activity Logs</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track admin and agent login, logout, and property actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row flex-wrap gap-4">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full sm:w-auto"
        >
          <option value="ALL">All Actions</option>
          <option value="LOGIN">Logins</option>
          <option value="LOGOUT">Logouts</option>
          <option value="ADD_PROPERTY">Add Property</option>
          <option value="EDIT_PROPERTY">Edit Property</option>
          <option value="DELETE_PROPERTY">Delete Property</option>
        </select>
        
        <p className="flex items-center text-gray-600 text-sm sm:text-base">
          Showing <span className="font-bold text-gray-900 mx-1">{filteredLogs.length}</span> activity logs
        </p>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">{log.userEmail}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(log.userRole)}`}>
                    {log.userRole === 'seller' ? 'Agent' : log.userRole}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 max-w-md truncate">{log.details}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">{timeAgo(log.timestamp)}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activity logs found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> This page currently displays sample activity data. 
          To enable real activity logging, create an <code className="bg-blue-100 px-1 rounded">activity_logs</code> table 
          in your database and log actions from the auth and property services.
        </p>
      </div>
    </div>
  );
}
