import { create } from 'zustand';
import { request } from '../util/request';
import { useAuthStore } from './authStore';

export const useUserStore = create((set, get) => ({
  user: null, // current logged-in user
  users: [],
  loading: false,
  error: null,

  // -------------------------------
  // Fetch logged-in user's profile
  // -------------------------------
  fetchUser: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'No token found. Please log in.' });
      return null;
    }

    set({ loading: true, error: null });
    try {
      const res = await request('/profile', 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.user, loading: false });
      return res.user;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch user',
        loading: false,
      });
      return null;
    }
  },

  // -------------------------------
  // Fetch all users
  // -------------------------------
  fetchAllUsers: async () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      const res = await request('/users', 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersArray = Array.isArray(res) ? res : res.users || [];

      // ✅ Normalize role and id
      const normalizedUsers = usersArray.map(u => ({
        ...u,
        role: typeof u.role === 'object' ? u.role.name : u.role || 'user',
        id: u.id ?? u.user_id,
      }));

      set({ users: normalizedUsers, loading: false });
      return normalizedUsers;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch users',
        loading: false,
      });
      return [];
    }
  },

  // -------------------------------
  // Update user
  // -------------------------------
  updateUser: async (updatedData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');
  
    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/users/${updatedData.id}`, 'PUT', updatedData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
  
      // Update users in store
      set((state) => ({
        users: state.users.map((u) =>
          u.id === updatedData.id ? { ...u, ...res.data } : u
        ),
        loading: false,
      }));
  
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Update failed',
        loading: false,
      });
      throw err;
    }
  },
  
  // -------------------------------
  // Delete a user
  // -------------------------------
  deleteUser: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      await request(`/users/${id}`, 'DELETE', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        loading: false,
      }));
    } catch (err) {
      console.error('Error deleting user:', err);
      set({ error: err.message || 'Failed to delete user', loading: false });
      throw err;
    }
  },

  // -------------------------------
  // Clear state
  // -------------------------------
  clearUser: () => set({ user: null, loading: false, error: null }),
  clearUsers: () => set({ users: [], loading: false, error: null }),
}));
