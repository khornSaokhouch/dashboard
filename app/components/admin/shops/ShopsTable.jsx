"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useShopStore } from "@/app/stores/useShopStore";
import { useAuthStore } from "@/app/stores/authStore";
import {
  TrashIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  ShoppingBagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguageContext } from "@/app/components/LanguageProviderClient";
import { useToast } from "@/app/components/ToastNotification";
import CreateShopModal from "./CreateShopModal";
import EditShopModal from "./EditShopModal";
import DeleteShopModal from "./DeleteShopModal";
import ShopRowSkeleton from "./ShopRowSkeleton";
import Image from "next/image";

const STATUS_BADGES = {
  1: "bg-green-100 text-green-800",
  0: "bg-red-100 text-red-800",
};

function getStatusBadge(status) {
  return STATUS_BADGES[status] || "bg-gray-100 text-gray-800";
}

export default function ShopsTable() {
  const {
    shops = [],
    fetchShops,
    deleteShop,
    updateShop,
    createShop,
    loading,
    error,
  } = useShopStore();
  const { user, isHydrated } = useAuthStore();
  const { translations = {} } = useLanguageContext();
  const showToast = useToast();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editingShop, setEditingShop] = useState(null);
  const [deletingShopId, setDeletingShopId] = useState(null);
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isHydrated) fetchShops();
  }, [isHydrated, fetchShops]);

  const filteredShops = useMemo(() => {
    const lower = query.trim().toLowerCase();
    let allowed = shops || [];

    if (filterStatus !== "all") {
      allowed = allowed.filter((s) => String(s.status) === String(filterStatus));
    }

    if (lower) {
      allowed = allowed.filter((s) =>
        [s.name, s.location].some((f) =>
          String(f || "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    const [sortField, sortOrder] = sortBy.split("-");
    allowed.sort((a, b) => {
      const aValue = String(a[sortField] || "").toLowerCase();
      const bValue = String(b[sortField] || "").toLowerCase();

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return allowed;
  }, [shops, query, filterStatus, sortBy]);

  const shopToDelete = shops.find((s) => s.id === deletingShopId);

  const startDelete = (id) => {
    if (!isAdmin)
      return showToast(
        translations.noPermission || "You don't have permission",
        "error"
      );
    setDeletingShopId(id);
  };

  const handleConfirmedDelete = async () => {
    if (!isAdmin || !deletingShopId) return;
    setIsDeleting(true);
    try {
      await deleteShop(deletingShopId);
      setDeletingShopId(null);
      await fetchShops();
      showToast(
        translations.shopDeletedSuccessfully || "Shop deleted successfully!",
        "success"
      );
    } catch (err) {
      showToast(
        (translations.failedDeleteShop || "Failed to delete shop: ") +
          (err?.message || ""),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (shop) => {
    if (!isAdmin)
      return showToast(
        translations.noPermission || "You don't have permission",
        "error"
      );
    setEditingShop(shop);
  };

  const handleUpdate = async (formData) => {
    if (!isAdmin || !editingShop) return;
    setIsUpdating(true);
    try {
      await updateShop(editingShop.id, formData);
      setEditingShop(null);
      await fetchShops();
      showToast(
        translations.shopUpdatedSuccessfully || "Shop updated successfully!",
        "success"
      );
    } catch (err) {
      showToast(
        (translations.failedUpdateShop || "Failed to update shop: ") +
          (err?.message || ""),
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async (newShopData) => {
    if (!isAdmin)
      return showToast(
        translations.noPermission || "You don't have permission",
        "error"
      );
    setIsCreating(true);
    try {
      await createShop(newShopData);
      setIsCreatingShop(false);
      await fetchShops();
      showToast(
        translations.shopCreatedSuccessfully || "Shop created successfully!",
        "success"
      );
    } catch (err) {
      showToast(
        (translations.failedCreateShop || "Failed to create shop: ") +
          (err?.message || ""),
        "error"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {translations.shopManagement || "Shop Management"}
              </h1>
              <p className="text-sm text-gray-500">
                {translations.manageShopsDesc ||
                  "Create, edit or remove shops from the system."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm w-full md:w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="search"
              className="w-full outline-none text-sm"
              placeholder={
                translations.searchShopPlaceholder ||
                "Search name or location..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="w-full md:w-48 border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{translations.allStatuses || "All Statuses"}</option>
            <option value="1">{translations.active || "Active"}</option>
            <option value="0">{translations.pending || "Pending"}</option>
          </select>

          <select
            className="w-full md:w-48 border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">{translations.sortByNameAsc || "Name (A-Z)"}</option>
            <option value="name-desc">{translations.sortByNameDesc || "Name (Z-A)"}</option>
            <option value="location-asc">{translations.sortByLocationAsc || "Location (A-Z)"}</option>
            <option value="location-desc">{translations.sortByLocationDesc || "Location (Z-A)"}</option>
          </select>

          {isAdmin && (
            <>
              <button
                onClick={() => setIsCreatingShop(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                disabled={loading}
              >
                <PlusIcon className="h-5 w-5" />
                <span className="text-sm">
                  {translations.addShop || "Add Shop"}
                </span>
              </button>
              <button
                onClick={() => fetchShops()}
                className="inline-flex items-center gap-2 bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition shadow-sm"
                disabled={loading}
              >
                <ArrowPathIcon
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline text-sm">
                  {translations.refreshData || "Refresh"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          <p className="font-semibold">{translations.error || "Error:"}</p>
          <p className="text-sm">{String(error)}</p>
        </div>
      )}

      {(loading || isCreating || isUpdating || isDeleting) ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">{translations.image || "Image"}</th>
                  <th className="px-6 py-3">{translations.name || "Name"}</th>
                  <th className="px-6 py-3">{translations.location || "Location"}</th>
                  <th className="px-6 py-3">{translations.status || "Status"}</th>
                  <th className="px-6 py-3">{translations.owner || "Owner"}</th>
                  <th className="px-6 py-3 text-right">
                    {translations.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...Array(5)].map((_, i) => <ShopRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">{translations.image || "Image"}</th>
                  <th className="px-6 py-3">{translations.name || "Name"}</th>
                  <th className="px-6 py-3">{translations.location || "Location"}</th>
                  <th className="px-6 py-3">{translations.status || "Status"}</th>
                  <th className="px-6 py-3">{translations.owner || "Owner"}</th>
                  <th className="px-6 py-3 text-right">
                    {translations.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShops.map((shop, idx) => (
                  <tr key={shop.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Image
                          src={shop.image_url || "/images/logo.png"}
                          alt={shop.name || "Shop"}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {shop.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shop.latitude && shop.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          {shop.location || "View on Map"}
                        </a>
                      ) : (
                        shop.location || "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          shop.status
                        )}`}
                      >
                        {Number(shop.status) === 1 ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shop.owner?.name || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => startEdit(shop)}
                              title={translations.editShop || "Edit Shop"}
                              className="p-2 rounded-md hover:bg-indigo-50"
                            >
                              <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                            </button>
                            <button
                              onClick={() => startDelete(shop.id)}
                              title={translations.deleteShop || "Delete Shop"}
                              className="p-2 rounded-md hover:bg-red-50"
                            >
                              <TrashIcon className="h-5 w-5 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12 text-gray-500">
            {translations.noShopsAvailable || "No shops available."}
          </div>
        )
      )}

        <CreateShopModal
            isOpen={isCreatingShop && isAdmin}
            onClose={() => setIsCreatingShop(false)}
            onSubmit={handleCreate}
            isCreating={isCreating}
            translations={translations}
        />

        <EditShopModal
            isOpen={!!editingShop && isAdmin}
            onClose={() => setEditingShop(null)}
            onSubmit={handleUpdate}
            isUpdating={isUpdating}
            editingShop={editingShop}
            translations={translations}
        />

        <DeleteShopModal
            isOpen={!!deletingShopId && isAdmin}
            onClose={() => setDeletingShopId(null)}
            onConfirm={handleConfirmedDelete}
            isDeleting={isDeleting}
            shopToDelete={shopToDelete}
            translations={translations}
        />
    </div>
  );
}
