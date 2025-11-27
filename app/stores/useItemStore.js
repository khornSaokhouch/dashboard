import { create } from 'zustand';
import { request } from '../util/request';
import { useAuthStore } from './authStore';

export const useItemStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  item: null,

  // -------------------------------
  // Fetch all items
  // -------------------------------
  fetchItems: async (params = {}) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'No token found. Please log in.' });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.categoryId) queryParams.append('category_id', params.categoryId);
      if (params.sortBy) queryParams.append('sort_by', params.sortBy);

      const url = `/admin/items?${queryParams.toString()}`;
      const res = await request(url, 'GET', null, {
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
  
    // set loading state
    set({ loading: true });
  
    try {
      const res = await request(
        `/admin/items/${id}`,
        'GET',
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Some APIs return the entity at res.data.data, others at res.data.
      // Use the inner object if present, otherwise fallback to res.data.
      const item = res?.data?.data ?? res?.data ?? res;
  
      // persist item in store and clear loading
      set({ item, loading: false });

      // return the item object so callers get the actual data
      return item;
    } catch (err) {
      // clear loading on error as well
      set({ loading: false });
  
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch item';
      throw new Error(message);
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
      // Prepare headers & method depending on whether we're sending FormData
      const isFormData = typeof FormData !== 'undefined' && updatedData instanceof FormData;
  
      let method = 'PUT';
      const headers = { Authorization: `Bearer ${token}` };
  
      // If sending FormData, many backends (e.g. Laravel) won't accept a true PUT multipart request
      // so we send POST with `_method=PUT` in the body and let the server treat it as PUT.
      let bodyToSend = updatedData;
      if (isFormData) {
        // append override so server treats POST as PUT
        // (avoid modifying caller's FormData instance unexpectedly? it's fine here)
        bodyToSend.append('_method', 'PUT');
        method = 'POST';
        // Do NOT set Content-Type — the browser will set multipart/form-data + boundary
      } else {
        // JSON body: ensure Content-Type is set and stringify body if it's a plain object
        headers['Content-Type'] = 'application/json';
        // If caller passed a FormData-like or already-stringified value, leave as-is.
        // Otherwise stringify plain objects.
        if (bodyToSend && typeof bodyToSend === 'object') {
          bodyToSend = JSON.stringify(bodyToSend);
        }
      }
  
      const res = await request(`/admin/items/${id}`, method, bodyToSend, {
        headers,
      });
  
      // Normalize returned item: prefer res.data.data -> res.data -> res
      const updatedItem = res?.data?.data ?? res?.data ?? res;
  
      // Update items array in store (safely handle missing items array)
      set((state) => ({
        items: (state.items || []).map((item) => (item.id === id ? updatedItem : item)),
        loading: false,
      }));
  
      return updatedItem;
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to update item';
      set({ error: message, loading: false });
      // throw a normalized Error so callers can catch/use the message
      throw new Error(message);
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
