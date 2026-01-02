import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import tenantService from '../services/userService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes, FaTasks } from 'react-icons/fa';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
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

  const fetchData = async () => {
    setLoading(true);
    try {
      
      // Fetch project details
      const projectsResponse = await projectService.getAll();
      const currentProject = projectsResponse.data.projects.find(p => p.id === id);
      
      if (!currentProject) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }
      
      setProject(currentProject);
      
      // Fetch tasks
      const tasksResponse = await taskService.getAllByProject(id);
      setTasks(tasksResponse.data.tasks || []);
      
      // Fetch users for assignment
      const usersResponse = await tenantService.getAllByTenant(tenantId);
      setUsers(usersResponse.data.users || []);
      
    } catch (error) {
      toast.error('Failed to load project data');
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
      assignedTo: task.assigned_to || '',
      dueDate: task.due_date ? task.due_date.split('T')[0] : ''
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
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update task status');
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
      fetchData();
    } catch (error) {
      toast.error('Failed to delete task');
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

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
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{project?.name}</h1>
            <p className="text-gray-600 mt-2">{project?.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(project?.status)}`}>
                {project?.status}
              </span>
              <span className="text-sm text-gray-600">
                {tasks.length} tasks
              </span>
            </div>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-50 rounded-lg p-4">
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
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
              />
            ))}
            {todoTasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50 rounded-lg p-4">
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
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-green-50 rounded-lg p-4">
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
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                getPriorityColor={getPriorityColor}
              />
            ))}
            {completedTasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No tasks</p>
            )}
          </div>
        </div>
      </div>

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
                          {u.full_name} ({u.email})
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
const TaskCard = ({ task, users, onEdit, onDelete, onStatusChange, getPriorityColor }) => {
  const assignedUser = users.find(u => u.id === task.assigned_to);

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-700 p-1"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id, task.title)}
            className="text-red-600 hover:text-red-700 p-1"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {assignedUser && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
            {assignedUser.full_name}
          </span>
        )}
        {task.due_date && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Status Change Buttons */}
      <div className="flex gap-1 text-xs">
        {task.status !== 'todo' && (
          <button
            onClick={() => onStatusChange(task.id, 'todo')}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            To Do
          </button>
        )}
        {task.status !== 'in_progress' && (
          <button
            onClick={() => onStatusChange(task.id, 'in_progress')}
            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
          >
            In Progress
          </button>
        )}
        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task.id, 'completed')}
            className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;