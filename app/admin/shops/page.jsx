'use client';

import { useEffect, useState } from 'react';
import { useShopStore } from '@/app/stores/useShopStore';
import { useRouter } from 'next/navigation';
import { 
    TrashIcon, 
    PencilSquareIcon, 
    PlusIcon, 
    ArrowPathIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useLanguageContext } from '../../components/LanguageProviderClient';

export default function ShopsTable() {
  const router = useRouter();
  const { shops, fetchShops, deleteShop, loading, error } = useShopStore();
  const { translations } = useLanguageContext();

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const shopToDelete = shops.find(s => s.id === deleteId);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteShop(deleteId);
      fetchShops();
    } catch (err) {
      alert(err?.message || translations.deleteFailed || 'Failed to delete shop.');
    } finally {
      setShowDelete(false);
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShoppingBagIcon className="h-7 w-7 text-blue-600 mr-2" />
          {translations.shopManagement || 'Shop Management'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchShops}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {translations.refresh || 'Refresh'}
          </button>

          <button
            onClick={() => router.push('/admin/shops/create')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            {translations.addShop || 'Add Shop'}
          </button>
        </div>
      </div>

      {loading && <p className="text-blue-500 text-center py-8 flex items-center justify-center">
        <ArrowPathIcon className="h-6 w-6 animate-spin mr-2" /> {translations.fetchingShops || 'Fetching shops...'}
      </p>}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-4">
          <p className="font-semibold">{translations.error || 'Error'}:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && shops.length === 0 && !error && (
        <p className="text-gray-500 text-center mt-12 text-lg">{translations.noShops || 'No shops found. Start by adding one!'}</p>
      )}

      {!loading && shops.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.name || 'Name'}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.location || 'Location'}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.status || 'Status'}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.ownerId || 'Owner ID'}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shops.map((shop, index) => (
                  <tr key={shop.id ?? index} className="hover:bg-blue-50/50 transition duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{shop.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shop.location ?? '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(shop.status || 'inactive')}`}>
                        {shop.status || translations.inactive || 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shop.owner_user_id ?? '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => router.push(`/admin/shops/edit/${shop.id}`)}
                          aria-label={translations.editShop || 'Edit Shop'}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition duration-150"
                          title={translations.editShop || 'Edit Shop'}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(shop.id)}
                          aria-label={translations.deleteShop || 'Delete Shop'}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition duration-150"
                          title={translations.deleteShop || 'Delete Shop'}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDelete && shopToDelete && (
        <div className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{translations.deleteShop || 'Delete Shop'}</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {translations.confirmDeleteMessage || 'Are you sure you want to delete'} <span className="font-bold text-red-600">{shopToDelete.name}</span>? {translations.thisCannotBeUndone || 'This action is irreversible.'}
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 rounded-lg transition"
                disabled={actionLoading}
              >
                {translations.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition disabled:bg-red-400 flex items-center gap-2"
              >
                {actionLoading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
                {translations.deletePermanently || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
