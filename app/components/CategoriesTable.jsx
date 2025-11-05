'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { TrashIcon, PencilSquareIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function CategoriesTable({ userRole = 'owner' }) { // 'admin' or 'owner'
  const router = useRouter();
  const { categories, fetchCategories, deleteCategory, loading, error } = useCategoryStore();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deleteId);
      setShowDelete(false);
      alert('Category deleted successfully.');
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={fetchCategories}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition"
              disabled={loading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/admin/categories/create')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add Category
            </button>
          </div>
        )}
      </div>

      {loading && <p className="text-gray-500 text-center">Loading categories...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {!loading && categories.length === 0 && <p className="text-gray-500 text-center">No categories found.</p>}

      {!loading && categories.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Shop ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Display Order</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated At</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat, index) => {
                const key = cat.id ?? `${cat.name}-${index}`;
                if (!cat.id) {
                  console.warn(`Category at index ${index} has no ID. Using fallback key.`);
                }
                return (
                  <tr key={key}>
                    <td className="px-4 py-2 text-sm text-gray-700">{cat.id ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{cat.shop_id ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{cat.name ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {cat.image_category_url ? (
                        <img
                          src={cat.image_category_url}
                          alt={cat.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{cat.display_order ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{cat.created_at ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{cat.updated_at ?? '—'}</td>
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      {userRole === 'admin' ? (
                        <>
                          <button
                            onClick={() => router.push(`/admin/categories/edit/${cat.id}`)}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <PencilSquareIcon className="h-5 w-5 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(cat.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <TrashIcon className="h-5 w-5 inline" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this category?</p>
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
