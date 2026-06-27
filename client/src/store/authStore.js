import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please check your credentials.'
      };
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('accessToken', data.accessToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('accessToken');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  checkMe: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      set({
        user: data.user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updatedUser) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null
    }));
  }
}));

// Global logout listener for silent interceptor logouts
if (typeof window !== 'undefined') {
  window.addEventListener('auth_logout', () => {
    useAuthStore.getState().logout();
  });
}
