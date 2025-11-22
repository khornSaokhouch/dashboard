'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStore } from '@/app/stores/useShopStore';
import { useAuthStore } from '@/app/stores/authStore';
import ShopForm from '../../../components/ShopForm';
import { ShoppingBagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '@/app/components/LanguageProviderClient';

export default function CreateShopPage() {
  const { lang, translations: t } = useLanguageContext(); // translation context
  const router = useRouter();
  const { createShop, loading } = useShopStore();
  const { user, isHydrated } = useAuthStore();

  const handleSubmit = async (data) => {
    if (!user || !user.id) {
      alert(t.userDataMissing || 'User data missing. Cannot create shop.');
      return;
    }

    try {
      await createShop({ ...data, owner_user_id: user.id });
      alert(t.addShop + ' ' + t.saveChanges); // translated success message
      router.push('/admin/shops');
    } catch (err) {
      console.error('❌ Create failed:', err);
      alert(err.message || t.failedUpdateUser || 'Failed to create shop');
    }
  };

  const handleBack = () => router.push('/admin/shops');

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500 bg-gray-50">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-2" />
        {t.loadingAuth || 'Loading authentication...'}
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="pt-0">
      {/* Header */}
      <header className="mb-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShoppingBagIcon className="h-7 w-7 text-blue-600 mr-2" />
          {t.addShop || 'Create New Shop'}
        </h1>
        <p className="text-gray-500 mt-1">
          {t.fillShopDetails || 'Fill out the details below to register a new shop.'}
        </p>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <ShopForm
          onSubmit={handleSubmit}
          loading={loading}
          onBackClick={handleBack} // back button handler
        />
      </div>
    </div>
  );
}
