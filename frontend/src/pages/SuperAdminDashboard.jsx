import { useState, useEffect, useContext, use } from 'react';
import { useAuth } from '../context/AuthContext';
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';
import { 
  FaBuilding, 
  FaUsers, 
  FaProjectDiagram, 
  FaTasks, 
  FaChartLine,
  FaCrown,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    totalProjects: 0
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getAll({ page: 1, limit: 100 });
      setTenants(response.data.tenants);
      
      // Calculate stats
      const activeTenants = response.data.tenants.filter(t => t.status === 'active').length;
      const totalUsers = response.data.tenants.reduce((sum, t) => sum + (t.total_users || 0), 0);
      const totalProjects = response.data.tenants.reduce((sum, t) => sum + (t.total_projects || 0), 0);
      
      setStats({
        totalTenants: response.data.tenants.length,
        activeTenants,
        totalUsers,
        totalProjects
      });
    } catch (error) {
      toast.error('Failed to load tenants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadgeColor = (plan) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[plan] || colors.basic;
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-green-600">
          <FaCheckCircle /> Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-red-600">
        <FaTimesCircle /> Inactive
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FaCrown className="text-4xl text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-800">Super Admin Dashboard</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Welcome back, {user?.fullName} - System Administrator
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tenants */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Total Tenants</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTenants}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <FaBuilding className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Active Tenants</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeTenants}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <FaUsers className="text-3xl text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProjects}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <FaProjectDiagram className="text-3xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaBuilding /> All Tenants Overview
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading tenants...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subdomain
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <FaBuilding className="text-5xl mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No tenants found</p>
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant) => (
                    <tr 
                      key={tenant.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {tenant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {tenant.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-full">
                            {tenant.subdomain}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionBadgeColor(tenant.subscription_plan)}`}>
                          {tenant.subscription_plan?.charAt(0).toUpperCase() + tenant.subscription_plan?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {getStatusBadge(tenant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-gray-900">
                            {tenant.total_users || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            / {tenant.max_users || '∞'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-gray-900">
                            {tenant.total_projects || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            / {tenant.max_projects || '∞'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tenant.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Health Card */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaChartLine className="text-green-600" />
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Average Users per Tenant</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalTenants > 0 ? (stats.totalUsers / stats.totalTenants).toFixed(1) : 0}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Average Projects per Tenant</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalTenants > 0 ? (stats.totalProjects / stats.totalTenants).toFixed(1) : 0}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Tenant Activation Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {stats.totalTenants > 0 ? ((stats.activeTenants / stats.totalTenants) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;