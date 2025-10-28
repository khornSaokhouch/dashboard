'use client';

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";

export default function RootLayout({ children }) {
  const pathname = usePathname();
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
          await loginWithToken(token); // repopulate user after refresh
        } catch (err) {
          console.error("Token invalid or expired", err);
        }
      }

      if (!token) {
        router.replace("/auth/login"); // redirect if no token
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

  // Show Sidebar only on admin routes AND if user is admin
  const isAdminPath = pathname?.startsWith("/dashboard") && user?.role === "admin";

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 font-sans antialiased h-screen overflow-hidden">
        <div className="flex h-screen w-screen">
          {/* Sidebar - Fixed and full height */}
          {isAdminPath && (
            <aside className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 bottom-0 z-50">
              <Sidebar />
            </aside>
          )}

          {/* Main content area (takes up remaining width) */}
          <div
            className={`flex flex-col flex-1 h-screen overflow-hidden ${
              isAdminPath ? "ml-64" : ""
            }`}
          >
            {/* Navbar fixed to top (right side of page) */}
            <div className="sticky top-0 z-40">
              <Navbar />
            </div>

            {/* Scrollable content below navbar */}
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
