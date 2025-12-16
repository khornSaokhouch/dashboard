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
      set({ shops: res.data, loading: false });
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
// -------------------------------
// Create a new shop (Zustand action using request wrapper)
// -------------------------------
createShop: async (shopData = {}) => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('No token found. Please log in.');

  // build FormData if there is a File (image) or if caller wants FormData
  const buildFormDataIfNeeded = (data) => {
    // if caller already passed a FormData, use it
    if (data instanceof FormData) return data;

    // check if any value is a File/Blob and therefore needs FormData
    const hasFile = Object.values(data).some(
      (v) => v instanceof File || v instanceof Blob
    );

    if (!hasFile) {
      // no files present — we can send plain object (request() will set application/json)
      // but Laravel expects multipart for files; sending JSON is fine if no file
      return data;
    }

    const fd = new FormData();
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (val === undefined || val === null) return;

      if (val instanceof File || val instanceof Blob) {
        fd.append(key, val);
      } else {
        fd.append(key, String(val));
      }
    });
    return fd;
  };

  try {
    const payloadToSend = buildFormDataIfNeeded(shopData);

    // call your request helper — it will use the axios instance with interceptor
    const res = await request('/admin/shops', 'POST', payloadToSend, {
      // no need to set Content-Type — interceptor will handle FormData
      // but keep Authorization/header handled by interceptor using useAuthStore
    });

    // Laravel usually returns { message, data: $shop } — prefer payload.data
    const newShop = res?.data ?? res;

    // append to store
    // set((state) => ({ shops: [...(state.shops || []), newShop], error: null }));

    return newShop;
  } catch (err) {
    // try to extract message from axios/Laravel payload
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.errors && Object.values(err.response.data.errors).flat().join(', ') ||
      err?.message ||
      'Failed to create shop';
    set({ error: message });
    throw err;
  }
},



  // -------------------------------
  // Update a shop
  // -------------------------------
  updateShop: async (id, updatedData) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No token found. Please log in.');
  
    // Build FormData
    const formData = new FormData();
  
    // Convert status to 0/1 if present
    if ('status' in updatedData) {
      const s = updatedData.status;
      // Accept "active"/"inactive", boolean, number, or string "0"/"1"
      const statusInt =
        s === true || s === 'active' || s === '1' || s === 1 ? 1 : 0;
      formData.append('status', String(statusInt));
    }
  
    // Append other fields
    const fields = ['name','location','latitude','longitude','open_time','close_time','owner_user_id'];
    fields.forEach((key) => {
      if (key in updatedData && updatedData[key] !== undefined && updatedData[key] !== null) {
        formData.append(key, String(updatedData[key]));
      }
    });
  
    // Append image only if it's a File (user selected a file)
    if (updatedData.image instanceof File) {
      formData.append('image', updatedData.image);
    }
    // If you want to explicitly clear image on the server, append a flag like `remove_image = 1`
    // if you support that in the backend.
  
    // Some servers (and older Laravel setups) can't accept multipart PUT bodies reliably.
    // If your backend accepts PUT multipart directly, you can call with method 'PUT'.
    // If not, use POST + _method=PUT (Laravel recognizes this).
    // I will use POST + _method fallback to be robust:
    formData.append('_method', 'PUT');
  
    try {
      // Do not set 'Content-Type' here — let the browser set the multipart boundary.
      const res = await request(`/admin/shops/${id}`, 'POST', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set 'Content-Type': 'multipart/form-data'
        },
      });
  
      // Normalize response payload:
      // If your request helper returns axios-like res (res.data), handle both shapes:
      const payload = res?.data?.data ?? res?.data ?? res;
  
      set((state) => ({
        shops: state.shops.map((s) => (s.id === id ? payload : s)),
        shop: state.shop?.id === id ? payload : state.shop,
      }));
  
      return payload;
    } catch (err) {
      // try to read a message path common from axios / fetch wrappers
      const message = err?.response?.data?.message || err?.message || 'Failed to update shop';
      set({ error: message });
      throw err;
    }
  },
  

  // -------------------------------
  // Delete a shop
  // -------------------------------
  deleteShop: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'No token found. Please log in.' });
      throw new Error('No token found. Please log in.');
    }
  
    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/shops/${id}`, 'DELETE', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      set((state) => ({
        shops: state.shops.filter((s) => s.id !== id),
        loading: false,
      }));
  
      return res;
    } catch (err) {
      if (err.response?.status === 403) {
        alert('You are not allowed to delete this shop.');
      } else {
        alert(err.message || 'Failed to delete shop.');
      }
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
