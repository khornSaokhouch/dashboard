'use client';

import { useEffect, useState } from 'react';
import { useShopStore } from '@/app/stores/useShopStore';
import { useRouter } from 'next/navigation';
import { TrashIcon, PencilSquareIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ShopsTable() {
  const router = useRouter();
  const { shops, fetchShops, deleteShop, loading, error } = useShopStore();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteShop(deleteId);
      alert('Shop deleted successfully.');
    } catch (err) {
      alert(err?.message || 'Failed to delete shop.');
    } finally {
      setShowDelete(false);
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shops Management</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchShops}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push('/admin/shops/create')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add Shop
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-500 text-center">Loading shops...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {!loading && shops.length === 0 && <p className="text-gray-500 text-center">No shops found.</p>}

      {!loading && shops.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map((shop, index) => (
                <tr key={shop.id ?? index}>
                  <td className="px-4 py-2 text-sm text-gray-700">{shop.id ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{shop.name ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{shop.location ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{shop.status ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{shop.owner_user_id ?? '—'}</td>
                  <td className="px-4 py-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/admin/shops/edit/${shop.id}`)}
                      aria-label="Edit shop"
                      className="text-blue-500 hover:text-blue-700 transition"
                    >
                      <PencilSquareIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(shop.id)}
                      aria-label="Delete shop"
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this shop?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
