import { create } from "zustand";
import { request } from "../util/request";
import { useAuthStore } from "./authStore";

export const useOptionStore = create((set, get) => ({
  options: [],
  loading: false,
  error: null,
  option: null,

  // -------------------------------
  // Fetch all option groups
  // -------------------------------
  fetchOptions: async () => {
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

      const optionsArray = Array.isArray(res) ? res : [];
  

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
      const res = await request(`/admin/item-option/${id}`, "GET", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ option: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch option",
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

      await get().fetchOptions();
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to create option",
        loading: false,
      });
      return null;
    }
  },


  // -------------------------------
  // Update option
  // -------------------------------

updateOptionP: async (id, data) => {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  set({ loading: true, error: null });

  try {
    // If caller already passed a FormData, use it. Otherwise build one.
    const formData = data instanceof FormData ? data : new FormData();

    if (!(data instanceof FormData)) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
    }

    // Add PUT override
    formData.append("_method", "PUT");

    // Debug: list entries (helpful while developing)
    // for (const pair of formData.entries()) console.log('fd', pair);

    const res = await request(
      `/admin/item-options/${id}`,
      "POST",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type for FormData; browser will set boundary.
          Accept: "application/json",
        },
      }
    );

    await get().fetchOptions();
    set({ loading: false });

    console.log("Update response data:", res?.data);

    return res?.data ?? null;

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

      await get().fetchOptions();
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to delete option",
        loading: false,
      });
      return null;
    }
  },
}));
