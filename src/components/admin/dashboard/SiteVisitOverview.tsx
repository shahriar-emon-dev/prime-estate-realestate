'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { getAllSiteVisitRequests } from '@/lib/dataService';

export default function SiteVisitOverview() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true);
      const { data } = await getAllSiteVisitRequests();
      if (data) {
        setVisits(data.map(v => ({
          id: v.id,
          propertyTitle: v.propertyTitle || 'Unknown Property',
          clientName: v.buyerName,
          date: v.preferredDate,
          time: v.preferredTime,
          status: v.status?.toLowerCase() || 'pending'
        })));
      }
      setLoading(false);
    }
    fetchVisits();
  }, []);

  if (loading && visits.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Site Visit Requests</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Site Visit Requests</h3>
      <div className="space-y-4">
        {visits.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent site visits</p>
        ) : (
          visits.slice(0, 3).map((visit) => (
            <div key={visit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{visit.propertyTitle}</p>
                <p className="text-sm text-gray-600">{visit.clientName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {visit.date} at {visit.time}
                </p>
              </div>
              <div>
                {(visit.status === 'scheduled' || visit.status === 'new' || visit.status === 'pending') ? (
                  <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                    <FaClock /> {(visit.status === 'new' || visit.status === 'pending') ? 'New' : 'Scheduled'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <FaCheckCircle /> Done
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
