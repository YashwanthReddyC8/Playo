import { create } from 'zustand';
import axiosInstance from '../api/axios';

export const useOwnerStore = create((set, get) => ({
    centers: [],
    isLoading: false,
    error: null,
    selectedCenter: null,

    // Fetch all centers owned by the authenticated user
    fetchCenters: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/api/owners/centers');
            set({
                centers: response.data,
                isLoading: false,
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch centers';
            set({
                error: message,
                isLoading: false,
            });
            console.error('Fetch centers error:', message);
        }
    },

    // Fetch a specific center
    fetchCenterById: async (centerId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/api/owners/centers/${centerId}`);
            set({
                selectedCenter: response.data,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch center';
            set({
                error: message,
                isLoading: false,
            });
            throw error;
        }
    },

    // Create a new center
    createCenter: async (centerData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/owners/centers', centerData);
            set((state) => ({
                centers: [...state.centers, response.data],
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            // Handle validation errors
            if (error.response?.data?.messages) {
                const firstError = Object.values(error.response.data.messages)[0];
                const message = firstError || 'Validation failed';
                set({ error: message, isLoading: false });
                throw error;
            }

            const message = error.response?.data?.message || error.message || 'Failed to create center';
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    // Update an existing center
    updateCenter: async (centerId, centerData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(`/api/owners/centers/${centerId}`, centerData);
            set((state) => ({
                centers: state.centers.map((c) => (c.id === centerId ? response.data : c)),
                selectedCenter: response.data,
                isLoading: false,
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update center';
            set({
                error: message,
                isLoading: false,
            });
            throw error;
        }
    },

    // Delete a center
    deleteCenter: async (centerId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/api/owners/centers/${centerId}`);
            set((state) => ({
                centers: state.centers.filter((c) => c.id !== centerId),
                selectedCenter: state.selectedCenter?.id === centerId ? null : state.selectedCenter,
                isLoading: false,
            }));
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete center';
            set({
                error: message,
                isLoading: false,
            });
            throw error;
        }
    },

    // Search centers by city
    searchCentersByCity: async (city) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get('/api/owners/centers/search/city', {
                params: { city },
            });
            set({
                centers: response.data,
                isLoading: false,
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to search centers';
            set({
                error: message,
                isLoading: false,
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Set selected center
    setSelectedCenter: (center) => set({ selectedCenter: center }),
}));
