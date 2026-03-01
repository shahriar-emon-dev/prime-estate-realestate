'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAllAgents, createAgent, updateAgent, deleteAgent } from '@/lib/dataService';
import { Agent } from '@/lib/types';
import { FaPlus, FaTimes } from 'react-icons/fa';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    license_number: '',
  });

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    const { data } = await getAllAgents();
    if (data) setAgents(data as any[]);
    setLoading(false);
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'license_number', label: 'License' },
  ];

  const handleEdit = (agent: any) => {
    setFormData({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      company: agent.company || '',
      bio: agent.bio || '',
      license_number: agent.license_number || '',
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (agent: any) => {
    if (confirm(`Delete agent ${agent.name}?`)) {
      try {
        await deleteAgent(agent.id);
        loadAgents();
      } catch (err) {
        alert('Error deleting agent');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        bio: formData.bio,
        license_number: formData.license_number,
      };

      if (isEditing) {
        await updateAgent(formData.id, payload);
      } else {
        await createAgent(payload);
      }
      
      setShowModal(false);
      loadAgents();
      resetForm();
    } catch (err) {
      alert('Error saving agent');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', email: '', phone: '', company: '', bio: '', license_number: '' });
    setIsEditing(false);
  };

  const actions = [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete, color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-600 mt-1">Manage real estate agents</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <FaPlus /> Add Agent
        </button>
      </div>

      <Table columns={columns} data={agents} actions={actions} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Agent' : 'Add New Agent'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full border p-2 rounded"
                  rows={3}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
