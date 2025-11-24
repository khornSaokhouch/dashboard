import { create } from 'zustand';
import { request } from '../util/request';
import { useAuthStore } from './authStore';

export const useItemStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // -------------------------------
  // Fetch all items
  // -------------------------------
  fetchItems: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'No token found. Please log in.' });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const res = await request('/admin/items', 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
     
      set({ items: res.data, loading: false });
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch items',
        loading: false,
      });
      return [];
    }
  },

  // -------------------------------
  // Fetch item by ID
  // -------------------------------
  fetchItemById: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found');

    try {
      const res = await request(`/admin/items/${id}`, 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ item: res });
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch item');
    }
  },

  // -------------------------------
  // Create a new item
  // -------------------------------
  createItem: async (data) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      const res = await request('/admin/items', 'POST', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      set((state) => ({ items: [...state.items, res], loading: false }));
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to create item',
        loading: false,
      });
      throw err;
    }
  },

  // -------------------------------
  // Update an item
  // -------------------------------
  updateItem: async (id, updatedData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/items/${id}`, 'POST', updatedData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? res : item)),
        loading: false,
      }));
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to update item',
        loading: false,
      });
      throw err;
    }
  },

  // -------------------------------
  // Delete an item
  // -------------------------------
  deleteItem: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      await request(`/admin/items/${id}`, 'DELETE', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to delete item',
        loading: false,
      });
      throw err;
    }
  },

  // -------------------------------
  // Clear state
  // -------------------------------
  clearItems: () => set({ items: [], loading: false, error: null }),
}));
