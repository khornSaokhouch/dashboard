'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useShopStore } from '@/app/stores/useShopStore';
import ShopForm from '../../../../components/ShopForm';
import { ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '@/app/components/LanguageProviderClient';

export default function EditShopPage() {
  const { lang, translations: t } = useLanguageContext(); // get translations
  const router = useRouter();
  const params = useParams();
  const shopId = params.id;

  const { shops, fetchShops, updateShop, loading } = useShopStore();

  useEffect(() => {
    if (!shops || shops.length === 0) {
      fetchShops();
    }
  }, [shops, fetchShops]);

  const shop = shops.find((s) => s.id?.toString() === shopId?.toString());

  const handleSubmit = async (data) => {
    if (!shopId) return;

    try {
      await updateShop(shopId, data);
      alert(`${t.editShop} ${t.saveChanges}`); // translated success message
      router.push('/admin/shops');
    } catch (err) {
      console.error('❌ Update failed:', err);
      alert(err.message || t.failedUpdateUser || 'Failed to update shop');
    }
  };

  const handleBack = () => router.push('/admin/shops');

  if (loading || (shopId && !shop)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500 bg-gray-50">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-2" />
        {loading ? t.fetchingShops : `${t.editShop}...`}
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">404</h1>
        <p className="text-gray-600 mt-2">
          {t.editShop} {t.notFound || 'not found'}.
        </p>
        <button
          onClick={handleBack}
          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; {t.goBack || 'Go back'}
        </button>
      </div>
    );
  }

  return (
    <div className="pt-0">
      {/* Header */}
      <header className="mb-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <PencilSquareIcon className="h-7 w-7 text-blue-600 mr-2" />
          {t.editShop}: <span className="ml-2 text-blue-700">{shop.name}</span>
        </h1>
        <p className="text-gray-500 mt-1">{t.modifyShopDetails || 'Modify the shop details below.'}</p>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
        <ShopForm
          initialData={shop}
          onSubmit={handleSubmit}
          loading={loading}
          onBackClick={handleBack}
        />
      </div>
    </div>
  );
}
