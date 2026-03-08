import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FaProjectDiagram,
    FaTasks,
    FaCheckCircle,
    FaClock,
    FaFilter,
    FaPlus,
    FaEdit,
    FaTrash,
    FaChevronLeft,
    FaChevronRight
} from 'react-icons/fa';
import { getErrorMessage } from '../utils/helpers';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import TaskFormModal from '../components/Tasks/TaskFormModal';

const Tasks = () => {
    const { user, isSuperAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        todo: 0,
        in_progress: 0,
        completed: 0
    });

    // Filters & Pagination
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterProject, setFilterProject] = useState('all');
    const [filterAssignedTo, setFilterAssignedTo] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    const [updatingTaskId, setUpdatingTaskId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchTasks();
        if (isSuperAdmin && filterProject !== 'all') {
            fetchUsers();
        }
    }, [currentPage, filterStatus, filterPriority, filterProject, filterAssignedTo, searchTerm]);

    // Reset to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterPriority, filterProject, filterAssignedTo, searchTerm]);

    const fetchProjects = async () => {
        try {
            const res = await projectService.getAll({ limit: 100 });
            setProjects(res.data?.projects || []);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const [users, setUsers] = useState([]);
    const fetchUsers = async () => {
        try {
            let tenantIdToFetch = user?.tenantId;

            // If Super Admin, get tenantId from the selected project
            if (isSuperAdmin && filterProject !== 'all') {
                const selectedProj = projects.find(p => p.id === filterProject);
                if (selectedProj) {
                    tenantIdToFetch = selectedProj.tenantId || selectedProj.tenant_id;
                }
            }

            if (tenantIdToFetch) {
                const res = await userService.getAllByTenant(tenantIdToFetch);
                setUsers(res.data?.users || []);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const commonParams = {
                priority: filterPriority !== 'all' ? filterPriority : undefined,
                projectId: filterProject !== 'all' ? filterProject : undefined,
                assignedTo: filterAssignedTo !== 'all' ? (filterAssignedTo === 'unassigned' ? 'null' : filterAssignedTo) : undefined,
                search: searchTerm || undefined
            };

            const tableParams = {
                ...commonParams,
                page: currentPage,
                limit,
                status: filterStatus !== 'all' ? filterStatus : undefined,
            };

            // Fetch table data and stats in parallel
            const [tableRes, allRes, todoRes, inProgressRes, completedRes] = await Promise.all([
                taskService.getAllByProject(filterProject, tableParams),
                taskService.getAllByProject(filterProject, { ...commonParams, status: undefined, limit: 1 }),
                taskService.getAllByProject(filterProject, { ...commonParams, status: 'todo', limit: 1 }),
                taskService.getAllByProject(filterProject, { ...commonParams, status: 'in_progress', limit: 1 }),
                taskService.getAllByProject(filterProject, { ...commonParams, status: 'completed', limit: 1 })
            ]);

            const tasksList = tableRes.data?.tasks || [];
            setTasks(tasksList);
            setTotalPages(tableRes.data?.pagination?.totalPages || 1);

            setStats({
                total: allRes.data?.total || 0,
                todo: todoRes.data?.total || 0,
                in_progress: inProgressRes.data?.total || 0,
                completed: completedRes.data?.total || 0
            });

        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to fetch tasks'));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            setUpdatingTaskId(taskId);
            await taskService.updateStatus(taskId, newStatus);
            toast.success('Status updated');
            fetchTasks();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to update status'));
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleDeleteTask = async () => {
        if (!confirmDelete) return;
        try {
            await taskService.delete(confirmDelete);
            toast.success('Task deleted');
            fetchTasks();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete task'));
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleTaskSaved = () => {
        fetchTasks();
        handleModalClose();
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

    const isOverdue = (task) => {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaTasks className="text-primary-600" />
                        Task Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage all your tasks in one place</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Tasks', count: stats.total, color: 'border-blue-500', icon: FaTasks, iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
                    { label: 'To Do', count: stats.todo, color: 'border-yellow-500', icon: FaClock, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' },
                    { label: 'In Progress', count: stats.in_progress, countColor: 'text-purple-600', color: 'border-purple-500', icon: FaClock, iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
                    { label: 'Completed', count: stats.completed, color: 'border-green-500', icon: FaCheckCircle, iconColor: 'text-green-600', iconBg: 'bg-green-100' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${stat.color} hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-1 ${stat.countColor || 'text-gray-800'}`}>{stat.count}</p>
                            </div>
                            <div className={`${stat.iconBg} p-3 rounded-xl`}>
                                <stat.icon className={`text-2xl ${stat.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Area */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Search tasks or projects..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaFilter className="absolute left-3 top-3 text-gray-400 text-sm" />
                </div>

                <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer max-w-[200px]"
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                >
                    <option value="all">All Projects</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                {!isSuperAdmin && (
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer max-w-[200px]"
                        value={filterAssignedTo}
                        onChange={(e) => setFilterAssignedTo(e.target.value)}
                    >
                        <option value="all">All Assignees</option>
                        <option value="unassigned">Unassigned Only</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                    </select>)}
            </div>

            {/* Tasks List */}
            <div className="grid grid-cols-1 gap-4">
                {tasks.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-100">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTasks className="text-gray-300 text-2xl" />
                        </div>
                        <p className="text-gray-500 font-medium text-lg">No tasks found matching your filters</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                            {/* Title & Actions */}
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                                {!isSuperAdmin && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditTask(task)}
                                            className="text-blue-600 hover:text-blue-700 p-2"
                                            title="Edit Task"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        {user.role === 'tenant_admin' && (
                                            <button
                                                onClick={() => setConfirmDelete(task.id)}
                                                className="text-red-600 hover:text-red-700 p-2"
                                                title="Delete Task"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {task.description && (
                                <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                            )}

                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className={`text-[12px] px-2.5 py-1.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                <span className={`text-[12px] px-2.5 py-1.5 rounded-full font-medium capitalize ${getTaskStatusBadgeColor(task.status)}`}>
                                    {(task.status || 'todo').replace('_', ' ')}
                                </span>
                                {isOverdue(task) && (
                                    <span className="text-[12px] px-2.5 py-1.5 rounded-full font-bold bg-red-600 text-white animate-pulse">
                                        OVERDUE
                                    </span>
                                )}
                                <span className="text-[12px] text-gray-600 flex items-center gap-1 font-medium bg-[#f8f9fa] border border-gray-200/60 px-2.5 py-1.5 rounded-full">
                                    <FaProjectDiagram className="text-gray-400" />
                                    {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                                    {isSuperAdmin && (task.tenant?.name) && (
                                        <span className="text-primary-500 ml-1">({task.tenant?.name})</span>
                                    )}
                                </span>
                                {task.dueDate && (
                                    <span className="text-[12px] px-2.5 py-1.5 rounded-full bg-orange-100/70 text-orange-600 font-medium">
                                        {new Date(task.dueDate).toLocaleDateString('en-GB')}
                                    </span>
                                )}
                                {!isSuperAdmin && (task.assignedTo?.fullName) && (
                                    <span className="text-[12px] px-2.5 py-1.5 rounded-full bg-purple-100 text-purple-600 font-medium">
                                        {task.assignedTo?.fullName}
                                    </span>
                                )}
                            </div>

                            {/* Status Change Buttons */}
                            {!isSuperAdmin && (
                                <div className="flex gap-2 text-[12px] font-medium mt-1">
                                    {task.status !== 'todo' && (
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'todo')}
                                            disabled={updatingTaskId === task.id}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            To Do
                                        </button>
                                    )}
                                    {task.status !== 'in_progress' && (
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                                            disabled={updatingTaskId === task.id}
                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            In Progress
                                        </button>
                                    )}
                                    {task.status !== 'completed' && (
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'completed')}
                                            disabled={updatingTaskId === task.id}
                                            className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Completed
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm px-6 py-4 flex items-center justify-between border border-gray-100 mt-6">
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

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
                confirmColor="bg-red-600"
            />

            {isModalOpen && (
                <TaskFormModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSaved={handleTaskSaved}
                    task={editingTask}
                    projectId={editingTask?.projectId}
                />
            )}
        </div>
    );
};

export default Tasks;
