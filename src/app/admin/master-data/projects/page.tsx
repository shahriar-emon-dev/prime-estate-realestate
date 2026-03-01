'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { getAllProjects, createProject, deleteProject, getAreasList } from '@/lib/dataService';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: '', developer: '', areaId: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: projectsData } = await getAllProjects();
      const { data: areasData } = await getAreasList();
      
      if (projectsData) {
        setProjects(projectsData.map(p => ({
          ...p,
          areaName: p.area?.name || 'Unknown',
          units: 0 // Placeholder
        })));
      }
      
      if (areasData) {
        setAreas(areasData);
        if (areasData.length > 0 && !newProject.areaId) {
          setNewProject(prev => ({ ...prev, areaId: areasData[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'name', label: 'Project Name' },
    { key: 'developer', label: 'Developer' },
    { key: 'areaName', label: 'Area' },
    { key: 'units', label: 'Total Units' },
    { key: 'status', label: 'Status' },
  ];

  const handleAddProject = async () => {
    if (newProject.name.trim() && newProject.areaId) {
      try {
        await createProject({
          name: newProject.name.trim(),
          developer: newProject.developer.trim(),
          areaId: newProject.areaId,
          isActive: true
        });
        setNewProject({ name: '', developer: '', areaId: areas[0]?.id || '' });
        fetchData();
        alert(`Project "${newProject.name}" added successfully!`);
      } catch (error) {
        console.error('Error adding project:', error);
        alert('Failed to add project');
      }
    }
  };

  const handleEdit = (project: any) => {
    alert(`Editing: ${project.name}`);
  };

  const handleDelete = async (project: any) => {
    if (confirm(`Delete ${project.name}?`)) {
      try {
        await deleteProject(project.id);
        fetchData();
        alert('Deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const actions = [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete, color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">Manage development projects</p>
      </div>

      {/* Add Project Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Project Name"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <input
            type="text"
            value={newProject.developer}
            onChange={(e) => setNewProject({ ...newProject, developer: e.target.value })}
            placeholder="Developer"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <select
            aria-label="Select area"
            value={newProject.areaId}
            onChange={(e) => setNewProject({ ...newProject, areaId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="" disabled>Select Area</option>
            {areas.map((area: any) => (
              <option key={area.id} value={area.id}>{area.name} ({area.city})</option>
            ))}
          </select>
          <button
            onClick={handleAddProject}
            disabled={loading || !newProject.areaId}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Project'}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && projects.length === 0 ? (
        <div className="text-center py-8">Loading projects...</div>
      ) : (
        <Table columns={columns} data={projects} actions={actions} />
      )}
    </div>
  );
}
