'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CubeTransparentIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Users", href: "/admin/users", icon: UsersIcon },
    { name: "Shops", href: "/admin/shops", icon: ShoppingBagIcon },
    { name: "Category", href: "/admin/categories", icon: CubeTransparentIcon },
    { name: "Items", href: "/admin/items", icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col shadow-lg">
      <div className="flex items-center justify-center mb-8 mt-2">
        <img src="/images/logo.png" alt="Delivery App Logo" className="h-16 w-auto object-contain" />
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
                    ${isActive
                      ? "bg-amber-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto text-center text-gray-500 text-sm py-4">
        &copy; {new Date().getFullYear()} DeliveryApp
      </div>
    </aside>
  );
}