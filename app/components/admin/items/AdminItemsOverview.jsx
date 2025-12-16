// app/components/admin/items/AdminItemsOverview.jsx
'use client';

import CreateItemModal from '@/app/components/admin/items/CreateItemModal';
import EditItemModal from '@/app/components/admin/items/EditItemModal';
import ItemsTable from '@/app/components/admin/items/ItemsTable';
import DeleteItemModal from '@/app/components/admin/items/DeleteItemModal';
import { useToast } from '@/app/components/ToastNotification';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useItemStore } from '@/app/stores/useItemStore';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function AdminItemsOverview() {
  const showToast = useToast();

  const {
    items: rawItems = [],
    fetchItems,
    deleteItem,
    updateItem,
    loading,
    error,
    success,
    clearStatus,
  } = useItemStore();

  const { categories, fetchCategories } = useCategoryStore();

  // Modal States
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Filter States
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

  useEffect(() => {
    if (success) { showToast(success, 'success'); clearStatus(); }
    if (error) { showToast(error, 'error'); clearStatus(); }
  }, [success, error, clearStatus, showToast]);

  // Safe data access
  const itemArray = Array.isArray(rawItems)
    ? rawItems
    : Array.isArray(rawItems?.items)
    ? rawItems.items
    : [];

  // --- 🛠️ FIX STARTS HERE ---
  const handleDeleteClick = (id) => {
    // 1. Flatten the array so we can find the item even if it's inside a Category group
    const flatList = itemArray.flatMap(item => item.items ? item.items : item);
    
    // 2. Find the item
    const item = flatList.find((i) => i.id === id);

    if (item) {
        setDeleteId(id);
        setSelectedItem(item);
        setShowDelete(true);
    } else {
        console.error("Could not find item with ID:", id);
    }
  };
  // --- 🛠️ FIX ENDS HERE ---

  const handleDeleteItem = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteItem(deleteId);
      setShowDelete(false);
      setDeleteId(null);
      setSelectedItem(null);
      fetchItems({ query, categoryId: filterCategoryId, sortBy });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (id, currentValue) => {
    setTogglingId(id);
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      const formData = new FormData();
      formData.append('is_available', String(newValue));
      await updateItem(id, formData);
      fetchItems({ query, categoryId: filterCategoryId, sortBy });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your menu items, prices, and availability.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchItems({ query, categoryId: filterCategoryId, sortBy })}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateItemModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-5 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
            type="search"
            className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
        </div>

        <div className="md:col-span-4">
            <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            >
            <option value="">All Categories</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            </select>
        </div>

        <div className="md:col-span-3">
            <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low-High)</option>
            <option value="price-desc">Price (High-Low)</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <ItemsTable
        itemArray={itemArray}
        loading={loading}
        handleDeleteClick={handleDeleteClick}
        setEditingItemId={setEditingItemId}
        setShowEditItemModal={setShowEditItemModal}
        handleToggle={handleToggle}
        togglingId={togglingId}
      />

      {/* Modals */}
      <CreateItemModal
        isOpen={showCreateItemModal}
        onClose={() => setShowCreateItemModal(false)}
        onSuccess={() => fetchItems({ query, categoryId: filterCategoryId, sortBy })}
      />

      {editingItemId && (
        <EditItemModal
          isOpen={showEditItemModal}
          itemId={editingItemId}
          onClose={() => { setShowEditItemModal(false); setEditingItemId(null); }}
          onSuccess={() => fetchItems({ query, categoryId: filterCategoryId, sortBy })}
        />
      )}

      {/* Delete Modal */}
      <DeleteItemModal
        isOpen={showDelete}
        itemToDelete={selectedItem}
        loading={deleteLoading}
        onDelete={handleDeleteItem} // Pass the function directly
        onClose={() => {
            if (!deleteLoading) {
                setShowDelete(false);
                setSelectedItem(null);
            }
        }}
      />
    </div>
  );
}