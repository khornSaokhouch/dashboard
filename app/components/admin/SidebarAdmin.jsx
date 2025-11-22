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
import { useLanguageContext } from "../LanguageProviderClient";

export default function Sidebar() {
  const pathname = usePathname();
  const { lang, translations } = useLanguageContext();

  const links = [
    { name: translations.dashboard || "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: translations.users || "Users", href: "/admin/users", icon: UsersIcon },
    { name: translations.shops || "Shops", href: "/admin/shops", icon: ShoppingBagIcon },
    { name: translations.categories || "Categories", href: "/admin/categories", icon: CubeTransparentIcon },
    { name: translations.items || "Items", href: "/admin/items", icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-64 bg-white text-gray-800 min-h-screen p-4 flex flex-col border-r border-gray-100 shadow-xl">
      <div className="flex items-center justify-center mb-10 mt-4">
        <span className={`text-3xl font-extrabold tracking-tight ${lang === "km" ? "khmer-text" : ""}`}>
          <span className="text-gray-800">{translations.admin || "admin"}</span>
        </span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/admin/dashboard");

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200
                    ${isActive
                      ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={`${lang === "km" ? "khmer-text" : ""} text-sm`}>{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`mt-auto text-center text-gray-400 text-xs py-4 border-t border-gray-100 ${lang === "km" ? "khmer-text" : ""}`}>
        &copy; {new Date().getFullYear()} {translations.deliveryApp || "DeliveryApp"}
      </div>
    </aside>
  );
}
