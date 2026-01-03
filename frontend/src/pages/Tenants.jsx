import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import tenantService from '../services/tenantService';
import { getAllTenantsWithStats } from '../services/superAdminService';      
import toast from 'react-hot-toast';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaSearch } from 'react-icons/fa';

const Tenants = () => {
  const {user, isSuperAdmin} = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await getAllTenantsWithStats({ page: 1, limit: 100 });
      console.log(response.data);
      setTenants(response.data.tenants || []);
      
    } catch (error) {
      toast.error('Failed to load tenants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionBadge = (plan) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[plan] || colors.basic;
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="flex items-center gap-1 text-green-600"><FaCheckCircle /> Active</span>;
    }
    return <span className="flex items-center gap-1 text-red-600"><FaTimesCircle /> Inactive</span>;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBuilding className="text-purple-600" />
          All Organizations
        </h1>
        <p className="text-gray-600 mt-2">Manage all tenant organizations</p>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search organizations..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subdomain</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Users</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No organizations found</td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{tenant.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{tenant.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full">{tenant.subdomain}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSubscriptionBadge(tenant.subscription_plan)}`}>
                        {tenant.subscription_plan?.charAt(0).toUpperCase() + tenant.subscription_plan?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">{getStatusBadge(tenant.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-bold">{tenant.total_users || 0}</div>
                      <div className="text-xs text-gray-500">/ {tenant.max_users}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-bold">{tenant.total_projects || 0}</div>
                      <div className="text-xs text-gray-500">/ {tenant.max_projects}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Tenants;