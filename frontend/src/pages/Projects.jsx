import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaProjectDiagram, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getErrorMessage } from '../utils/helpers';

const Projects = () => {
  const { user, isSuperAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tenants, setTenants] = useState([]);
  const [filterTenant, setFilterTenant] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(6); // Set a small limit for better pagination visibility

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchProjects();
    if (isSuperAdmin && tenants.length === 0) {
      fetchTenants();
    }
  }, [filterStatus, filterTenant, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterTenant]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit
      };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (isSuperAdmin && filterTenant !== 'all') {
        params.tenantId = filterTenant;
      }
      const response = await projectService.getAll(params);
      if (response.success) {
        setProjects(response.data.projects || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load projects'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await tenantService.getAll({ page: 1, limit: 100 });
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Failed to load tenants', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingProject) {
        await projectService.update(editingProject.id, formData);
        toast.success('Project updated successfully');
      } else {
        await projectService.create(formData);
        toast.success('Project created successfully');
      }

      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', status: 'active' });
      fetchProjects();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || 'Operation failed';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated tasks.`)) {
      return;
    }

    try {
      setLoading(true);
      await projectService.delete(projectId);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete project';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  // Filter projects client-side only for search term
  const filteredProjects = projects.filter((project) => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaProjectDiagram className="text-primary-600" />
            Projects
          </h1>
          <p className="text-gray-600">{isSuperAdmin ? 'View all tenant projects' : 'Manage your organization\'s projects'}</p>
        </div>
        {!isSuperAdmin && (
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> New Project
          </button>)}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Tenant Filter - Only for Super Admin */}
        {isSuperAdmin && (
          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        )}

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading && !showModal ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaProjectDiagram className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          {!searchTerm && filterStatus === 'all' && !isSuperAdmin && (
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Create Project
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                <Link to={`/projects/${project.id}`} className="block p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  {isSuperAdmin && tenants.find(t => t.id === project.tenantId)?.name && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        🏢 {tenants.find(t => t.id === project.tenantId)?.name}
                      </span>
                    </div>
                  )}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between mb-3 border-b pb-3">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium w-max ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-gray-700 font-medium">
                        {project.taskCount} tasks
                      </span>
                      {(project.createdBy?.fullName) && (
                        <span className="text-xs text-gray-500 line-clamp-1">
                          By: {project.createdBy?.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                {!isSuperAdmin && (
                  <div className="px-6 py-3 bg-gray-50 border-t flex justify-end gap-2 mt-auto">
                    <button
                      onClick={() => handleEditClick(project)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                      title="Edit project"
                    >
                      <FaEdit />
                    </button>
                    {user?.role === 'tenant_admin' && (
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Delete project"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>)}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white rounded-lg shadow-sm px-6 py-4 flex items-center justify-between border border-gray-100">
            <div className="text-sm text-gray-600">
              Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft></FaChevronLeft>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight></FaChevronRight>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Project Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Website Redesign"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the project"
                />
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;