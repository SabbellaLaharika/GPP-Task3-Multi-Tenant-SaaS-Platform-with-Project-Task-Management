import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and tenant settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Tenant Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Organization</label>
            <p className="text-gray-900">{user?.tenant?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Subdomain</label>
            <p className="text-gray-900">{user?.tenant?.subdomain}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Plan</label>
            <p className="text-gray-900 capitalize">{user?.tenant?.subscriptionPlan}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Max Users</label>
              <p className="text-gray-900">{user?.tenant?.maxUsers}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Max Projects</label>
              <p className="text-gray-900">{user?.tenant?.maxProjects}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">User Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="text-gray-900">{user?.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
