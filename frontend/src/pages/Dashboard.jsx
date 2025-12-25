import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiFolderPlus, FiCheckSquare, FiClock, FiTrendingUp } from 'react-icons/fi';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import Loading from '../components/Common/Loading';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime, getStatusBadgeColor, getPriorityBadgeColor } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsRes] = await Promise.all([
        projectService.getAll({ limit: 5 }),
      ]);

      const projects = projectsRes.data.projects;
      setRecentProjects(projects);

      // Calculate stats
      let totalTasks = 0;
      let completedTasks = 0;

      for (const project of projects) {
        if (project.task_count) totalTasks += parseInt(project.task_count);
        if (project.completed_task_count) completedTasks += parseInt(project.completed_task_count);
      }

      setStats({
        totalProjects: projectsRes.data.total,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
      });

    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FiFolderPlus, color: 'primary' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: FiCheckSquare, color: 'secondary' },
    { label: 'Completed', value: stats.completedTasks, icon: FiTrendingUp, color: 'success' },
    { label: 'Pending', value: stats.pendingTasks, icon: FiClock, color: 'warning' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View all →
          </button>
        </div>

        <div className="space-y-4">
          {recentProjects.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No projects yet</p>
          ) : (
            recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.task_count} tasks</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
