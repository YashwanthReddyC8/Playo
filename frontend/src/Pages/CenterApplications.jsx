import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCenterApplicationStore } from '../stores/centerApplicationStore';
import { FileText, MapPin, Mail, Phone, CheckCircle, XCircle, Clock, LogOut, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CenterApplications() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const {
        applications,
        totalPages,
        currentPage,
        statusFilter,
        isLoading,
        getApplications,
        approveApplication,
        rejectApplication,
        setStatusFilter,
    } = useCenterApplicationStore();

    const [selectedApp, setSelectedApp] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(''); // 'approve' or 'reject'
    const [reviewNotes, setReviewNotes] = useState('');
    const [pageSize] = useState(10);

    // Check if user is admin
    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/');
            toast.error('Access denied. Admin only.');
        }
    }, [user, navigate]);

    // Load applications on mount and when filters/page changes
    useEffect(() => {
        getApplications(currentPage, pageSize, statusFilter);
    }, [currentPage, statusFilter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            getApplications(newPage, pageSize, statusFilter);
        }
    };

    const openApprovalModal = (app, action) => {
        setSelectedApp(app);
        setModalAction(action);
        setReviewNotes('');
        setModalOpen(true);
    };

    const handleApproval = async () => {
        if (!selectedApp) return;

        let success;
        if (modalAction === 'approve') {
            success = await approveApplication(selectedApp.id, reviewNotes);
        } else {
            success = await rejectApplication(selectedApp.id, reviewNotes);
        }

        if (success) {
            setModalOpen(false);
            setSelectedApp(null);
            await getApplications(currentPage, pageSize, statusFilter);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <FileText className="w-8 h-8 text-green-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Center Applications</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Admin: <span className="font-semibold">{user?.name}</span>
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
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Status Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
                    <div className="flex gap-4 overflow-x-auto">
                        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${statusFilter === status
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading applications...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No applications found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Center Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {app.sportsCenterName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="font-medium">{app.name}</div>
                                                    <div className="text-xs text-gray-500">{app.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {app.city}, {app.state}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-4 h-4" />
                                                        {app.phoneNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                                        {getStatusIcon(app.status)}
                                                        {app.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openApprovalModal(app, 'approve')}
                                                            disabled={app.status?.toUpperCase() === 'APPROVED'}
                                                            className={`px-3 py-1 rounded text-sm font-medium ${app.status?.toUpperCase() === 'APPROVED'
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openApprovalModal(app, 'reject')}
                                                            disabled={app.status?.toUpperCase() === 'REJECTED'}
                                                            className={`px-3 py-1 rounded text-sm font-medium ${app.status?.toUpperCase() === 'REJECTED'
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                }`}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Page {currentPage + 1} of {totalPages || 1}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Approval Modal */}
            {modalOpen && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {modalAction === 'approve' ? 'Approve' : 'Reject'} Application
                        </h2>

                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold text-gray-900">{selectedApp.sportsCenterName}</p>
                            <p className="text-sm text-gray-600 mt-1">Owner: {selectedApp.name}</p>
                            <p className="text-sm text-gray-600">{selectedApp.city}, {selectedApp.state}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review Notes (Optional)
                            </label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add notes for this decision..."
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproval}
                                className={`flex-1 px-4 py-2 text-white rounded-lg ${modalAction === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {modalAction === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
