'use client';

import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Import your language context
import { useLanguageContext } from '../../components/LanguageProviderClient';

export default function AccountPage() {
  const { user, logout, isHydrated } = useAuthStore();
  const router = useRouter();
  const { translations } = useLanguageContext(); // ✅ use translations

  useEffect(() => {
    if (isHydrated && !user) router.push('/auth/login');
  }, [user, router, isHydrated]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500 bg-gray-50">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-2" />
        {translations.loading || 'Loading profile...'}
      </div>
    );
  }

  return (
    <div className="pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center border-b border-gray-200 pb-4">
          <UserCircleIcon className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {translations.myAccount || 'My Account'}
            </h1>
            <p className="text-gray-500">
              {translations.manageProfile || 'Manage your profile and security settings.'}
            </p>
          </div>
        </header>

        {/* Basic Details */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {translations.basicDetails || 'Basic Details'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {translations.fullName || 'Full Name'}
                </h3>
              </div>
              <p className="mt-2 text-xl font-bold text-blue-600">{user.name}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-6 w-6 text-gray-800" />
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {translations.emailAddress || 'Email Address'}
                </h3>
              </div>
              <p className="mt-2 text-xl font-bold text-gray-800">{user.email || 'N/A'}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6" />
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {translations.systemRole || 'System Role'}
                </h3>
              </div>
              <p
                className={`mt-2 text-xl font-bold ${
                  user.role.toLowerCase() === 'admin' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {user.role.toUpperCase()}
              </p>
            </div>
          </div>
        </section>

        {/* Actions & Security */}
        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {translations.actionsSecurity || 'Actions & Security'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {translations.securitySettings || 'Security Settings'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {translations.updatePassword || 'Update your password or configure two-factor authentication.'}
              </p>
              <Link
                href="/admin/account/settings"
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50 transition"
              >
                {translations.goToSettings || 'Go to Settings'}
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {translations.sessionManagement || 'Session Management'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {translations.logoutDescription || 'End your current session securely.'}
              </p>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                {translations.logout || 'Logout'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
