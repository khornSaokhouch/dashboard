'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CubeTransparentIcon,
  RectangleStackIcon, // Better for Items
  AdjustmentsHorizontalIcon,
  SwatchIcon, // Better for Options/Variants
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useLanguageContext } from "../LanguageProviderClient";

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const { lang, translations } = useLanguageContext();

  const links = [
    { 
      name: translations.dashboard || "Dashboard", 
      href: "/admin/dashboard", 
      icon: HomeIcon 
    },
    { 
      name: translations.users || "Users", 
      href: "/admin/users", 
      icon: UsersIcon 
    },
    { 
      name: translations.shops || "Shops", 
      href: "/admin/shops", 
      icon: ShoppingBagIcon 
    },
    { 
      name: translations.categories || "Categories", 
      href: "/admin/categories", 
      icon: CubeTransparentIcon 
    },
    { 
      name: translations.items || "Items", 
      href: "/admin/items", 
      icon: RectangleStackIcon // Changed from Cog
    },
    { 
      name: translations.optionsgroups || "Option Groups", 
      href: "/admin/options-groups", 
      icon: AdjustmentsHorizontalIcon 
    },
    { 
      name: translations.settings || "Options", 
      href: "/admin/options", 
      icon: SwatchIcon // Changed from Cog
    },
  ];

  return (
    <aside 
      className={`
        bg-white text-slate-800 min-h-screen flex flex-col 
        border-r border-gray-200 shadow-sm relative 
        transition-all duration-300 ease-in-out z-20
        ${open ? "w-72" : "w-20"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          absolute -right-3 top-8 w-7 h-7 
          bg-white border border-gray-200 rounded-full 
          flex items-center justify-center text-gray-500 
          hover:text-indigo-600 hover:border-indigo-600 hover:shadow-md
          transition-all duration-300 focus:outline-none z-50
          ${!open ? "rotate-180" : ""}
        `}
      >
        <ChevronLeftIcon className="h-4 w-4" strokeWidth={2.5} />
      </button>

      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b border-gray-100">
        <div className={`transition-all duration-300 ${open ? "opacity-100" : "opacity-0 hidden"}`}>
             <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Admin<span className="font-light text-slate-600">Panel</span>
             </span>
        </div>
        <div className={`transition-all duration-300 absolute ${!open ? "opacity-100" : "opacity-0"}`}>
             <span className="text-2xl font-bold text-indigo-600">A</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            
            // Logic: Exact match OR starts with href + '/' (to handle sub-pages like /items/edit/1)
            // This prevents /admin/options-groups from highlighting when on /admin/options
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    relative flex items-center px-3 py-2.5 rounded-lg group
                    transition-all duration-200
                    ${isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                    } 
                    ${open ? "justify-start" : "justify-center"}
                  `}
                >
                  <Icon 
                    className={`
                      h-6 w-6 flex-shrink-0 transition-colors
                      ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}
                    `} 
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  
                  <span 
                    className={`
                      ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300
                      ${lang === "km" ? "khmer-text" : ""}
                      ${open ? "w-auto opacity-100" : "w-0 opacity-0 hidden"}
                    `}
                  >
                    {link.name}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {!open && (
                    <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-900 text-white text-xs font-bold opacity-0 -translate-x-3 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap drop-shadow-lg">
                      {link.name}
                      {/* Little triangle pointer */}
                      <div className="absolute top-1/2 left-0 -ml-1 -mt-1 w-2 h-2 bg-indigo-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-100 transition-all duration-300 ${!open && "hidden"}`}>
         <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className={`text-xs text-slate-400 font-medium ${lang === "km" ? "khmer-text" : ""}`}>
              &copy; {new Date().getFullYear()} DeliveryApp
            </p>
            <p className="text-[10px] text-slate-300 mt-0.5">v1.0.2</p>
         </div>
      </div>
    </aside>
  );
}