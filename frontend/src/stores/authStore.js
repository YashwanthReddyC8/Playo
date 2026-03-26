import { create } from 'zustand';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => ({
    // State
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,

    // Initialize auth state from localStorage
    initAuth: () => {
        const token = localStorage.getItem('spj');
        const user = localStorage.getItem('user');
        if (token && user) {
            set({
                isAuthenticated: true,
                user: JSON.parse(user),
            });
        }
    },

    // Register
    register: async (name, email, password, phone) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/auth/register', {
                name,
                email,
                password,
                phone,
            });

            const { token, user } = response.data;
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileLink: user.profileLink || `https://robohash.org/${user.name?.replaceAll(' ', '-')}`,
            };

            localStorage.setItem('spj', token);
            localStorage.setItem('user', JSON.stringify(userData));

            set({
                isAuthenticated: true,
                user: userData,
                isLoading: false,
            });

            toast.success('Registration successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Login
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileLink: user.profileLink || `https://robohash.org/${user.name?.replaceAll(' ', '-')}`,
            };

            localStorage.setItem('spj', token);
            localStorage.setItem('user', JSON.stringify(userData));

            set({
                isAuthenticated: true,
                user: userData,
                isLoading: false,
            });

            toast.success('Login successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('spj');
        localStorage.removeItem('user');
        set({
            isAuthenticated: false,
            user: null,
            error: null,
        });
        toast.success('Logged out successfully');
    },

    // Forgot Password
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post('/api/auth/forgot-password', { email });
            set({ isLoading: false });
            toast.success('Password reset email sent. Check your inbox.');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send reset email';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Validate Reset Token
    validateResetToken: async (token) => {
        try {
            const response = await axiosInstance.get(`/api/auth/validate-reset-token/${token}`);
            return response.data.valid;
        } catch {
            return false;
        }
    },

    // Reset Password
    resetPassword: async (token, newPassword, confirmPassword) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post('/api/auth/reset-password', {
                token,
                newPassword,
                confirmPassword,
            });
            set({ isLoading: false });
            toast.success('Password reset successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Password reset failed';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Resend Reset Email
    resendResetEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post('/api/auth/resend-reset-email', { email });
            set({ isLoading: false });
            toast.success('Reset email resent. Check your inbox.');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resend email';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Get current user profile
    getProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get('/api/auth/profile');
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({
                user: userData,
                isLoading: false,
            });
            return userData;
        } catch (error) {
            set({ isLoading: false });
            return null;
        }
    },

    // Update profile
    updateProfile: async (name, phone) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put('/api/auth/profile', {
                name,
                phone,
            });
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({
                user: userData,
                isLoading: false,
            });
            toast.success('Profile updated successfully!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axiosInstance.post('/api/auth/profile/upload-image', formData);
            const profileLink = response.data.profileLink;
            const currentUser = get().user;
            const updatedUser = { ...currentUser, profileLink };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({
                user: updatedUser,
                isLoading: false,
            });
            toast.success('Profile picture updated!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Upload failed';
            set({
                error: message,
                isLoading: false,
            });
            toast.error(message);
            return false;
        }
    },

    // Update user data (simple update without API call)
    updateUser: (updatedUser) => {
        const merged = { ...get().user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(merged));
        set({ user: merged });
    },

    // Setup session expired listener
    setupSessionListener: () => {
        const handleAuthExpired = () => {
            if (!localStorage.getItem('spj')) return;
            localStorage.removeItem('spj');
            localStorage.removeItem('user');
            set({
                isAuthenticated: false,
                user: null,
                error: null,
            });
            toast.error('Session expired. Please log in again.');
        };
        window.addEventListener('auth:expired', handleAuthExpired);
        return () => window.removeEventListener('auth:expired', handleAuthExpired);
    },
}));
