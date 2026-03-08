import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaTasks } from 'react-icons/fa';
import { getErrorMessage } from '../utils/helpers';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, tenantId, isSuperAdmin, isTenantAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Project inline editing
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editProjectNameValue, setEditProjectNameValue] = useState('');

  // Task filters
  const [filterTaskStatus, setFilterTaskStatus] = useState('all');
  const [filterTaskPriority, setFilterTaskPriority] = useState('all');
  const [filterTaskUser, setFilterTaskUser] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    fetchTasks();
  }, [id, currentPage, filterTaskStatus, filterTaskPriority, filterTaskUser]);

  const fetchTasks = async () => {
    try {
      const params = {
        page: currentPage,
        limit,
        status: filterTaskStatus !== 'all' ? filterTaskStatus : undefined,
        priority: filterTaskPriority !== 'all' ? filterTaskPriority : undefined,
        assignedTo: filterTaskUser !== 'all' ? (filterTaskUser === 'unassigned' ? 'null' : filterTaskUser) : undefined
      };
      const tasksResponse = await taskService.getAllByProject(id, params);
      setTasks(tasksResponse.data.tasks || []);
      setTotalPages(tasksResponse.data.pagination?.totalPages || 1);
      console.log('Tasks:', tasks)
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {

      // Fetch project details
      const projectsResponse = await projectService.getAll({ id });
      const currentProject = projectsResponse.data.projects[0];
      console.log('Fetched Project Detail:', currentProject);
      if (!currentProject) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }

      setProject(currentProject);
      setEditProjectNameValue(currentProject.name);

      // Tasks are now fetched in a separate useEffect

      // Fetch users for assignment (use user's tenantId as a fallback if project doesn't have it directly mapped)
      const projectTenantId = currentProject.tenantId; // || user?.tenant_id || tenantId;
      if (projectTenantId) {
        const usersResponse = await userService.getAllByTenant(projectTenantId);
        setUsers(usersResponse.data.users || []);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load project data'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: '',
      dueDate: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?.id || task.assignedTo || '',
      dueDate: task.dueDate
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null
      };

      if (editingTask) {
        await taskService.update(editingTask.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(id, taskData);
        toast.success('Task created successfully');
      }

      setShowModal(false);
      setEditingTask(null);
      fetchTasks();
      fetchData(); // Still call fetchData to update project level task counts if any
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || 'Operation failed';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchTasks();
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update task status';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleDelete = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await taskService.delete(taskId);
      toast.success('Task deleted successfully');
      fetchTasks();
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete task';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100/70 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100/70 text-green-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-500';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Group tasks by status with applied filters
  const processedTasks = tasks; // Filters now handled by backend

  const todoTasks = processedTasks.filter(t => t.status === 'todo');
  const inProgressTasks = processedTasks.filter(t => t.status === 'in_progress');
  const completedTasks = processedTasks.filter(t => t.status === 'completed');

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTaskStatus, filterTaskPriority, filterTaskUser]);

  const handleProjectNameSave = async () => {
    if (!editProjectNameValue.trim() || editProjectNameValue === project.name) {
      setIsEditingProjectName(false);
      return;
    }

    try {
      setLoading(true);
      await projectService.update(project.id, { ...project, name: editProjectNameValue });
      toast.success('Project name updated');
      setProject({ ...project, name: editProjectNameValue });
      setIsEditingProjectName(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update project name';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await projectService.delete(project.id);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete project';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <FaArrowLeft /> Back to Projects
        </Link>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditingProjectName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editProjectNameValue}
                  onChange={(e) => setEditProjectNameValue(e.target.value)}
                  className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1 py-0 w-full max-w-lg"
                  autoFocus
                  onBlur={handleProjectNameSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleProjectNameSave();
                    if (e.key === 'Escape') {
                      setIsEditingProjectName(false);
                      setEditProjectNameValue(project.name);
                    }
                  }}
                />
              </div>
            ) : (
              <h1
                className={`text-3xl font-bold text-gray-800 ${!isSuperAdmin ? 'cursor-pointer hover:bg-gray-100 px-1 -ml-1 rounded transition-colors inline-block' : ''} group`}
                onClick={() => !isSuperAdmin && setIsEditingProjectName(true)}
                title={!isSuperAdmin ? "Click to edit project name" : ""}
              >
                {project?.name}
                {!isSuperAdmin && <FaEdit className="inline-block ml-3 text-gray-400 opacity-0 group-hover:opacity-100 text-lg mb-1 transition-opacity" />}
              </h1>
            )}
            <p className="text-gray-600 mt-2 max-w-2xl">{project?.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project?.status)}`}>
                {project?.status}
              </span>
              <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                {tasks.length} tasks
              </span>
            </div>
          </div>
          {!isSuperAdmin && (
            <div className="flex flex-col sm:flex-row items-center gap-3 ml-4">
              {user?.role === 'tenant_admin' && (
                <button
                  onClick={handleDeleteProject}
                  className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                >
                  <FaTrash /> Delete Project
                </button>
              )}
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaPlus /> New Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select
              value={filterTaskStatus}
              onChange={(e) => setFilterTaskStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Priority:</span>
            <select
              value={filterTaskPriority}
              onChange={(e) => setFilterTaskPriority(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Assignee:</span>
            <select
              value={filterTaskUser}
              onChange={(e) => setFilterTaskUser(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white max-w-[200px]"
            >
              <option value="all">All Users</option>
              <option value="unassigned">Unassigned Only</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Counter */}
        {(filterTaskStatus !== 'all' || filterTaskPriority !== 'all' || filterTaskUser !== 'all') && (
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            Showing {processedTasks.length} matching tasks
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
            To Do ({todoTasks.length})
          </h2>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                user={user}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
              />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-50">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            In Progress ({inProgressTasks.length})
          </h2>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                user={user}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-green-50/40 rounded-xl p-4 border border-green-50">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Completed ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                user={user}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
              />
            ))}
            {completedTasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-900">{currentPage}</span> of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Implement login feature"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Task details..."
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Assigned To and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To
                    </label>
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, users, user, isSuperAdmin, onEdit, onDelete, onStatusChange, getPriorityColor, getStatusColor }) => {
  const assignedUserId = task.assignedTo?.id || task.assignedTo;
  const assignedUser = users.find(u => u.id === assignedUserId);

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{task.title}</h3>
        {!isSuperAdmin && (
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-700 p-1"
              title="Edit Task"
            >
              <FaEdit size={14} />
            </button>
            {user.role === 'tenant_admin' && (
              <button
                onClick={() => onDelete(task.id, task.title)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Delete Task"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-[12px] px-2.5 py-1.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority || 'Normal'}
        </span>
        <span className={`text-[12px] px-2.5 py-1.5 rounded-full font-medium capitalize ${getStatusColor(task.status)}`}>
          {(task.status || 'todo').replace('_', ' ')}
        </span>
        {assignedUser && (
          <span className="text-[12px] px-2.5 py-1.5 rounded-full bg-purple-100 text-purple-600 font-medium">
            {assignedUser.fullName}
          </span>
        )}
        {(task.dueDate) && (
          <span className="text-[12px] px-2.5 py-1.5 rounded-full bg-orange-100/70 text-orange-600 font-medium">
            {new Date(task.dueDate).toLocaleDateString('en-GB')}
          </span>
        )}
      </div>

      {/* Status Change Buttons */}
      {!isSuperAdmin && (
        <div className="flex gap-2 text-[12px] font-medium mt-2">
          {task.status !== 'todo' && (
            <button
              onClick={() => onStatusChange(task.id, 'todo')}
              className="px-3 py-1.5 bg-gray-100/80 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              To Do
            </button>
          )}
          {task.status !== 'in_progress' && (
            <button
              onClick={() => onStatusChange(task.id, 'in_progress')}
              className="px-3 py-1.5 bg-blue-100/80 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
            >
              In Progress
            </button>
          )}
          {task.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(task.id, 'completed')}
              className="px-3 py-1.5 bg-green-100/80 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
            >
              Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;