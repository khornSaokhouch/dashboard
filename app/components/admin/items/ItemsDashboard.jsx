// app/components/admin/items/ItemsDashboard.jsx
'use client';

import CreateItemModal from '@/app/components/admin/items/CreateItemModal';
import EditItemModal from '@/app/components/admin/items/EditItemModal';
import ItemsTable from '@/app/components/admin/items/ItemsTable';
import { useToast } from '@/app/components/ToastNotification';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useItemStore } from '@/app/stores/useItemStore';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DeleteItemModal from '@/app/components/admin/items/DeleteItemModal';

export default function ItemsDashboard() {
  const router = useRouter();
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

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

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
    if (success) {
      showToast(success, 'success');
      clearStatus();
    }
    if (error) {
      showToast(error, 'error');
      clearStatus();
    }
  }, [success, error, clearStatus, showToast]);

  const itemArray = Array.isArray(rawItems) ? rawItems : Array.isArray(rawItems?.items) ? rawItems.items : [];

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    const item = itemArray.flat().find(item => item.id === id);
    setSelectedItem(item);
    setShowDelete(true);
  };

  const handleDeleteItem = async (id) => {
    await deleteItem(id);
    setShowDelete(false);
    setDeleteId(null);
    setSelectedItem(null);
    fetchItems({ query, categoryId: filterCategoryId, sortBy });
  };

  const handleToggle = async (id, currentValue) => {
    setTogglingId(id);
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      const formData = new FormData();
      formData.append('is_available', String(newValue));

      if (typeof updateItem === 'function') {
        await updateItem(id, formData);
      } else {
        console.warn('updateItem not available on useItemStore — calling fetchItems as fallback');
      }
      fetchItems({ query, categoryId: filterCategoryId, sortBy });
    } catch (err) {
      console.error('Toggle update failed', err);
    } finally {
      setTogglingId(null);
    }
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

      <ItemsTable
        itemArray={itemArray}
        loading={loading}
        query={query}
        filterCategoryId={filterCategoryId}
        sortBy={sortBy}
        fetchItems={fetchItems}
        handleDeleteClick={handleDeleteClick}
        setEditingItemId={setEditingItemId}
        setShowEditItemModal={setShowEditItemModal}
        handleToggle={handleToggle}
        togglingId={togglingId}
      />

      <CreateItemModal
        isOpen={showCreateItemModal}
        onClose={() => setShowCreateItemModal(false)}
        onSuccess={() => fetchItems({ query, categoryId: filterCategoryId, sortBy })}
      />
      
      {editingItemId && (
        <EditItemModal
          isOpen={showEditItemModal}
          onClose={() => {
            setShowEditItemModal(false);
            setEditingItemId(null);
          }}
          itemId={editingItemId}
          onSuccess={() => fetchItems({ query, categoryId: filterCategoryId, sortBy })}
        />
      )}

      {showDelete && selectedItem && (
        <DeleteItemModal
          isOpen={showDelete}
          onClose={() => {
            setShowDelete(false);
            setSelectedItem(null);
          }}
          onDelete={() => handleDeleteItem(deleteId)}
          loading={loading}
          itemToDelete={selectedItem}
        />
      )}
    </div>
  );
}
