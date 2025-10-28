import { create } from 'zustand';
import { request } from '../util/request';
import { useAuthStore } from './authStore';

export const useShopStore = create((set, get) => ({
  shops: [],
  shop: null,
  loading: false,
  error: null,

  // -------------------------------
  // Fetch all shops
  // -------------------------------
  fetchShops: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'No token found. Please log in.' });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const res = await request('/admin/shops', 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ shops: res, loading: false });
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch shops',
        loading: false,
      });
      return [];
    }
  },

  // -------------------------------
  // Fetch a single shop by ID
  // -------------------------------
  fetchShopById: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/shops/${id}`, 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ shop: res, loading: false });
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch shop',
        loading: false,
      });
      return null;
    }
  },

  // -------------------------------
  // Create a new shop
  // -------------------------------
  createShop: async (shopData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    try {
      const res = await request('/admin/shops', 'POST', shopData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({ shops: [...state.shops, res] }));
      return res;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to create shop' });
      throw err;
    }
  },

  // -------------------------------
  // Update a shop
  // -------------------------------
  updateShop: async (id, updatedData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    try {
      const res = await request(`/admin/shops/${id}`, 'PUT', updatedData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({
        shops: state.shops.map((s) => (s.id === id ? res : s)),
        shop: state.shop?.id === id ? res : state.shop,
      }));
      return res;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to update shop' });
      throw err;
    }
  },

  // -------------------------------
  // Delete a shop
  // -------------------------------
  deleteShop: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      await request(`/admin/shops/${id}`, 'DELETE', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        shops: state.shops.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to delete shop', loading: false });
      throw err;
    }
  },

  // -------------------------------
  // Fetch nearby shops
  // -------------------------------
  fetchNearbyShops: async (params) => {
    // params can be { lat, lng, radius } or whatever your API expects
    const token = useAuthStore.getState().token;
    if (!token) return [];

    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params).toString();
      const res = await request(`/admin/shops/nearby?${query}`, 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ shops: res, loading: false });
      return res;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message || 'Failed to fetch nearby shops', loading: false });
      return [];
    }
  },

  // -------------------------------
  // Clear state
  // -------------------------------
  clearShop: () => set({ shop: null }),
  clearShops: () => set({ shops: [], loading: false, error: null }),
}));
