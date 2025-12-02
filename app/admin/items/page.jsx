'use client';

import CreateItemModal from '@/app/components/admin/items/CreateItemModal';
import EditItemModal from '@/app/components/admin/items/EditItemModal';
import { useToast } from '@/app/components/ToastNotification';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useItemStore } from '@/app/stores/useItemStore';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

export default function ItemsTable() {
  const router = useRouter();
  const showToast = useToast();

  // NOTE: include updateItem from the store so handleToggle can call it
  const {
    items: rawItems = [],
    fetchItems,
    deleteItem,
    updateItem, // <-- added
    loading,
    error,
  } = useItemStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // New state for search, filter, sort
  const [query, setQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems({ query, categoryId: filterCategoryId, sortBy });
    }, 500);

    return () => clearTimeout(handler);
  }, [fetchItems, query, filterCategoryId, sortBy]);

  // Normalize payload:
  const itemArray = Array.isArray(rawItems) ? rawItems : Array.isArray(rawItems?.items) ? rawItems.items : [];

  const isGrouped =
    Array.isArray(itemArray) &&
    itemArray.length > 0 &&
    typeof itemArray[0] === 'object' &&
    'category' in itemArray[0] &&
    'items' in itemArray[0];

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem(deleteId);
      setShowDelete(false);
      showToast('Item deleted successfully.', 'success');
      // refresh list
      fetchItems({ query, categoryId: filterCategoryId, sortBy });
    } catch (err) {
      showToast('Failed to delete item: ' + (err?.message || err), 'error');
    }
  };

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

  // -- FIXED handleToggle --
  const handleToggle = async (id, currentValue) => {
    setTogglingId(id);
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      const formData = new FormData();
      formData.append('is_available', String(newValue));

      if (typeof updateItem === 'function') {
        // Preferred: call store's updateItem
        await updateItem(id, formData);
      } else {
        // Fallback: if updateItem isn't available, try to POST/PUT using fetch (optional)
        // Here we just refresh the items so UI reflects server state if the store handles updates elsewhere
        console.warn('updateItem not available on useItemStore — calling fetchItems as fallback');
      }

      showToast('Availability updated', 'success');

      // refresh items from server so UI is consistent with backend
      await fetchItems({ query, categoryId: filterCategoryId, sortBy });
    } catch (error) {
      console.error('Toggle update failed', error);
      showToast('Failed to update availability', 'error');
    } finally {
      setTogglingId(null);
    }
  };
  // -- end handleToggle --
  
  const goDetail = (id) => {
    router.push(`/admin/items/detail/${id}`); // CHANGE IF NEEDED
  };


  return (
    <div className="p-8">
      {/* Header and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Items Management</h1>

        <div className="flex gap-2">
          <button
            onClick={() => fetchItems({ query, categoryId: filterCategoryId, sortBy })}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition disabled:opacity-60"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateItemModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full mb-6">
        {/* Search Bar */}
        <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm w-full md:w-72">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="search"
            className="w-full outline-none text-sm"
            placeholder="Search items by name or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filter by Category dropdown */}
        <select
          className="w-full md:w-48 border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Sort by dropdown */}
        <select
          className="w-full md:w-48 border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low-High)</option>
          <option value="price-desc">Price (High-Low)</option>
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
        </select>
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
                            e.stopPropagation();                  // prevent row click
                            handleToggle(item.id, item.is_available);
                          }}
                          disabled={togglingId === item.id}
                          onClick={(e) => e.stopPropagation()}   // extra safety
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
                            e.stopPropagation();                    // prevent row navigation
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
                            e.stopPropagation();                    // prevent row navigation
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

      <CreateItemModal
        isOpen={showCreateItemModal}
        onClose={() => setShowCreateItemModal(false)}
        onSuccess={fetchItems}
      />
      <EditItemModal
        isOpen={showEditItemModal}
        onClose={() => {
          setShowEditItemModal(false);
          setEditingItemId(null);
        }}
        itemId={editingItemId}
        onSuccess={fetchItems}
      />
    </div>
  );
}
