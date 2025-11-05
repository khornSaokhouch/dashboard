"use client";

import Link from "next/link";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";

export default function NavbarOwner() {
  const { user, logout, isHydrated } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!isHydrated) {
    return (
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-amber-500">DeliveryApp</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 text-white shadow-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-amber-500 hover:text-amber-400 transition"
        >
          DeliveryApp
        </Link>

        {/* Profile Dropdown */}
        {user && (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-xl hover:bg-gray-700 transition">
              <UserCircleIcon className="h-6 w-6 text-amber-500" />
              <span className="hidden md:inline text-sm font-medium">
                {user.name}
              </span>
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-3 w-52 bg-white text-gray-700 rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/owner/account"
                    className={`flex items-center gap-2 px-4 py-2 text-sm ${
                      active ? "bg-amber-50 text-amber-600" : ""
                    }`}
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>My Account</span>
                  </Link>
                )}
              </Menu.Item>

              <div className="border-t border-gray-200 my-1" />

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${
                      active ? "bg-red-50 text-red-600" : ""
                    }`}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )}
      </div>
    </nav>
  );
}
