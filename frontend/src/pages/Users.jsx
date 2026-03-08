import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import Loading from '../components/Common/Loading';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { formatDate, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Users = () => {
  const { id } = useParams();
  const { user, isTenantAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    isActive: true
  });
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    password: '',
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    loadUsers();
  }, [user, id, currentPage, roleFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: searchTerm || undefined
      };
      const response = await userService.getAllByTenant(user.tenantId, params);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await userService.create(user.tenantId, newUser);
      toast.success('User created successfully!');
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'user', isActive: true });
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create user'));
    } finally {
      setCreating(false);
    }
  };

  // OPEN EDIT MODAL WITH USER DATA
  const handleEditClick = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      fullName: userToEdit.full_name || userToEdit.fullName,
      role: userToEdit.role,
      password: '',
      isActive: userToEdit.is_active !== undefined ? userToEdit.is_active : userToEdit.isActive
    });
    setShowEditModal(true);
  };

  // UPDATE USER HANDLER
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await userService.update(editingUser.id, updateData);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update user'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await userService.delete(userId);
      toast.success('User deleted successfully!');
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete user'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchTerm]);

  if (loading) return <Loading fullScreen />;

  if (!isTenantAdmin && user?.role !== 'tenant_admin') {
    return (
      <div className="flex justify-center items-center h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only tenant administrators can manage users.</p>
        </div>
      </div>
    );
  }

  // Filter functionality
  const filteredUsers = users; // Filtering handled by backend now

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-primary-600" />
            Users Management
          </h1>
          <p className="text-gray-600 mt-1">Manage team members and permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={FiPlus}>
          Add User
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="w-full sm:w-1/3">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="tenant_admin">Tenant Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No users found matching your filters.
                </td>
              </tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{u.fullName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(u.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleEditClick(u)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit user"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => setDeleteConfirm(u)}
                    className="text-red-600 hover:text-red-800 ml-3"
                    title="Delete user"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
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
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            value={newUser.fullName}
            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={newUser.isActive}
                onChange={(e) => setNewUser({ ...newUser, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active User</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Inactive users cannot log in
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" loading={creating}>
              Add User
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          {/* Email (Read-only) */}
          <Input
            label="Email"
            type="email"
            value={editingUser?.email || ''}
            disabled
            className="bg-gray-100"
          />

          {/* Full Name */}
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          {/* Password (Optional) */}
          <Input
            label="Password (optional)"
            type="password"
            placeholder="Leave blank to keep unchanged"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active User</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Inactive users cannot log in
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" loading={updating}>
              Update User
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteConfirm?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Users;