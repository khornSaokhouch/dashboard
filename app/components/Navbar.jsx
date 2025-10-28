'use client';

import Link from "next/link";
import { useAuthStore } from "../stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import {
  UserCircleIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";

export default function Navbar() {
  const { user, logout, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isHydrated) {
    return (
      <nav className="bg-white text-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-amber-600">DeliveryApp</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white text-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-amber-600">
          DeliveryApp
        </Link>

        {/* Nav links */}
        <div className="space-x-6 flex items-center">
          <Link
            href="/shops"
            className="text-gray-700 hover:text-amber-600 transition-colors duration-200 hidden md:block"
          >
            Shops
          </Link>

          <Link
            href="/cart"
            className="text-gray-700 hover:text-amber-600 transition-colors duration-200"
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>

          {/* User Menu */}
          {user && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors duration-200">
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden md:inline font-medium">Hello, {user.name}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none z-50">
                {user.role === "admin" && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/dashboard/account"
                        className={`flex items-center space-x-2 px-4 py-2 text-sm ${
                          active ? "bg-amber-50 text-amber-600" : "text-gray-700"
                        }`}
                      >
                        <ShieldCheckIcon className="h-5 w-5" />
                        <span>Admin Account</span>
                      </Link>
                    )}
                  </Menu.Item>
                )}

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`flex w-full items-center space-x-2 px-4 py-2 text-sm text-left ${
                        active ? "bg-red-50 text-red-600" : "text-gray-700"
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
      </div>
    </nav>
  );
}
