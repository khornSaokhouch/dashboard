"use client";

import React, { useEffect, useState, useRef, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition, Switch } from "@headlessui/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Import your stores
import { useOptionStore } from "@/app/stores/useOptionStore";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";

// --- COMPONENT: Empty State ---
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
    <div className="bg-indigo-50 p-4 rounded-full mb-4">
      <SparklesIcon className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">No Options Found</h3>
    <p className="text-sm text-gray-500 mt-1 max-w-sm text-center mb-6">
      Add specific choices like "Less Sugar", "Large", or "Extra Cheese" to your
      groups.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
    >
      <PlusIcon className="h-4 w-4" />
      Add First Option
    </button>
  </div>
);

// --- COMPONENT: Create/Edit Modal ---
function OptionModal({ isOpen, onClose, onSubmit, groups, initialData }) {
  const isEditing = !!initialData;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    item_option_group_id: "",
    name: "",
    price_adjust_cents: 0,
    is_active: true,
    icon: null, // File object or null
    remove_icon: false, // Logic flag for API
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          item_option_group_id: initialData.item_option_group_id || "",
          name: initialData.name || "",
          price_adjust_cents: Number(initialData.price_adjust_cents || 0),
          is_active: initialData.is_active !== 0, // Assume active unless explicitly 0
          icon: null,
          remove_icon: false,
        });
        setPreviewUrl(initialData.icon || null);
      } else {
        // Reset for create
        setFormData({
          item_option_group_id: "",
          name: "",
          price_adjust_cents: 0,
          is_active: true,
          icon: null,
          remove_icon: false,
        });
        setPreviewUrl(null);
      }
    }
    // Cleanup preview URL on unmount/close
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, icon: file, remove_icon: false }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon: null, remove_icon: true }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-gray-900"
                  >
                    {isEditing ? "Edit Option" : "Add New Option"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Group Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Option Group
                    </label>
                    <div className="relative">
                      <TagIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        required
                        value={formData.item_option_group_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            item_option_group_id: e.target.value,
                          })
                        }
                        className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all sm:text-sm bg-white"
                      >
                        <option value="">Select a group...</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Name & Price Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Option Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Less Sugar"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Price Adjust (Cents)
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          min="0"
                          value={formData.price_adjust_cents}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price_adjust_cents: e.target.value,
                            })
                          }
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Option Icon
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <PhotoIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                        />
                        <div className="mt-2 flex gap-2">
                          {previewUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveIcon}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove Icon
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: Square PNG, max 1MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">
                        Available
                      </span>
                      <span className="text-xs text-gray-500">
                        Visible to customers
                      </span>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                      className={`${
                        formData.is_active ? "bg-green-500" : "bg-gray-200"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                    >
                      <span
                        className={`${
                          formData.is_active ? "translate-x-6" : "translate-x-1"
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none shadow-sm"
                    >
                      {isEditing ? "Save Changes" : "Create Option"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// --- COMPONENT: Delete Modal ---
function DeleteOptionModal({ isOpen, onClose, onDelete, loading, optionName }) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[200]" onClose={loading ? () => {} : onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
          </Transition.Child>
  
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-2">
                      <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                        Delete Option
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete <span className="font-bold text-gray-900">{optionName}</span>? 
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                      onClick={onDelete}
                      disabled={loading}
                    >
                      {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin"/> : <TrashIcon className="h-4 w-4" />}
                      Delete Option
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function ItemOptionsPage() {
  const {
    options = [],
    loading,
    error,
    fetchOptions,
    updateOptionP,
    deleteOption: storeDeleteOption,
  } = useOptionStore();

  const {
    createOptions, 
    fetchOptions: fetchStoreGroups,
    options: groupOptions = [],
  } = useItemOptionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchOptions().catch(console.error);
    fetchStoreGroups().catch(console.error);
  }, [fetchOptions, fetchStoreGroups]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (opt) => {
    setEditingItem(opt);
    setModalOpen(true);
  };

  const handleOpenDelete = (opt) => {
    setItemToDelete(opt);
    setDeleteModalOpen(true);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (formDataObj) => {
    // Convert object to FormData for the API
    const fd = new FormData();
    fd.append("item_option_group_id", formDataObj.item_option_group_id);
    fd.append("name", formDataObj.name.trim());
    fd.append(
      "price_adjust_cents",
      String(Number(formDataObj.price_adjust_cents))
    );
    fd.append("is_active", formDataObj.is_active ? "1" : "0");

    if (formDataObj.icon) {
      fd.append("icon", formDataObj.icon);
    } else if (formDataObj.remove_icon) {
      fd.append("remove_icon", "1");
    }

    try {
      if (editingItem) {
        await updateOptionP(editingItem.id, fd);
      } else {
        await createOptions(fd);
      }
      await fetchOptions();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Operation failed. check console.");
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if(!itemToDelete) return;
    setIsDeleting(true);
    try {
      await storeDeleteOption(itemToDelete.id);
      await fetchOptions();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      alert("Failed to delete.");
    } finally {
        setIsDeleting(false);
    }
  };

  // Toggle Active Handler
  const handleToggle = async (item) => {
    setTogglingId(item.id);
    try {
      const fd = new FormData();
      fd.append("is_active", item.is_active ? "0" : "1");
      await updateOptionP(item.id, fd);
      await fetchOptions();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // Helpers
  const fmtPrice = (cents) => `$${(Number(cents) / 100).toFixed(2)}`;

  // Filter
  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.group?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Options</h1>
          <p className="text-sm text-gray-500 mt-1">
            Specific choices available within your groups.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchOptions()}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Add Option
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
          {String(error)}
        </div>
      )}

      {/* Search */}
      {options.length > 0 && (
        <div className="mb-6 max-w-md relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search options..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow"
          />
        </div>
      )}

      {/* Content */}
      {loading && options.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : options.length === 0 ? (
        <EmptyState onAdd={handleOpenCreate} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider pl-8">
                  Option
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider pr-8">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredOptions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No matching options
                  </td>
                </tr>
              )}
              {filteredOptions.map((opt) => (
                <tr
                  key={opt.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Option Name & Icon */}
                  <td className="px-6 py-3 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                        {opt.icon ? (
                          <Image
                            src={opt.icon}
                            alt={opt.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <PhotoIcon className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {opt.name}
                      </div>
                    </div>
                  </td>

                  {/* Group */}
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {opt.group?.name || "Unassigned"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                    {Number(opt.price_adjust_cents) > 0 ? (
                      <span className="text-green-600">
                        +{fmtPrice(opt.price_adjust_cents)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Active Switch */}
                  <td className="px-6 py-3">
                    <Switch
                      checked={opt.is_active !== 0}
                      onChange={() => handleToggle(opt)}
                      disabled={togglingId === opt.id}
                      className={`${
                        opt.is_active !== 0 ? "bg-green-500" : "bg-gray-200"
                      } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        togglingId === opt.id ? "opacity-50" : ""
                      }`}
                    >
                      <span
                        className={`${
                          opt.is_active !== 0
                            ? "translate-x-4"
                            : "translate-x-1"
                        } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(opt)}
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(opt)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Universal Modal for Create & Edit */}
      <OptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        groups={groupOptions}
        initialData={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteOptionModal 
        isOpen={deleteModalOpen}
        onClose={() => { if (!isDeleting) setDeleteModalOpen(false) }}
        onDelete={handleDeleteConfirm}
        optionName={itemToDelete?.name}
        loading={isDeleting}
      />
    </div>
  );
}