import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Common/Button';
import Loading from '../components/Common/Loading';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import EmptyState from '../components/Common/EmptyState';
import { getStatusBadgeColor, getPriorityBadgeColor, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        taskService.getAllByProject(id),
        userService.getAllByTenant(user.tenantId),
      ]);
      setTasks(tasksRes.data.tasks);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create(id, newTask);
      toast.success('Task created!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Task status updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loading fullScreen />;

  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/projects')} variant="secondary" icon={FiArrowLeft}>
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
        </div>
        <Button onClick={() => setShowTaskModal(true)} icon={FiPlus}>
          Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 capitalize">{status.replace('_', ' ')}</h3>
              <span className="bg-gray-200 px-2 py-1 rounded text-sm">{statusTasks.length}</span>
            </div>
            <div className="space-y-3">
              {statusTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No tasks</p>
              ) : (
                statusTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.assigned_to_name && (
                        <span className="text-xs text-gray-500">{task.assigned_to_name}</span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      {status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(task.id, status === 'todo' ? 'in_progress' : 'completed')}
                          className="flex-1 px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded hover:bg-primary-100"
                        >
                          {status === 'todo' ? 'Start' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1">Create Task</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowTaskModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
