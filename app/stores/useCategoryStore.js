import { create } from 'zustand';
import { request } from '../util/request';
import { useAuthStore } from './authStore';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // -------------------------------
  // Fetch all categories
  // -------------------------------
  fetchCategories: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'No token found. Please log in.' });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const res = await request('/admin/categories', 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ categories: res.data, loading: false });
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch categories',
        loading: false,
      });
      return [];
    }
  },

  fetchCategoryById: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found');

    try {
      const res = await request(`/admin/categories/${id}`, 'GET', null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // No need to build image_category_url manually
      set({ category: res });
      return res;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch category');
    }
  },


  // -------------------------------
  // Create a new category
  // -------------------------------
  createCategory: async (data) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      const res = await request('/admin/categories', 'POST', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      set((state) => ({ categories: [...state.categories, res], loading: false }));
      return res;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to create category',
        loading: false,
      });
      throw err;
    }
  },

  // -------------------------------
  // Update a category
  // -------------------------------
  updateCategory: async (id, updatedData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');
  
    set({ loading: true, error: null });
    try {
      // If updatedData is already a FormData (e.g. from the form), use it.
      // Otherwise build one from an object.
      let body;
      if (updatedData instanceof FormData) {
        body = updatedData;
      } else {
        body = new FormData();
        // known possible fields - append only when present
        const fields = ['name', 'status'];
        fields.forEach((key) => {
          if (key in updatedData && updatedData[key] !== undefined && updatedData[key] !== null && updatedData[key] !== '') {
            body.append(key, String(updatedData[key]));
          }
        });
  
        // image: append only if it's a File
        if (updatedData.image_category instanceof File) {
          body.append('image_category', updatedData.image_category);
        }
      }
  
      // Use POST + _method=PUT to be robust with multipart uploads
      body.append('_method', 'PUT');
  
      // IMPORTANT: Do not set Content-Type header — let the browser handle multipart boundary
      const res = await request(`/admin/categories/${id}`, 'POST', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // If your request helper supports a `isFormData` flag you can use it to skip JSON handling
      });
  
      // Normalize payload; API returns { message, data }
      const payload = res?.data?.data ?? res?.data ?? res;
  
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === id ? payload : cat)),
        loading: false,
      }));
  
      return payload;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update category';
      set({ error: message, loading: false });
      throw err;
    }
  },
  
  // -------------------------------
  // Delete a category
  // -------------------------------
  deleteCategory: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');

    set({ loading: true, error: null });
    try {
      await request(`/admin/categories/${id}`, 'DELETE', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to delete category',
        loading: false,
      });
      throw err;
    }
  },

  // -------------------------------
  // Clear state
  // -------------------------------
  clearCategories: () => set({ categories: [], loading: false, error: null }),
}));
