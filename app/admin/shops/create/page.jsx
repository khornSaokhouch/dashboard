'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStore } from '@/app/stores/useShopStore';
import { useAuthStore } from '@/app/stores/authStore';
import ShopForm from '../../../components/ShopForm';

export default function CreateShopPage() {
  const router = useRouter();
  const { createShop, loading } = useShopStore();
  const { user, isHydrated } = useAuthStore();

  const handleSubmit = async (data) => {
    await createShop({ ...data, owner_user_id: user.id });
    alert('Shop created successfully!');
    router.push('/admin/shops');
  };
  

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading user...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Shop</h1>
      <ShopForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
