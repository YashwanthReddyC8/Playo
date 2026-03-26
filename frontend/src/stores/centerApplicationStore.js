import { create } from 'zustand';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

export const useCenterApplicationStore = create((set) => ({
    // State
    applications: [],
    totalApplications: 0,
    totalPages: 0,
    currentPage: 0,
    isLoading: false,
    error: null,
    statusFilter: 'PENDING',

    // Get all applications with pagination and filtering
    getApplications: async (page = 0, size = 10, status = 'PENDING', city = '') => {
        set({ isLoading: true, error: null });
        try {
            let url = `/api/admin/center-applications?page=${page}&size=${size}&status=${status}`;
            if (city) url += `&city=${city}`;

            const response = await axiosInstance.get(url);
            const data = response.data;
            set({
                applications: data.content || [],
                totalApplications: data.totalElements || 0,
                totalPages: data.totalPages || 0,
                currentPage: page,
                statusFilter: status,
                isLoading: false,
            });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch applications';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Approve application
    approveApplication: async (applicationId, reviewNotes = '') => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(
                `/api/admin/center-applications/${applicationId}/status`,
                {
                    status: 'APPROVED',
                    reviewNotes,
                }
            );
            set({ isLoading: false });
            toast.success('Application approved successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to approve application';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return null;
        }
    },

    // Reject application
    rejectApplication: async (applicationId, reviewNotes = '') => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(
                `/api/admin/center-applications/${applicationId}/status`,
                {
                    status: 'REJECTED',
                    reviewNotes,
                }
            );
            set({ isLoading: false });
            toast.success('Application rejected successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reject application';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return null;
        }
    },

    // Set status filter
    setStatusFilter: (status) => {
        set({ statusFilter: status, currentPage: 0 });
    },
}));
