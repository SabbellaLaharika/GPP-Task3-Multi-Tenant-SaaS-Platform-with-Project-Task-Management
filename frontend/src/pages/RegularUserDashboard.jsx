import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import toast from 'react-hot-toast';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaClock,
  FaUser,
  FaProjectDiagram,
  FaExclamationCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RegularUserDashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch ONLY tasks assigned to current user
      const tasksResponse = await taskService.getUserTasks(user.id);
      const userTasks = tasksResponse.data.tasks || [];
      setMyTasks(userTasks);
      
      // Calculate task statistics
      const todoCount = userTasks.filter(t => t.status === 'todo').length;
      const inProgressCount = userTasks.filter(t => t.status === 'in_progress').length;
      const completedCount = userTasks.filter(t => t.status === 'completed').length;
      
      setStats({
        totalTasks: userTasks.length,
        todoTasks: todoCount,
        inProgressTasks: inProgressCount,
        completedTasks: completedCount
      });
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchUserData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update task status');
      console.error(error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique projects from user's tasks
  const userProjects = [...new Set(myTasks.map(t => ({
    id: t.project_id,
    name: t.project_name
  })))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here are your assigned tasks
        </p>
      </div>

      {/* Stats Cards - Only My Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total My Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">My Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTasks}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaTasks className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        {/* To Do */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">To Do</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todoTasks}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <FaExclamationCircle className="text-2xl text-gray-600" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inProgressTasks}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedTasks}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">My Assigned Tasks</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaTasks className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No tasks assigned yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {task.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority} priority
                          </span>
                          <span className="text-xs text-gray-500">
                            <FaProjectDiagram className="inline mr-1" />
                            {task.project_name}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-gray-500">
                              <FaClock className="inline mr-1" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Status Update Buttons */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 mr-2">Status:</span>
                          <button
                            onClick={() => handleStatusChange(task.id, 'todo')}
                            disabled={updatingTaskId === task.id || task.status === 'todo'}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                              task.status === 'todo' 
                                ? 'bg-gray-200 text-gray-800 cursor-default' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            To Do
                          </button>
                          <button
                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                            disabled={updatingTaskId === task.id || task.status === 'in_progress'}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                              task.status === 'in_progress' 
                                ? 'bg-blue-200 text-blue-800 cursor-default' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            } disabled:opacity-50`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            disabled={updatingTaskId === task.id || task.status === 'completed'}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                              task.status === 'completed' 
                                ? 'bg-green-200 text-green-800 cursor-default' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50`}
                          >
                            Completed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Profile & Projects */}
        <div className="space-y-6">
          {/* My Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              My Profile
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  User
                </span>
              </div>
            </div>
            
            <Link 
              to="/profile" 
              className="mt-4 block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
            >
              Edit Profile
            </Link>
          </div>

          {/* My Projects */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaProjectDiagram className="text-purple-600" />
              My Projects
            </h3>
            
            {userProjects.length === 0 ? (
              <p className="text-gray-500 text-sm">No projects assigned</p>
            ) : (
              <div className="space-y-2">
                {userProjects.map((project) => (
                  <div key={project.id} className="p-3 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">My Progress</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalTasks > 0 
                      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">To Do</span>
                  <span className="font-semibold">{stats.todoTasks}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold">{stats.inProgressTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completedTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularUserDashboard;