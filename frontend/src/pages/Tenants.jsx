import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaSearch, FaEdit, FaTimes, FaQuestionCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SUBSCRIPTION_LIMITS = {
  free: { maxUsers: 5, maxProjects: 3 },
  pro: { maxUsers: 25, maxProjects: 15 },
  enterprise: { maxUsers: 100, maxProjects: 50 }
};

const Tenants = () => {
  const { user, isSuperAdmin } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    subscriptionPlan: '',
    status: ''
  });

  useEffect(() => {
    fetchTenants();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getAll({ page: currentPage, limit });
      if (response.success) {
        setTenants(response.data.tenants || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error) {
      toast.error('Failed to load tenants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanLimits = (plan) => {
    return SUBSCRIPTION_LIMITS[plan?.toLowerCase()] || SUBSCRIPTION_LIMITS.free;
  };

  const handleEditClick = (tenant) => {
    setSelectedTenant(tenant);
    setEditFormData({
      name: tenant.name,
      subscriptionPlan: tenant.subscriptionPlan,
      status: tenant.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const limits = SUBSCRIPTION_LIMITS[editFormData.subscriptionPlan];

      await tenantService.update(selectedTenant.id, {
        name: editFormData.name,
        subscriptionPlan: editFormData.subscriptionPlan,
        maxUsers: limits.maxUsers,
        maxProjects: limits.maxProjects,
        status: editFormData.status
      });

      toast.success('Organization updated successfully');
      setIsEditModalOpen(false);
      fetchTenants();
    } catch (error) {
      toast.error('Failed to update organization');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionBadge = (plan) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[plan] || colors.free;
  };

  const getStatusBadge = (status) => {
    const statusBadges = {
      'active': <span className="flex items-center gap-1 text-green-600"><FaCheckCircle /> Active</span>,
      'trial': <span className="flex items-center gap-1 text-yellow-600"><FaQuestionCircle /> Trial</span>,
      'suspended': <span className="flex items-center gap-1 text-red-600"><FaTimesCircle /> Suspended</span>,
    };
    return statusBadges[status] || statusBadges.active;
  };

  const renderCapacity = (current, plan, type) => {
    const limits = getPlanLimits(plan);
    const max = type === 'users' ? limits.maxUsers : limits.maxProjects;
    return (
      <div className="text-center">
        <div className="text-lg font-bold">{current || 0}</div>
        <div className="text-xs text-gray-500">/ {max}</div>
      </div>
    );
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
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subdomain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase"> Users</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase"> Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No organizations found</td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
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
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSubscriptionBadge(tenant.subscriptionPlan)}`}>
                          {tenant.subscriptionPlan?.charAt(0).toUpperCase() + tenant.subscriptionPlan?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">{getStatusBadge(tenant.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4">
                          {renderCapacity(tenant.totalUsers, tenant.subscriptionPlan, 'users')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4">
                          {renderCapacity(tenant.totalProjects, tenant.subscriptionPlan, 'projects')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEditClick(tenant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Organization"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Edit Organization</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select
                  value={editFormData.subscriptionPlan}
                  onChange={(e) => setEditFormData({ ...editFormData, subscriptionPlan: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <p className="mt-1 text-xs text-info flex items-center gap-1">
                  Limits: {SUBSCRIPTION_LIMITS[editFormData.subscriptionPlan].maxUsers} Users, {SUBSCRIPTION_LIMITS[editFormData.subscriptionPlan].maxProjects} Projects
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
