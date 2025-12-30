import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import tenantService from '../services/tenantService';
import { getDashboardStats } from '../services/dashboardService';
import toast from 'react-hot-toast';
import { 
  FaProjectDiagram, 
  FaTasks, 
  FaCheckCircle, 
  FaClock,
  FaUsers,
  FaArrowRight,
  FaChartLine
} from 'react-icons/fa';

const RegularDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalUsers: 0 
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await projectService.getAll();
      const projectsList = projectsResponse.data.projects || [];
      setProjects(projectsList.slice(0, 5)); // Show only recent 5
      
      // Fetch tenant info
      if (user?.tenantId) {
        const tenantResponse = await tenantService.getDetails(user.tenantId);
        setTenantInfo(tenantResponse.data);
      }
      

      const statsResponse = await getDashboardStats();
      setStats({
        totalProjects: statsResponse.data.totalProjects,
        totalTasks: statsResponse.data.totalTasks,
        completedTasks: statsResponse.data.completedTasks,
        pendingTasks: statsResponse.data.pendingTasks,
        totalUsers: statsResponse.data.totalUsers
      });
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects - REAL DATA */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProjects}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaProjectDiagram className="text-2xl text-blue-600" />
            </div>
          </div>
          <Link 
            to="/projects" 
            className="text-blue-600 text-sm mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <FaArrowRight />
          </Link>
        </div>

        {/* Total Tasks - REAL DATA */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTasks}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaTasks className="text-2xl text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Across all projects</p>
        </div>

        {/* Completed Tasks - REAL DATA */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedTasks}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalTasks > 0 
                ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0) 
                : 0}% completion rate
            </p>
          </div>
        </div>

        {/* Pending Tasks - REAL DATA */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingTasks}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
          <p className="text-orange-600 text-sm mt-4 font-medium">Needs attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Recent Projects</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaProjectDiagram className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No projects yet</p>
                <Link 
                  to="/projects" 
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Create your first project
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {project.task_count || 0} tasks
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <FaArrowRight className="text-gray-400 ml-4" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {projects.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t">
                <Link 
                  to="/projects" 
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  View all projects <FaArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Organization Info & Quick Actions */}
        <div className="space-y-6">
          {/* Organization Info */}
          {tenantInfo && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Organization Info
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="font-semibold text-gray-900">{tenantInfo.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Subscription Plan</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {tenantInfo.subscription_plan}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Users</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(tenantInfo.total_users / tenantInfo.max_users) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {tenantInfo.total_users} / {tenantInfo.max_users}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Projects</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(tenantInfo.total_projects / tenantInfo.max_projects) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {tenantInfo.total_projects} / {tenantInfo.max_projects}
                    </span>
                  </div>
                </div>
              </div>
              
              {user?.role === 'tenant_admin' && (
                <Link 
                  to="/settings" 
                  className="mt-4 block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded transition-colors"
                >
                  Manage Settings
                </Link>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/projects"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div className="bg-blue-100 p-2 rounded group-hover:bg-blue-200">
                  <FaProjectDiagram className="text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">View Projects</span>
              </Link>
              
              <Link
                to="/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="bg-purple-100 p-2 rounded group-hover:bg-purple-200">
                  <FaUsers className="text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">Manage Users</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularDashboard;