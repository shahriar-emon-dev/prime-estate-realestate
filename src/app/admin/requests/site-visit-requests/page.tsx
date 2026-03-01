'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAllSiteVisitRequests, updateRequestStatus } from '@/lib/dataService';

export default function SiteVisitRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await getAllSiteVisitRequests();
    if (data) {
       // Map data to match table columns or desired structure
       const formattedData = data.map((item: any) => ({
        ...item,
        propertyTitle: item.property?.title || 'Unknown Property',
        clientName: item.buyer_name,
        email: item.buyer_email,
        phone: item.buyer_phone,
        date: item.preferred_date,
        time: item.preferred_time,
      }));
      setRequests(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    const isCompleted = request.status === 'Completed' || request.status === 'Cancelled';
    return activeTab === 'active' ? !isCompleted : isCompleted;
  });

  const columns = [
    { key: 'propertyTitle', label: 'Property', width: '25%' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'email', label: 'Email' },
    { key: 'date', label: 'Requested Date' },
    { key: 'status', label: 'Status' },
  ];

  const handleSchedule = async (request: any) => {
    try {
        await updateRequestStatus('site_visit', request.id, 'Scheduled');
        alert(`Site visit scheduled for ${request.clientName}`);
        fetchRequests();
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status");
    }
  };

  const handleCancel = async (request: any) => {
    if (confirm(`Cancel site visit request from ${request.clientName}?`)) {
      try {
          await updateRequestStatus('site_visit', request.id, 'Cancelled');
          alert('Site visit request cancelled');
          fetchRequests();
      } catch (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status");
      }
    }
  };

  const handleComplete = async (request: any) => {
    if (confirm(`Mark site visit for ${request.clientName} as completed?`)) {
      try {
          await updateRequestStatus('site_visit', request.id, 'Completed');
          fetchRequests();
      } catch (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status");
      }
    }
  };

  const activeActions = [
    { label: 'Schedule', onClick: handleSchedule },
    { label: 'Complete', onClick: handleComplete, color: 'success' },
    { label: 'Cancel', onClick: handleCancel, color: 'danger' },
  ];

  const historyActions = [
      { label: 'Re-Schedule', onClick: handleSchedule },
  ];

  const actions = activeTab === 'active' ? activeActions : historyActions;

  if (loading) {
      return <div className="p-6">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Site Visit Requests</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and schedule site visit requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <p className="text-gray-600 font-medium text-sm sm:text-base">Total Requests</p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 mt-2">{requests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <p className="text-gray-600 font-medium text-sm sm:text-base">New & Scheduled</p>
          <p className="text-3xl sm:text-4xl font-bold text-orange-600 mt-2">
            {requests.filter(r => r.status === 'Pending' || r.status === 'New' || r.status === 'Scheduled').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <p className="text-gray-600 font-medium text-sm sm:text-base">Completed</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-2">
            {requests.filter(r => r.status === 'Completed').length}
          </p>
        </div>
      </div>

       {/* Tabs */}
       <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'active' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Requests
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'completed' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          History
        </button>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredRequests} actions={actions} />
    </div>
  );
}
