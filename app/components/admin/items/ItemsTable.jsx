// app/components/admin/items/ItemsTable.jsx
'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ItemRowSkeleton from '@/app/components/admin/items/ItemRowSkeleton';

export default function ItemsTable({
  itemArray,
  loading,
  query,
  filterCategoryId,
  sortBy,
  fetchItems,
  handleDeleteClick,
  setEditingItemId,
  setShowEditItemModal,
  handleToggle,
  togglingId,
}) {
  const router = useRouter();

  const isGrouped =
    Array.isArray(itemArray) &&
    itemArray.length > 0 &&
    typeof itemArray[0] === 'object' &&
    'category' in itemArray[0] &&
    'items' in itemArray[0];

  const formatPrice = (item) => {
    if (!item) return '—';

    if (item.price !== undefined && item.price !== null && item.price !== '') {
      const raw = parseFloat(item.price);
      if (Number.isFinite(raw)) {
        const cents = Math.round(raw);
        return (cents / 100).toFixed(2);
      }
      return String(item.price);
    }

    if (
      item.price_cents !== undefined &&
      item.price_cents !== null &&
      String(item.price_cents).trim() !== ''
    ) {
      const cents = Number(item.price_cents);
      return Number.isFinite(cents) ? (cents / 100).toFixed(2) : String(item.price_cents);
    }

    return '—';
  };

  const goDetail = (id) => {
    router.push(`/admin/items/detail/${id}`);
  };

  return (
    <>
      {loading ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Available</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Display Order</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated At</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => <ItemRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      ) : (!itemArray || (Array.isArray(itemArray) && itemArray.length === 0)) ? (
        <p className="text-gray-500 text-center">No items found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Available</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Display Order</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated At</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* GROUPED MODE */}
              {isGrouped &&
                itemArray.map((group, gIndex) => (
                  <Fragment key={`group-${gIndex + 1}`}>
                    <tr className="bg-gray-100">
                      <td colSpan={11} className="px-4 py-2 text-sm font-semibold text-gray-800">
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

                    {Array.isArray(group.items) &&
                      group.items.map((item, idx) => (
                        <tr key={idx + 1}>
                          <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>

                          <td className="px-4 py-2 text-sm text-gray-600">{group.category?.name ?? '-'}</td>
                          <td
                            className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:underline"
                            onClick={() => goDetail(item.id)}
                          >
                            {item.name ?? '-'}
                          </td>

                          <td className="px-4 py-2 text-sm">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={item.is_available === 1 || item.is_available === true}
                                onChange={() => handleToggle(item.id, item.is_available)}
                                disabled={togglingId === item.id}
                              />

                              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition"></div>
                              <div className="absolute w-5 h-5 bg-white rounded-full shadow left-0.5 top-0.5 peer-checked:translate-x-5 transition"></div>
                            </label>
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-600">{item.display_order ?? '—'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.created_at ?? '—'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.updated_at ?? '—'}</td>

                          <td className="px-4 py-2 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setShowEditItemModal(true);
                                }}
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

            {/* FLAT MODE */}
              {!isGrouped &&
                itemArray.map((item, index) => (
                  <tr key={item.id ?? `item-${index}`}>
                    <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.category?.name ?? '-'}</td>
                    <td
                      className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:underline"
                      onClick={() => router.push(`/admin/items/detail/${item.id}`)}
                    >
                      {item.name ?? '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{formatPrice(item)}</td>

                    <td className="px-4 py-2 text-sm text-gray-600">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.is_available === 1 || item.is_available === true}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggle(item.id, item.is_available);
                          }}
                          disabled={togglingId === item.id}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                        <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
                      </label>
                    </td>

                    <td className="px-4 py-2 text-sm text-gray-600">{item.display_order ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.created_at ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.updated_at ?? '—'}</td>

                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemId(item.id);
                            setShowEditItemModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition"
                          aria-label={`Edit ${item.name}`}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition"
                          aria-label={`Delete ${item.name}`}
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
      )}
    </>
  );
}