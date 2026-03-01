'use client';

import { useState, useEffect } from 'react';
import { getAllMeetingRequests, getAllSiteVisitRequests, updateRequestStatus } from '@/lib/dataService';
import { MeetingRequest, SiteVisitRequest } from '@/lib/types';
import { FaCalendarAlt, FaEye, FaCheck, FaTimes, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function RequestsPage() {
  type RequestType = 'meeting' | 'site_visit';
  const [activeTab, setActiveTab] = useState<RequestType>('meeting');
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    const m = await getAllMeetingRequests();
    const s = await getAllSiteVisitRequests();
    
    // Map data to types if needed (Supabase returns loosely typed)
    if (m.data) setMeetings(m.data as any[]);
    if (s.data) setSiteVisits(s.data as any[]);
    setLoading(false);
  }

  const handleStatusUpdate = async (type: RequestType, id: string, newStatus: string) => {
    try {
      await updateRequestStatus(type, id, newStatus);
      loadRequests(); // Refresh
    } catch (err) {
      alert('Error updating status');
    }
  };

  const RequestCard = ({ item, type }: { item: any, type: RequestType }) => (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{item.property?.title || 'Unknown Property'}</h3>
          <p className="text-sm text-gray-500">Requested on {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          item.status === 'New' ? 'bg-blue-100 text-blue-800' :
          item.status === 'Completed' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <FaCalendarAlt className="text-blue-500" />
          <span>{item.preferred_date} at {item.preferred_time}</span>
        </div>
        {type === 'site_visit' && (
          <div className="flex items-center gap-2 text-gray-700">
            <FaEye className="text-blue-500" />
            <span>{item.attendees} Attendees</span>
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 italic">
          "{item.message || 'No additional message'}"
        </div>
      </div>

      <div className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm">
          <p className="font-semibold">{item.buyer_name}</p>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
             <a href={`mailto:${item.buyer_email}`} className="hover:text-blue-600"><FaEnvelope /></a>
             <a href={`tel:${item.buyer_phone}`} className="hover:text-blue-600"><FaPhone /></a>
          </div>
        </div>
        
        <div className="flex gap-2">
          {item.status !== 'Completed' && (
            <button 
              onClick={() => handleStatusUpdate(type, item.id, 'Completed')}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Mark Completed"
            >
              <FaCheck />
            </button>
          )}
          {item.status !== 'Cancelled' && (
            <button 
              onClick={() => handleStatusUpdate(type, item.id, 'Cancelled')}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Cancel"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Requests Inbox</h1>
        <p className="text-gray-600 mt-1">Manage meeting and site visit requests</p>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('meeting')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'meeting' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          }`}
        >
          Meeting Requests <span className="ml-1 bg-gray-200 px-2 py-0.5 rounded-full text-xs">{meetings.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('site_visit')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'site_visit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          }`}
        >
          Site Visits <span className="ml-1 bg-gray-200 px-2 py-0.5 rounded-full text-xs">{siteVisits.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading requests...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {activeTab === 'meeting' ? (
            meetings.length === 0 ? <p className="text-gray-500 pl-2">No meeting requests found.</p> :
            meetings.map(m => <RequestCard key={m.id} item={m} type="meeting" />)
          ) : (
            siteVisits.length === 0 ? <p className="text-gray-500 pl-2">No site visit requests found.</p> :
            siteVisits.map(s => <RequestCard key={s.id} item={s} type="site_visit" />)
          )}
        </div>
      )}
    </div>
  );
}
