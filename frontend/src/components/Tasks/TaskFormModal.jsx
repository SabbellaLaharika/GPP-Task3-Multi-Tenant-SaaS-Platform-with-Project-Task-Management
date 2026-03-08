import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import taskService from '../../services/taskService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TaskFormModal = ({ isOpen, onClose, onSaved, task, projectId }) => {
    const { user, tenantId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedTo: '',
        dueDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setFormData({
                    title: task.title || '',
                    description: task.description || '',
                    status: task.status || 'todo',
                    priority: task.priority || 'medium',
                    assignedTo: task.assignedTo?.id || task.assignedTo || '',
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : (task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '')
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    status: 'todo',
                    priority: 'medium',
                    assignedTo: '',
                    dueDate: ''
                });
            }

            // Fetch users for the assignment dropdown
            fetchUsers();
        }
    }, [isOpen, task]);

    const fetchUsers = async () => {
        try {
            // we assume tenant_admin and user roles have a user.tenantId or tenantId is exposed by AuthContext
            const tenantIdToFetch = tenantId || user?.tenantId || user?.tenant_id || task?.tenantId;
            if (tenantIdToFetch) {
                const res = await userService.getAllByTenant(tenantIdToFetch);
                setUsers(res.data?.users || res.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            assignedTo: formData.assignedTo || null,
            dueDate: formData.dueDate || null,
        };

        try {
            if (task) {
                await taskService.update(task.id, payload);
                toast.success('Task updated successfully');
            } else {
                await taskService.create(projectId, payload);
                toast.success('Task created successfully');
            }
            onSaved();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save task';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {task ? 'Edit Task' : 'Create Task'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                                <select
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;
