'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./stores/authStore";

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const loginWithToken = useAuthStore((state) => state.loginWithToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!isHydrated) return; // wait until store is hydrated

      if (token && !user) {
        try {
          await loginWithToken(token); // fetch user
        } catch (err) {
          console.error("Token invalid", err);
        }
      }

      if (token) {
        router.replace(user?.role === "admin" ? "/dashboard" : "/shops");
      } else {
        router.replace("/auth/login");
      }

      setLoading(false);
    };

    init();
  }, [isHydrated, token, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return null;
}
