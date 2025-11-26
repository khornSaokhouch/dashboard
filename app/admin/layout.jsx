"use client";

import { useEffect, useState } from "react";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useLanguageContext } from "../components/LanguageProviderClient";
import FontWrapper from "../components/FontWrapper";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const loginWithToken = useAuthStore((state) => state.loginWithToken);

  const { translations } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

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

      if (!token) router.replace("/auth/login");

      if (user && user.role !== "admin") router.replace("/");

      setLoading(false);
    };

    init();
  }, [token, user, isHydrated, loginWithToken, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <ArrowPathIcon className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-xl font-semibold text-gray-600">
          {translations.loadingAdminPanel || "Loading Admin Panel..."}
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <FontWrapper>
      <div className="text-gray-900 antialiased h-screen overflow-hidden flex">
        <aside className={`h-screen fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${open ? "w-64" : "w-20"}`}>
          <SidebarAdmin open={open} setOpen={setOpen} />
        </aside>

        <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${open ? "ml-64" : "ml-20"}`}>
          <header className="sticky top-0 z-40">
            <NavbarAdmin />
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </FontWrapper>
  );
}
