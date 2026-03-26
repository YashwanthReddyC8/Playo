import React, { useEffect, useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOwnerStore } from '../../stores/ownerStore';
import CenterCard from './components/CenterCard';
import CenterFormModal from './components/CenterFormModal';
import CenterDetailModal from './components/CenterDetailModal';

export default function Owner() {
    const {
        centers,
        isLoading,
        error,
        fetchCenters,
        createCenter,
        updateCenter,
        deleteCenter,
        clearError,
    } = useOwnerStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState(null);
    const [searchCity, setSearchCity] = useState('');
    const [filteredCenters, setFilteredCenters] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [detailCenter, setDetailCenter] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Load centers on mount
    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    // Update filtered centers based on search
    useEffect(() => {
        if (searchCity.trim()) {
            setFilteredCenters(
                centers.filter((center) =>
                    center.city.toLowerCase().includes(searchCity.toLowerCase())
                )
            );
        } else {
            setFilteredCenters(centers);
        }
    }, [centers, searchCity]);

    const handleCreateClick = () => {
        setEditingCenter(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (center) => {
        setEditingCenter(center);
        setIsFormOpen(true);
    };

    const handleViewDetails = (center) => {
        setDetailCenter(center);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setDetailCenter(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            // Convert numeric fields
            const dataToSend = {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
            };

            if (editingCenter) {
                await updateCenter(editingCenter.id, dataToSend);
                toast.success('Center updated successfully!');
            } else {
                await createCenter(dataToSend);
                toast.success('Center created successfully!');
            }
            setIsFormOpen(false);
            setEditingCenter(null);
        } catch (err) {
            const message = err.response?.data?.messages?.[Object.keys(err.response.data.messages)[0]] ||
                err.response?.data?.message ||
                'Operation failed';
            toast.error(message);
        }
    };

    const handleDeleteCenter = async (centerId) => {
        if (window.confirm('Are you sure you want to delete this center?')) {
            setDeletingId(centerId);
            try {
                await deleteCenter(centerId);
                toast.success('Center deleted successfully!');
            } catch (err) {
                const message = err.response?.data?.message || 'Failed to delete center';
                toast.error(message);
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Sports Centers Management</h1>
                    <p className="text-gray-600">Create, manage, and monitor your sports centers</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800">Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-600 hover:text-red-800 font-semibold"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Search and Create Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                        >
                            <Plus size={20} />
                            Create Center
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your centers...</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredCenters.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5m0 0l-7 5m7-5v8m0-8V5.414" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {searchCity.trim() ? 'No centers found' : 'No centers yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchCity.trim()
                                ? `No centers found in "${searchCity}"`
                                : 'Create your first sports center to get started'}
                        </p>
                        {!searchCity.trim() && (
                            <button
                                onClick={handleCreateClick}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                <Plus size={20} />
                                Create First Center
                            </button>
                        )}
                    </div>
                )}

                {/* Centers Grid */}
                {!isLoading && filteredCenters.length > 0 && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            Showing {filteredCenters.length} of {centers.length} centers
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCenters.map((center) => (
                                <CenterCard
                                    key={center.id}
                                    center={center}
                                    onView={handleViewDetails}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteCenter}
                                    isDeleting={deletingId === center.id}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Modal */}
                <CenterFormModal
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingCenter(null);
                    }
                    }
                    onSubmit={handleFormSubmit}
                    initialData={editingCenter}
                    isLoading={isLoading}
                />

                {/* Detail Modal */}
                <CenterDetailModal
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                    center={detailCenter}
                />
            </div>
        </div>
    );
}