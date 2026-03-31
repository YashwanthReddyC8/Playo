import { create } from 'zustand';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

export const useAdminStore = create((set) => ({
    // State
    users: [],
    totalUsers: 0,
    totalPages: 0,
    currentPage: 0,
    isLoading: false,
    error: null,

    // Get all users with pagination
    getUsers: async (page = 0, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/api/admin/users?page=${page}&size=${size}`);
            const data = response.data;
            set({
                users: data.content || [],
                totalUsers: data.totalElements || 0,
                totalPages: data.totalPages || 0,
                currentPage: page,
                isLoading: false,
            });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch users';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Get single user details
    getUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/api/admin/users/${userId}`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch user';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return null;
        }
    },

    // Update user role
    updateUserRole: async (userId, newRole) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.patch(`/api/admin/users/${userId}/role`, {
                newRole,
            });
            set({ isLoading: false });
            toast.success('User role updated successfully!');
            return response.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update role';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return null;
        }
    },

    // Soft delete user
    deleteUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/api/admin/users/${userId}`);
            set({ isLoading: false });
            toast.success('User deleted successfully!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete user';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Restore deleted user
    restoreUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post(`/api/admin/users/${userId}/restore`);
            set({ isLoading: false });
            toast.success('User restored successfully!');
            return response.data.user;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to restore user';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return null;
        }
    },
}));
