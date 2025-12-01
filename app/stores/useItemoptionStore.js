import { create } from "zustand";
import { request } from "../util/request";
import { useAuthStore } from "./authStore";

export const useItemOptionStore = create((set, get) => ({
  options: [],
  loading: false,
  error: null,
  option: null,

  // -------------------------------
  // Fetch all option groups
  // -------------------------------
  fetchOptionsgroups: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
    set({ error: "No token found. Please log in." });
    return [];
    }
    
    set({ loading: true, error: null });
    
    try {
    const res = await request("/admin/item-options", "GET", null, {
    headers: { Authorization: `Bearer ${token}` },
    });


    console.log("Full response:", res);
    
    // API returns an array directly
    const optionsArray = Array.isArray(res) ? res : [];
    
    console.log("Fetched options count:", optionsArray.length);
    
    set({ options: optionsArray, loading: false });
    return optionsArray;

    
    } catch (err) {
    console.error("Fetch error:", err);
    set({
    error: err.response?.data?.message || err.message || "Failed to fetch options",
    loading: false,
    });
    return [];
    }
    },
    
  

  // -------------------------------
  // Fetch single option group
  // -------------------------------
  getOption: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/item-option-groups/${id}`, "GET", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ option: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch option",
        loading: false,
      });
      return null;
    }
  },

  // -------------------------------
  // Create new option group
  // -------------------------------
  createOption: async (data) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ loading: true, error: null });
    try {
      const res = await request("/admin/item-option-groups", "POST", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh list
      await get().fetchOptions();
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to create option",
        loading: false,
      });
      return null;
    }
  },

  // -------------------------------
  // Update option group
  // -------------------------------
  updateOption: async (id, data) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/item-option-groups/${id}`, "PUT", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh list
      await get().fetchOptions();
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to update option",
        loading: false,
      });
      return null;
    }
  },

  // -------------------------------
  // Delete option group
  // -------------------------------
  deleteOption: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ loading: true, error: null });
    try {
      const res = await request(`/admin/item-option-groups/${id}`, "DELETE", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh list
      await get().fetchOptions();
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete option",
        loading: false,
      });
      return null;
    }
  },
}));
