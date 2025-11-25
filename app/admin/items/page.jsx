'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useItemStore } from '@/app/stores/useItemStore';
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ItemsTable() {
  const router = useRouter();
  const { items: rawItems = [], fetchItems, deleteItem, loading, error } = useItemStore();

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Normalize payload:
  // - API might return an array directly
  // - or an object like { items: [...] }
  const itemArray = Array.isArray(rawItems) ? rawItems : Array.isArray(rawItems?.items) ? rawItems.items : [];

  // Determine whether API returned grouped data (category + items) or flat items
  const isGrouped =
    Array.isArray(itemArray) &&
    itemArray.length > 0 &&
    typeof itemArray[0] === 'object' &&
    'category' in itemArray[0] &&
    'items' in itemArray[0];

  // Delete modal helpers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem(deleteId);
      setShowDelete(false);
      alert('Item deleted successfully.');
    } catch (err) {
      alert('Failed to delete item: ' + (err?.message || err));
    }
  };

 
  const formatPrice = (item) => {
    if (!item) return "—";
  
    // CASE 1 — price is a string like "230.00" BUT actually means cents
    if (item.price !== undefined && item.price !== null && item.price !== "") {
      const raw = parseFloat(item.price);
      if (Number.isFinite(raw)) {
        const cents = Math.round(raw);        // "230.00" -> 230
        return (cents / 100).toFixed(2);      // 230 -> "2.30"
      }
      return String(item.price);
    }
  
    // CASE 2 — fallback: price_cents integer
    if (
      item.price_cents !== undefined &&
      item.price_cents !== null &&
      String(item.price_cents).trim() !== ""
    ) {
      const cents = Number(item.price_cents);
      return Number.isFinite(cents)
        ? (cents / 100).toFixed(2)
        : String(item.price_cents);
    }
  
    return "—";
  };

  const handleToggle = (id) => {
    // update the item in your state
    setData(prev =>
      prev.map(it =>
        it.id === id
          ? { ...it, is_available: !it.is_available }
          : it
      )
    );
  };
  
  

  return (
    <div className="p-8">
      {/* Header and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Items Management</h1>

        <div className="flex gap-2">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition disabled:opacity-60"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => router.push('/admin/items/create')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* States */}
      {loading && <p className="text-gray-500 text-center">Loading items...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* No items */}
      {!loading && (!itemArray || (Array.isArray(itemArray) && itemArray.length === 0)) && (
        <p className="text-gray-500 text-center">No items found.</p>
      )}

      {/* Table */}
      {!loading && Array.isArray(itemArray) && itemArray.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Shop ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Available</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Display Order</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated At</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* GROUPED MODE: iterate categories then items */}
              {isGrouped &&
                itemArray.map((group, gIndex) => (
                  <Fragment key={`group-${group.category?.id ?? gIndex}`}>
                    {/* category header row */}
                    <tr className="bg-gray-100">
                      <td colSpan={12} className="px-4 py-2 text-sm font-semibold text-gray-800">
                        <div className="flex items-center gap-3">
                          {group.category?.image_url ? (
                            <Image
                              src={group.category.image_url}
                              alt={group.category?.name ?? 'Category'}
                              className="w-8 h-8 rounded object-cover"
                              width={32}
                              height={32}
                              unoptimized={true}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded" />
                          )}
                          <span>{group.category?.name ?? 'Category'}</span>
                        </div>
                      </td>
                    </tr>

                    {/* items */}
                    {Array.isArray(group.items) &&
                      group.items.map((item, idx) => (
                        <tr key={`item-${item.id ?? `${gIndex}-${idx}`}`}>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.id ?? '-'}</td>

                          {/* Shop ID (may not exist in grouped payload) */}
                          <td className="px-4 py-2 text-sm text-gray-600">{item.shop_id ?? '-'}</td>

                          <td className="px-4 py-2 text-sm text-gray-600">{group.category?.name ?? '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">{item.name ?? '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.description ?? '—'}</td>

                          <td className="px-4 py-2 text-sm text-gray-600">{formatPrice(item)}</td>

                          <td className="px-4 py-2 text-sm text-gray-600">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name ?? 'Item'}
                                width={80}
                                height={80}
                                className="h-10 w-10 object-cover rounded"
                                unoptimized={true}
                              />
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-600">
                            {(item.is_available === 1 || item.is_available === true) ? 'Yes' : 'No'}
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-600">{item.display_order ?? '—'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.created_at ?? '—'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.updated_at ?? '—'}</td>

                          <td className="px-4 py-2 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/admin/items/edit/${item.id}`)}
                                className="text-blue-500 hover:text-blue-700 transition"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDeleteClick(item.id)} className="text-red-500 hover:text-red-700 transition">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))}

              {/* FLAT MODE: items is an array of items */}
              {!isGrouped &&
                itemArray.map((item, index) => (
                  <tr key={item.id ?? `item-${index}`}>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.id ?? '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.shop_id ?? '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.category?.name ?? '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{item.name ?? '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.description ?? '—'}</td>

                    <td className="px-4 py-2 text-sm text-gray-600">{formatPrice(item)}</td>

                    <td className="px-4 py-2 text-sm text-gray-600">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name ?? 'Item'}
                          width={80}
                          height={80}
                          className="h-10 w-10 object-cover rounded"
                          unoptimized={true}
                        />
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-600">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.is_available === 1 || item.is_available === true}
                        onChange={() => handleToggle(item.id)}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                      <div className="absolute w-5 h-5 bg-white rounded-full left-0.5 top-0.5 peer-checked:translate-x-5 transition-all"></div>
                    </label>
                  </td>


                    <td className="px-4 py-2 text-sm text-gray-600">{item.display_order ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.created_at ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.updated_at ?? '—'}</td>

                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/items/edit/${item.id}`)}
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(item.id)} className="text-red-500 hover:text-red-700 transition">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this item?</p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
