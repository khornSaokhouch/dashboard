"use client";

import { useEffect, useState } from "react";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const loginWithToken = useAuthStore((state) => state.loginWithToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!isHydrated) return;

      if (token && !user) {
        try {
          await loginWithToken(token);
        } catch (err) {
          console.error("Token invalid or expired", err);
        }
      }

      if (!token) {
        router.replace("/auth/login");
      }

      setLoading(false);
    };

    init();
  }, [token, user, isHydrated, loginWithToken, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 font-sans antialiased h-screen overflow-hidden flex">
      {/* Sidebar always shown */}
      <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 bottom-0 z-50">
        <SidebarAdmin />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden ml-64">
        <div className="sticky top-0 z-40">
          <NavbarAdmin />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
