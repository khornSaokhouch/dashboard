import { create } from "zustand";
import { request } from "../util/request";
import { useAuthStore } from "./authStore";

export const useItemOptionStore = create((set, get) => ({
  options: [],
  loading: false,
  error: null,
  option: null,
  groupAssignments: [], 

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

    
    // API returns an array directly
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
  // Fetch all groups
  // -------------------------------
  fetchGroups: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
    set({ error: "No token found. Please log in." });
    return [];
    }
    
    set({ loading: true, error: null });
    
    try {
    const res = await request("/admin/item-option-groups/display", "GET", null, {
    headers: { Authorization: `Bearer ${token}` },
    });

    
    // API returns an array directly
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
    
  //-------------------------------
  //Fetch option group assignments
  //-------------------------------
  fetchOptions: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "No token found. Please log in." });
      return [];
    }

    set({ loading: true, error: null });
    try {
      const res = await request("/admin/item-option-groups", "GET", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ options: res, loading: false });
    
      
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch options",
        loading: false,
      });
      return [];
    }
  },
  
  //----------------------------------------
  // Create item item-option-group-assignments
  //----------------------------------------
  assignOptionGroup: async (itemId, optionGroupId) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
  
    set({ loading: true, error: null });
    try {
      const res = await request(
        "/admin/item-option-group-assignments",
        "POST",
        {
          item_id: itemId,
          item_option_group_id: optionGroupId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const updatedItem = res.data; // Laravel returns full updated item
  
      // Replace/update item in list
      const items = get().items || [];
      const index = items.findIndex((i) => i.id === itemId);
  
      if (index !== -1) {
        items[index] = updatedItem;
      } else {
        items.push(updatedItem);
      }
  
      set({ items: [...items], loading: false });
      return updatedItem;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Failed to assign option group",
        loading: false,
      });
      return null;
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
  // Create new option 
  // -------------------------------

  createOptions:async (data) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ loading: true, error: null });
    try {
      const res = await request("/admin/item-options", "POST", data, {
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


  groupAssignmentsForItem: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "No token found. Please log in." });
      return null;
    }

    set({ loading: true, error: null });
    try {
      // Note: no `data` variable passed here (GET request -> null body)
      const res = await request(`/admin/item-option-group-assignments/${id}`, "GET", null, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const payload = res && res.data !== undefined ? res.data : res;
      // store the payload (expected to be the item object with optionGroups or an array)
      set({ groupAssignments: payload, loading: false });

   
      return payload;
    } catch (err) {
      console.error("groupAssignmentsForItem error:", err);
      set({ error: err?.response?.data?.message || err.message || err, loading: false });
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

   // -------------------------------
  // Delete option group assignment
  // -------------------------------
  deleteOptionGroup: async (itemId, groupId) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
  
    set({ loading: true, error: null });
  
    try {
      const body = {
        item_id: itemId,
        item_option_group_id: groupId,
      };
  
      const res = await request(
        `/admin/item-option-group-assignments`,
        "DELETE",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
    
      set({ loading: false });
  
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete option group",
        loading: false,
      });
      return null;
    }
  },
  
}));
