'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAllMeetingRequests, updateRequestStatus } from '@/lib/dataService';
import { MeetingRequest } from '@/lib/types';

export default function MeetingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const fetchRequests = async () => {
    // ... existing fetchRequests code ...
    setLoading(true);
    const { data, error } = await getAllMeetingRequests();
    if (data) {
      // Map data to match table columns or desired structure
      const formattedData = data.map((item: any) => ({
        ...item,
        propertyTitle: item.property?.title || 'Unknown Property', // Flatten nested property
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

  // ... existing handlers (handleApprove, handleReject, etc) ...
  const handleApprove = async (request: any) => {
    try {
        await updateRequestStatus('meeting', request.id, 'Scheduled');
        alert(`Approved meeting for ${request.clientName}`);
        fetchRequests(); // Refresh data
    } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status");
    }
  };

  const handleReject = async (request: any) => {
    if (confirm(`Reject meeting request from ${request.clientName}?`)) {
      try {
          await updateRequestStatus('meeting', request.id, 'Cancelled');
          alert('Meeting request rejected');
          fetchRequests(); // Refresh data
      } catch (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status");
      }
    }
  };


  const handleComplete = async (request: any) => {
    if (confirm(`Mark meeting with ${request.clientName} as completed?`)) {
      try {
          await updateRequestStatus('meeting', request.id, 'Completed');
          fetchRequests(); // Refresh data
      } catch (error) {
          console.error("Error updating status:", error);
          alert("Failed to update status");
      }
    }
  };

  // Only show relevant actions based on tab
  const activeActions = [
    { label: 'Approve', onClick: handleApprove },
    { label: 'Complete', onClick: handleComplete, color: 'success' },
    { label: 'Reject', onClick: handleReject, color: 'danger' },
  ];
  
  const historyActions = [
     // Maybe allow moving back to active? For now, no actions for history or maybe just Delete if we implemented it
     // sticking to active actions for flexibility, or maybe just 'Approve' to re-schedule?
     { label: 'Re-open', onClick: handleApprove }, 
  ];

  const actions = activeTab === 'active' ? activeActions : historyActions;

  if (loading) {
      return <div className="p-6">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meeting Requests</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and respond to meeting requests from clients</p>
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
            {requests.filter(r => r.status === 'Scheduled' || r.status === 'New').length}
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
