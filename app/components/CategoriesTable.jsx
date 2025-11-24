"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import { TrashIcon, PencilSquareIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function CategoriesTable({ userRole = "owner" }) {
  const router = useRouter();
  const { categories = [], fetchCategories, deleteCategory, loading, error } = useCategoryStore();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // filter state
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "1" | "0"

  // local debounced input for name (simple debounce)
  const [nameInput, setNameInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setFilterName(nameInput.trim()), 300);
    return () => clearTimeout(t);
  }, [nameInput]);

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
      alert("Category deleted successfully.");
    } catch (err) {
      alert("Failed to delete category: " + (err?.message || err));
    }
  };

  const getStatusBadge = (status) => {
    const value = Number(status);
    if (value === 1) return "bg-green-100 text-green-800";
    if (value === 0) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const value = Number(status);
    if (value === 1) return "Active";
    if (value === 0) return "Inactive";
    return "Unknown";
  };

  // filtered categories memoized
  const filtered = useMemo(() => {
    let list = Array.isArray(categories) ? categories : [];
    if (filterStatus !== "all") {
      list = list.filter((c) => String(c.status) === String(filterStatus));
    }
    if (filterName) {
      const q = filterName.toLowerCase();
      list = list.filter((c) => (c.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [categories, filterName, filterStatus]);

  const resetFilters = () => {
    setNameInput("");
    setFilterName("");
    setFilterStatus("all");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
        {userRole === "admin" && (
          <div className="flex gap-2">
            <button
              onClick={fetchCategories}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition"
              disabled={loading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push("/admin/categories/create")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="w-40">
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { /* apply is automatic via memo */ }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Reset
          </button>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          {filtered.length} / {categories.length} results
        </div>
      </div>

      {loading && <p className="text-gray-500 text-center">Loading categories...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {!loading && (!categories || categories.length === 0) && (
        <p className="text-gray-500 text-center">No categories found.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Updated At</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((cat, idx) => {
                const key = cat.id ?? `${cat.name ?? "cat"}-${idx}`;
                return (
                  <tr key={key}>
                    <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {cat.image_category_url || cat.image_url ? (
                        <Image
                          src={cat.image_category_url ?? cat.image_url}
                          alt={cat.name}
                          width={80}
                          height={80}
                          className="h-10 w-10 object-cover rounded"
                          priority={false}
                          unoptimized={true}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">{cat.name ?? "—"}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(cat.status)}`}>
                        {getStatusLabel(cat.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{cat.created_at ?? "—"}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{cat.updated_at ?? "—"}</td>
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      {userRole === "admin" ? (
                        <>
                          <button
                            onClick={() => router.push(`/admin/categories/edit/${cat.id}`)}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <PencilSquareIcon className="h-5 w-5 inline" />
                          </button>
                          <button onClick={() => handleDeleteClick(cat.id)} className="text-red-500 hover:text-red-700 transition">
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
      {showDelete && userRole === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this category?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
