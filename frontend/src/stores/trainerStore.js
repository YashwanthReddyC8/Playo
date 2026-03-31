import { create } from 'zustand';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const useTrainerStore = create((set, get) => ({
    // State
    trainers: [],
    trainerDetail: null,
    sessions: [],
    bookings: [],
    totalPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,

    // Get all trainers with filters
    getTrainers: async (page = 1, size = 10, sport = '', city = '', search = '') => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/public/trainers', {
                params: { page, size, sport, city, search },
            });
            set({
                trainers: response.data.content,
                totalPages: response.data.totalPages,
                currentPage: page,
                isLoading: false,
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load trainers';
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    // Get individual trainer profile
    getTrainerProfile: async (trainerId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`/api/public/trainers/${trainerId}`);
            set({
                trainerDetail: response.data,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load trainer profile';
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    // User: Get trainer's available sessions
    getTrainerSessions: async (trainerId, page = 1, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`/api/public/trainers/${trainerId}/sessions`, {
                params: { page, size },
            });
            set({
                sessions: response.data.content,
                totalPages: response.data.totalPages,
                currentPage: page,
                isLoading: false,
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load sessions';
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    // Trainer: Create session
    createSession: async (sessionData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/trainer/sessions', sessionData, {
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success('Session created successfully');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create session';
            set({ error: message, isLoading: false });
            toast.error(message);
            throw error;
        }
    },

    // Trainer: Update session
    updateSession: async (sessionId, sessionData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(`/api/trainer/sessions/${sessionId}`, sessionData);
            toast.success('Session updated successfully');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update session';
            set({ error: message, isLoading: false });
            toast.error(message);
            throw error;
        }
    },

    // Trainer: Get my sessions
    getMyTrainerSessions: async (page = 1, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/trainer/sessions', {
                params: { page, size },
            });
            set({
                sessions: response.data.content,
                totalPages: response.data.totalPages,
                currentPage: page,
                isLoading: false,
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load your sessions';
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    // User: Book a session
    bookSession: async (sessionId, bookingData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`/api/trainer/sessions/${sessionId}/book`, bookingData);
            toast.success('Session booked successfully');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to book session';
            set({ error: message, isLoading: false });
            toast.error(message);
            throw error;
        }
    },

    // User: Get my bookings
    getMyBookings: async (page = 1, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/user/bookings', {
                params: { page, size },
            });
            set({
                bookings: response.data.content,
                totalPages: response.data.totalPages,
                currentPage: page,
                isLoading: false,
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load bookings';
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    // Trainer: Get my profile
    getTrainerProfileMe: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/trainer/profile');
            set({
                trainerDetail: response.data,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load profile';
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    // Trainer: Update my profile
    updateTrainerProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put('/api/trainer/profile', profileData);
            set({
                trainerDetail: response.data,
                isLoading: false,
            });
            toast.success('Profile updated successfully');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            set({ error: message, isLoading: false });
            toast.error(message);
            throw error;
        }
    },

    // Trainer: Upload profile picture
    uploadTrainerProfilePicture: async (file) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/trainer/profile/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            set({
                trainerDetail: response.data,
                isLoading: false,
            });
            toast.success('Profile picture updated');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload profile picture';
            set({ error: message, isLoading: false });
            toast.error(message);
            throw error;
        }
    },

    // Clear detail view
    clearTrainerDetail: () => set({ trainerDetail: null }),
}));

export default useTrainerStore;
