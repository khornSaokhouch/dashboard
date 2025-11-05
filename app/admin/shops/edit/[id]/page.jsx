'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useShopStore } from '@/app/stores/useShopStore';
import ShopForm from '../../../../components/ShopForm';

export default function EditShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id;
  const { shops, fetchShops, updateShop, loading } = useShopStore();

  useEffect(() => {
    if (!shops || shops.length === 0) fetchShops();
  }, [shops, fetchShops]);

  const shop = shops.find((s) => s.id.toString() === shopId?.toString());

  const handleSubmit = async (data) => {
    // console.log('Submitting shop update', { shopId, data }); // <-- log input
    try {
      await updateShop(shopId, data);
      // console.log('Shop updated successfully'); // <-- log success
      alert('Shop updated successfully!');
      router.push('/admin/shops');
    } catch (err) {
      // console.error('Failed to update shop', err); // <-- log error
      alert(err.message || 'Failed to update shop');
    }
  };
  
  if (loading || !shop) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading shop...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Shop</h1>
      <ShopForm initialData={shop} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
