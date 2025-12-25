import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';
import projectService from '../services/projectService';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Loading from '../components/Common/Loading';
import EmptyState from '../components/Common/EmptyState';
import Modal from '../components/Common/Modal';
import { getStatusBadgeColor, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'active' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll({ status: statusFilter, search });
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await projectService.create(newProject);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', status: 'active' });
      loadProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={FiPlus}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FiSearch}
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
          <Button onClick={loadProjects} variant="secondary">Search</Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to get started"
          action={<Button onClick={() => setShowCreateModal(true)} icon={FiPlus}>Create Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer animate-scale-in"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{project.task_count} tasks</span>
                <span className="text-gray-500">{formatDate(project.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Enter project name"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Enter project description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newProject.status}
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1" loading={creating}>
              Create Project
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
