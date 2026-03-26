import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAdminStore } from '../stores/adminStore';
import { Users, Search, ChevronLeft, ChevronRight, Trash2, RotateCcw, UserCog, LogOut, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const {
        users,
        totalPages,
        currentPage,
        isLoading,
        getUsers,
        updateUserRole,
        deleteUser,
        restoreUser,
    } = useAdminStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [pageSize] = useState(10);

    // Check if user is admin
    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
            toast.error('Access denied. Admin only.');
        }
    }, [user, navigate]);

    // Load users on mount and when page changes
    useEffect(() => {
        getUsers(currentPage, pageSize);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            getUsers(newPage, pageSize);
        }
    };

    // Filter and search users
    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = async (userId, role) => {
        const success = await updateUserRole(userId, role);
        if (success) {
            await getUsers(currentPage, pageSize);
            setIsRoleModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            const success = await deleteUser(userId);
            if (success) {
                await getUsers(currentPage, pageSize);
            }
        }
    };

    const handleRestoreUser = async (userId) => {
        const success = await restoreUser(userId);
        if (success) {
            await getUsers(currentPage, pageSize);
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsRoleModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-green-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Logged in as: <span className="font-semibold">{user?.name}</span>
                        </span>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex gap-8">
                            <button
                                onClick={() => { }}
                                className="px-4 py-3 border-b-2 border-green-600 text-green-600 font-medium"
                            >
                                <Users className="w-4 h-4 inline mr-2" />
                                User Management
                            </button>
                            <button
                                onClick={() => navigate('/center-applications')}
                                className="px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium hover:border-gray-300"
                            >
                                <FileText className="w-4 h-4 inline mr-2" />
                                Center Applications
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="USER">User</option>
                            <option value="OWNER">Owner</option>
                            <option value="TRAINER">Trainer</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No users found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredUsers.map((u) => {
                                            const isDeleted = u.email?.startsWith('deleted_');
                                            return (
                                                <tr key={u.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={u.profileLink || `https://robohash.org/${u.name?.replaceAll(' ', '-')}`}
                                                                alt={u.name}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                            <span className="font-medium text-gray-900">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {isDeleted ? (
                                                            <span className="text-red-600 font-medium">
                                                                {u.email?.substring(u.email.lastIndexOf('_') + 1)}
                                                            </span>
                                                        ) : (
                                                            u.email
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                                u.role === 'OWNER' ? 'bg-blue-100 text-blue-800' :
                                                                    u.role === 'TRAINER' ? 'bg-orange-100 text-orange-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDeleted
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {isDeleted ? 'Deleted' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            {!isDeleted && (
                                                                <button
                                                                    onClick={() => openRoleModal(u)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                    title="Change role"
                                                                >
                                                                    <UserCog className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => isDeleted ? handleRestoreUser(u.id) : handleDeleteUser(u.id)}
                                                                className={`p-2 rounded-lg ${isDeleted
                                                                        ? 'text-green-600 hover:bg-green-50'
                                                                        : 'text-red-600 hover:bg-red-50'
                                                                    }`}
                                                                title={isDeleted ? 'Restore user' : 'Delete user'}
                                                            >
                                                                {isDeleted ? (
                                                                    <RotateCcw className="w-5 h-5" />
                                                                ) : (
                                                                    <Trash2 className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Role Change Modal */}
            {isRoleModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Change User Role</h2>
                        <p className="text-gray-600 mb-4">
                            Current role: <span className="font-semibold">{selectedUser.role}</span>
                        </p>
                        <div className="space-y-3 mb-6">
                            {['ADMIN', 'USER', 'OWNER', 'TRAINER'].map((role) => (
                                <label key={role} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={newRole === role}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="ml-3 font-medium text-gray-700">{role}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsRoleModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRoleChange(selectedUser.id, newRole)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
