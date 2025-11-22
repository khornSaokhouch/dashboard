'use client';

import Link from "next/link";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment, useState } from "react";
import { useLanguageContext } from "../LanguageProviderClient";

// Framer Motion dropdown variants
const dropdownVariants = {
  initial: { opacity: 0, y: -10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } },
};

export default function NavbarAdmin() {
  const { user, logout, isHydrated } = useAuthStore();
  const router = useRouter();
  const { lang, translations, toggleLanguage } = useLanguageContext();

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!isHydrated) {
    return (
      <nav className="bg-white text-gray-800 shadow-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <span className={`text-2xl font-bold text-blue-600 ${lang === 'km' ? 'khmer-text' : ''}`}>
            {translations.appName}
          </span>
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 bg-white text-gray-800 shadow-lg border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className={`text-2xl font-extrabold text-blue-600 hover:text-blue-700 transition duration-150 tracking-tight ${lang === 'km' ? 'khmer-text' : ''}`}
          >
            {translations.appName}
          </Link>

          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              {lang.toUpperCase()}
            </button>

            {/* Profile Dropdown */}
            {user && (
              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <UserCircleIcon className="h-6 w-6 text-blue-500" />
                      <span className={`hidden md:inline text-sm font-semibold ${lang === 'km' ? 'khmer-text' : ''}`}>
                        {user.name}
                      </span>
                    </Menu.Button>

                    <AnimatePresence>
                      {open && (
                        <Menu.Items
                          as={motion.div}
                          static
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={dropdownVariants}
                          className="absolute right-0 mt-3 w-52 bg-white text-gray-700 rounded-xl shadow-2xl border border-gray-50 overflow-hidden origin-top-right z-50"
                        >
                          <div className="p-2">
                            <div className="p-2 border-b border-gray-100 mb-1">
                              <p className={`text-sm font-semibold text-gray-900 truncate ${lang === 'km' ? 'khmer-text' : ''}`}>{user.email}</p>
                              <p className={`text-xs text-gray-500 ${lang === 'km' ? 'khmer-text' : ''}`}>{user.role.toUpperCase()}</p>
                            </div>

                            {/* Account Link */}
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/admin/account"
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition duration-100 ${
                                    active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                                  } ${lang === 'km' ? 'khmer-text' : ''}`}
                                >
                                  <ShieldCheckIcon className="h-5 w-5" />
                                  <span>{translations.myAccount}</span>
                                </Link>
                              )}
                            </Menu.Item>

                            <div className="border-t border-gray-100 my-2" />

                            {/* Logout Button */}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => setIsLogoutOpen(true)}
                                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition duration-100 ${
                                    active ? "bg-red-50 text-red-600 font-medium" : "text-gray-700"
                                  } ${lang === 'km' ? 'khmer-text' : ''}`}
                                >
                                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                  <span>{translations.logout}</span>
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </Menu>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Transition appear show={isLogoutOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsLogoutOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${lang === 'km' ? 'khmer-text' : ''}`}>
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {translations.logoutConfirmTitle || "Confirm Logout"}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {translations.logoutConfirmMessage || "Are you sure you want to logout?"}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => setIsLogoutOpen(false)}
                    >
                      {translations.cancel || "Cancel"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                      onClick={handleLogout}
                    >
                      {translations.logout || "Logout"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
