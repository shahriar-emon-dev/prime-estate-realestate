'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { getAllMeetingRequests } from '@/lib/dataService';

export default function MeetingOverview() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      const { data } = await getAllMeetingRequests();
      if (data) {
        setMeetings(data.map(m => ({
          id: m.id,
          propertyTitle: m.propertyTitle || 'Unknown Property',
          clientName: m.buyerName,
          date: m.preferredDate,
          time: m.preferredTime,
          status: m.status?.toLowerCase() || 'pending'
        })));
      }
      setLoading(false);
    }
    fetchMeetings();
  }, []);

  if (loading && meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Meetings</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Meetings</h3>
      <div className="space-y-4">
        {meetings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent meetings</p>
        ) : (
          meetings.slice(0, 3).map((meeting) => (
            <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{meeting.propertyTitle}</p>
                <p className="text-sm text-gray-600">{meeting.clientName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {meeting.date} at {meeting.time}
                </p>
              </div>
              <div>
                {(meeting.status === 'scheduled' || meeting.status === 'new' || meeting.status === 'pending') ? (
                  <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                    <FaClock /> {(meeting.status === 'new' || meeting.status === 'pending') ? 'New' : 'Scheduled'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <FaCheckCircle /> Completed
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
