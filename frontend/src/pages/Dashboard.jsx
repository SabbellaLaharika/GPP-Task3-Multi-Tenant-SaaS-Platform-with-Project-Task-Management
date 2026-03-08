import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import tenantService from '../services/tenantService';
import userService from '../services/userService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaProjectDiagram,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaBuilding,
  FaUsers
} from 'react-icons/fa';
import { getErrorMessage } from '../utils/helpers';

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTenants: 0
  });
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [taskFilter, setTaskFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Projects (Endpoint 13 - Role-aware)
      const projectsResponse = await projectService.getAll({ limit: 50 }); // Fetch enough for stats
      const projectsList = projectsResponse.data?.projects || [];
      setProjects(projectsList.slice(0, 4)); // Keep 4 for display

      // 2. Calculate Stats from Projects
      let totalTasksCount = 0;
      let completedTasksCount = 0;
      projectsList.forEach(p => {
        totalTasksCount += (p.taskCount || 0);
        completedTasksCount += (p.completedTaskCount || 0);
      });

      const dashboardStats = {
        totalProjects: projectsResponse.data?.pagination?.totalProjects || projectsList.length,
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        pendingTasks: totalTasksCount - completedTasksCount,
        totalTenants: 0,
        totalUsers: 0
      };

      // 3. Role-specific additional data
      if (isSuperAdmin) {
        // Endpoint 7: List all tenants
        const tenantsRes = await tenantService.getAll({ limit: 4 });
        const tenantsList = tenantsRes.data?.tenants || [];
        setTenants(tenantsList);
        dashboardStats.totalTenants = tenantsRes.data?.pagination?.totalTenants || tenantsList.length || 0;
      } else if (user?.role === 'tenant_admin') {
        // Endpoint 9: List users
        const usersRes = await userService.getAllByTenant(user.tenantId);
        dashboardStats.totalUsers = usersRes.data?.total || usersRes.data?.users?.length || 0;
      }

      setStats(dashboardStats);
      console.log("stats", stats);

      // 4. Fetch "My Tasks" (Only if not SuperAdmin)
      if (!isSuperAdmin) {
        const taskPromises = projectsList.map(async p => {
          try {
            // Endpoint 17: List Tasks by Project
            const res = await taskService.getAllByProject(p.id, { assignedTo: user.id });
            const tasks = res.data?.tasks || [];
            return tasks.map(t => ({ ...t, projectId: p.id, projectName: p.name }));
          } catch (e) {
            return [];
          }
        });

        const allMyTasksArray = await Promise.all(taskPromises);
        setMyTasks(allMyTasksArray.flat());
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load dashboard data'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      setUpdatingTaskId(task.id);
      await taskService.updateStatus(task.id, newStatus);
      toast.success('Task status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update task status'));
      console.error(error);
    } finally {
      setUpdatingTaskId(null);
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

  const getTaskStatusBadgeColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'in_progress': return 'bg-sky-100 text-sky-700 border border-sky-200';
      case 'todo': return 'bg-amber-100 text-amber-700 border border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter tasks based on selected status
  const filteredTasks = taskFilter === 'all'
    ? myTasks
    : myTasks.filter(t => (t.status || t.status?.name || '').toLowerCase() === taskFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {getGreeting()}, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here is your dashboard overview.
        </p>
      </div>

      {/* Statistics Cards (Top Section) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProjects || 0}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <FaProjectDiagram className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTasks || 0}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full">
              <FaTasks className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedTasks || 0}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full">
              <FaCheckCircle className="text-2xl text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            {isSuperAdmin ? (
              <>
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Tenants</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTenants || 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FaBuilding className="text-2xl text-orange-600" />
                </div>
              </>
            ) : user?.role === 'tenant_admin' ? (
              <>
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers || 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FaUsers className="text-2xl text-orange-600" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending Tasks</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingTasks || 0}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-full">
                  <FaClock className="text-2xl text-amber-600" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Projects Section */}
        <div className={`bg-white rounded-lg shadow overflow-hidden flex flex-col ${isSuperAdmin ? 'xl:col-span-2' : ''}`}>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-0 mb-0">
              <FaProjectDiagram />
              Recent Projects {isSuperAdmin ? '(All Tenants)' : ''}
            </h2>
            <Link to="/projects" className="text-white hover:text-gray-200 text-sm flex items-center gap-1 font-medium bg-white/20 px-3 py-1 rounded-full transition-colors">
              View All <FaArrowRight />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex-1 flex flex-col justify-center items-center">
              <FaProjectDiagram className="text-4xl text-gray-300 mb-3" />
              <p>No projects found.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${isSuperAdmin ? 'sm:grid-cols-2' : ''} divide-y divide-gray-100 flex-1`}>
              {projects.map(project => (
                <Link key={project.id} to={`/projects/${project.id}`} className="block p-5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {(project.status || 'unknown').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaTasks className="text-gray-400" />
                          {project.taskCount || project.task_count || 0} tasks
                        </span>
                        {isSuperAdmin && project.tenantName && (
                          <span className="text-xs text-blue-600 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded-full">
                            <FaBuilding className="text-blue-400 text-[10px]" />
                            {project.tenantName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-gray-400">
                      <FaArrowRight />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Super Admin: Recent Organizations Section */}
        {isSuperAdmin && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col xl:col-span-2">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 pb-0 mb-0">
                <FaBuilding />
                Recent Organizations
              </h2>
              <Link to="/tenants" className="text-white hover:text-gray-200 text-sm flex items-center gap-1 font-medium bg-white/20 px-3 py-1 rounded-full transition-colors">
                View All <FaArrowRight />
              </Link>
            </div>
            {tenants.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex-1 flex flex-col justify-center items-center">
                <FaBuilding className="text-4xl text-gray-300 mb-3" />
                <p>No organizations found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-gray-100 flex-1">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="p-5 hover:bg-gray-50 transition-colors group relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tenant.subscriptionPlan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                tenant.subscriptionPlan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {tenant.subscriptionPlan}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {tenant.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{tenant.totalUsers || 0} / {
                          tenant.subscriptionPlan === 'enterprise' ? 100 : tenant.subscriptionPlan === 'pro' ? 25 : 5
                        }</div>
                        <div className="text-[10px] text-gray-500 uppercase font-medium">Users</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Tasks Section (Hide for SuperAdmin) */}
        {!isSuperAdmin && (
          <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center mb-0 gap-2">
                <FaTasks />
                My Tasks
              </h2>

              {/* Filter by status */}
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="px-3 py-1.5 rounded bg-white/20 text-white border-0 outline-none text-sm font-medium focus:ring-2 focus:ring-white appearance-none cursor-pointer"
              >
                <option value="all" className="text-gray-900">All Status</option>
                <option value="todo" className="text-gray-900">To Do</option>
                <option value="in_progress" className="text-gray-900">In Progress</option>
                <option value="completed" className="text-gray-900">Completed</option>
              </select>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex-1 flex flex-col justify-center items-center">
                <FaCheckCircle className="text-4xl text-gray-300 mb-3" />
                <p>{taskFilter === 'all' ? 'No tasks assigned to you.' : `No tasks match the filter '${taskFilter}'.`}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 flex-1 max-h-[600px] overflow-y-auto">
                {filteredTasks.map(task => (
                  <div key={task.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={`text-[12px] px-2.5 py-1.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'Normal'}
                      </span>
                      <span className={`text-[12px] px-2.5 py-1.5 rounded-full font-medium capitalize ${getTaskStatusBadgeColor(task.status)}`}>
                        {(task.status || 'todo').replace('_', ' ')}
                      </span>
                      <span className="text-[12px] text-indigo-700 flex items-center gap-1 font-semibold bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-full">
                        <FaProjectDiagram className="text-indigo-400" />
                        {task.projectName}
                      </span>
                      {task.dueDate && (
                        <span className="text-[12px] text-orange-600 flex items-center gap-1 bg-orange-100/70 px-2 py-1.5 rounded-full font-medium">
                          <FaClock className="text-orange-400" />
                          Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>

                    {/* Status Change Buttons */}
                    <div className="flex gap-2 text-[12px] font-medium mt-2">
                      {task.status !== 'todo' && (
                        <button
                          onClick={() => handleStatusChange(task, 'todo')}
                          disabled={updatingTaskId === task.id}
                          className="px-3 py-1.5 bg-gray-100/80 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          To Do
                        </button>
                      )}
                      {task.status !== 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(task, 'in_progress')}
                          disabled={updatingTaskId === task.id}
                          className="px-3 py-1.5 bg-blue-100/80 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          In Progress
                        </button>
                      )}
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(task, 'completed')}
                          disabled={updatingTaskId === task.id}
                          className="px-3 py-1.5 bg-green-100/80 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;