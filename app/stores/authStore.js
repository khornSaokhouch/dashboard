import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { request } from "../util/request";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isHydrated: false, // flag to indicate store hydration

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await request("/login", "POST", { login: email, password });
          const { user, token } = res;
          if (!user || !token) throw new Error("Invalid login response");
          set({ user, token });
          return { user, token };
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || "Login failed";
          set({ error: msg });
          throw new Error(msg);
        } finally {
          set({ loading: false });
        }
      },

      loginWithToken: async (token) => {
        set({ loading: true });
        try {
          set({ token });
          const res = await request("/profile", "GET", null, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res?.user) throw new Error("Failed to fetch user");
          set({ user: res.user });
          return res.user;
        } catch (err) {
          set({ user: null, token: null });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await request("/logout", "POST", null, {
            headers: { Authorization: `Bearer ${get().token}` },
          });
        } catch (err) {
          console.warn("Server logout failed");
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage), // persist in localStorage
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true; // mark hydrated
      },
    }
  )
);
