import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';
import { FaCog, FaBuilding, FaUser, FaSave, FaCrown } from 'react-icons/fa';

const Settings = () => {
  const { user, isSuperAdmin, isTenantAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [allTenants, setAllTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subscriptionPlan: '',
    maxUsers: '',
    maxProjects: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (isSuperAdmin) {
        // Super admin sees all tenants
        const response = await tenantService.getAll({ page: 1, limit: 100 });
        setAllTenants(response.data.tenants);
      } else if (isTenantAdmin) {
        // Tenant admin sees only their tenant
        const response = await tenantService.getDetails(user.tenantId);
        setTenantData(response.data);
        setFormData({
          name: response.data.name,
          subscriptionPlan: response.data.subscription_plan,
          maxUsers: response.data.max_users,
          maxProjects: response.data.max_projects,
          status: response.data.status
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelect = async (tenantId) => {
    try {
      setLoading(true);
      const response = await tenantService.getDetails(tenantId);
      setSelectedTenant(response.data);
      setFormData({
        name: response.data.name,
        subscriptionPlan: response.data.subscription_plan,
        maxUsers: response.data.max_users,
        maxProjects: response.data.max_projects,
        status: response.data.status
      });
    } catch (error) {
      toast.error('Failed to load tenant details');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const tenantId = isSuperAdmin ? selectedTenant?.id : user.tenantId;
      
      if (!tenantId) {
        toast.error('Please select a tenant');
        return;
      }

      await tenantService.update(tenantId, {
        name: formData.name,
        subscription_plan: formData.subscriptionPlan,
        max_users: parseInt(formData.maxUsers),
        max_projects: parseInt(formData.maxProjects),
        status: formData.status
      });

      toast.success('Settings updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Regular users cannot access settings
  if (!isTenantAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <FaCog className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access settings.</p>
          <p className="text-sm text-gray-500 mt-2">Contact your administrator for access.</p>
        </div>
      </div>
    );
  }

  if (loading && !selectedTenant && !tenantData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {isSuperAdmin && <FaCrown className="text-3xl text-yellow-500" />}
          <FaCog className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            {isSuperAdmin ? 'System Settings' : 'Organization Settings'}
          </h1>
        </div>
        <p className="text-gray-600">
          {isSuperAdmin 
            ? 'Manage all organization settings across the system'
            : 'Manage your organization settings and configuration'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Super Admin: Tenant Selector */}
        {isSuperAdmin && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBuilding className="text-purple-600" />
                Select Organization
              </h2>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSelect(tenant.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTenant?.id === tenant.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {tenant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.subdomain}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <div className={isSuperAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {(isTenantAdmin || (isSuperAdmin && selectedTenant)) ? (
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaBuilding className="text-blue-600" />
                  Organization Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="My Organization"
                    />
                  </div>

                  {/* Subscription Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Plan *
                    </label>
                    <select
                      name="subscriptionPlan"
                      value={formData.subscriptionPlan}
                      onChange={handleInputChange}
                      required
                      disabled={!isSuperAdmin}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    {!isSuperAdmin && (
                      <p className="text-xs text-gray-500 mt-1">Contact support to change plan</p>
                    )}
                  </div>

                  {/* Max Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Users *
                    </label>
                    <input
                      type="number"
                      name="maxUsers"
                      value={formData.maxUsers}
                      onChange={handleInputChange}
                      required
                      min="1"
                      disabled={!isSuperAdmin}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="10"
                    />
                    {!isSuperAdmin && (
                      <p className="text-xs text-gray-500 mt-1">Contact support to increase limit</p>
                    )}
                  </div>

                  {/* Max Projects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Projects *
                    </label>
                    <input
                      type="number"
                      name="maxProjects"
                      value={formData.maxProjects}
                      onChange={handleInputChange}
                      required
                      min="1"
                      disabled={!isSuperAdmin}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="5"
                    />
                    {!isSuperAdmin && (
                      <p className="text-xs text-gray-500 mt-1">Contact support to increase limit</p>
                    )}
                  </div>

                  {/* Status - Only for Super Admin */}
                  {isSuperAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Current Usage */}
                {(tenantData || selectedTenant) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Users</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${((selectedTenant || tenantData).total_users / formData.maxUsers) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(selectedTenant || tenantData).total_users} / {formData.maxUsers}
                          </span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Projects</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ 
                                width: `${((selectedTenant || tenantData).total_projects / formData.maxProjects) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(selectedTenant || tenantData).total_projects} / {formData.maxProjects}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <FaSave />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {isSuperAdmin ? 'Select an Organization' : 'No Data Available'}
              </h3>
              <p className="text-gray-600">
                {isSuperAdmin 
                  ? 'Choose an organization from the list to manage its settings'
                  : 'Unable to load organization data'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;