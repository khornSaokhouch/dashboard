"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import { useAuthStore } from "@/app/stores/authStore";
import { 
  TrashIcon, 
  PencilSquareIcon, 
  PlusIcon, 
  ArrowPathIcon,
  TagIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

import CreateCategoryModal from "./admin/categories/CreateCategoryModal";
import EditCategoryModal from "./admin/categories/EditCategoryModal";
import DeleteCategoryModal from "./admin/categories/DeleteCategoryModal"; // Assuming this will be created
import CategoryRowSkeleton from "./admin/categories/CategoryRowSkeleton";
import { useToast } from "./ToastNotification";

export default function CategoriesTable() {
  const { user } = useAuthStore();
  const { 
    categories = [], 
    fetchCategories, 
    deleteCategory, 
    createCategory,
    updateCategory,
    loading, 
    error 
  } = useCategoryStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const showToast = useToast();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (formData) => {
    if (!isAdmin) return;
    setIsCreating(true);
    try {
      await createCategory(formData);
      await fetchCategories();
      setShowCreateModal(false);
      showToast("Category created successfully!", "success");
    } catch (err) {
      showToast("Failed to create category: " + (err?.message || ""), "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    if (!isAdmin) return;
    setIsUpdating(true);
    try {
      await updateCategory(id, formData);
      await fetchCategories();
      setEditingCategory(null);
      showToast("Category updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update category: " + (err?.message || ""), "error");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const startDelete = (id) => {
    if (!isAdmin) return;
    setDeletingCategoryId(id);
  };

  const handleConfirmedDelete = async () => {
    if (!isAdmin || !deletingCategoryId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deletingCategoryId);
      await fetchCategories();
      setDeletingCategoryId(null);
      showToast("Category deleted successfully!", "success");
    } catch (err) {
      showToast("Failed to delete category: " + (err?.message || ""), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    let list = Array.isArray(categories) ? categories : [];
    if (filterStatus !== "all") {
      list = list.filter((c) => String(c.status) === String(filterStatus));
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => (c.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [categories, query, filterStatus]);

  const categoryToDelete = categories.find(c => c.id === deletingCategoryId);

  const getStatusBadge = (status) => {
    return Number(status) === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TagIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Category Management</h1>
            <p className="text-sm text-gray-500">Create, edit, or remove product categories.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm w-full md:w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="search"
              className="w-full outline-none text-sm"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="w-full md:w-48 border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                disabled={loading}
              >
                <PlusIcon className="h-5 w-5" />
                <span className="text-sm">Add Category</span>
              </button>
              <button
                onClick={() => fetchCategories()}
                className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition shadow-sm"
                disabled={loading}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden md:inline text-sm">Refresh</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{String(error)}</p>}
      
      {loading ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Icon</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...Array(5)].map((_, i) => <CategoryRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Icon</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat, idx) => (
                  <tr key={`${cat.id}-${idx}`} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Image
                          src={cat.image_category_url || cat.image_url || "/images/logo.png"}
                          alt={cat.name || "Category"}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(cat.status)}`}>
                        {Number(cat.status) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingCategory(cat)} title="Edit Category" className="p-2 rounded-md hover:bg-indigo-50">
                            <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                          </button>
                          <button onClick={() => startDelete(cat.id)} title="Delete Category" className="p-2 rounded-md hover:bg-red-50">
                            <TrashIcon className="h-5 w-5 text-red-600" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && <div className="text-center py-12 text-gray-500">No categories available.</div>
      )}

      <CreateCategoryModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isCreating={isCreating}
      />
      <EditCategoryModal 
        isOpen={!!editingCategory} 
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdate}
        isUpdating={isUpdating}
        editingCategory={editingCategory}
      />
      <DeleteCategoryModal
        isOpen={!!deletingCategoryId}
        onClose={() => setDeletingCategoryId(null)}
        onConfirm={handleConfirmedDelete}
        isDeleting={isDeleting}
        categoryToDelete={categoryToDelete}
      />
    </div>
  );
}
