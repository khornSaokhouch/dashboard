"use client";

import React, { useEffect, useState, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  RectangleStackIcon,
  TagIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  ListBulletIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// --- Sub-Component: Delete Confirmation Modal ---
function DeleteGroupModal({ isOpen, onClose, onConfirm, groupName, loading }) {
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
                      Remove Option Group
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to remove <span className="font-bold text-gray-900">{groupName}</span> from this item?
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        This will unlink the group and its options from the item, but the group itself will remain in your library.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin"/> : <TrashIcon className="h-4 w-4" />}
                    Remove Group
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

export default function ItemDetail() {
  const params = useParams();
  const id = params?.id ?? null;
  const router = useRouter();

  const {
    groupAssignments,
    options,
    loading,
    groupAssignmentsForItem,
    fetchOptions,
    assignOptionGroup,
    deleteOptionGroup,
  } = useItemOptionStore();

  const [item, setItem] = useState(null);
  const [optionGroups, setOptionGroups] = useState([]);
  const [attachingId, setAttachingId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    if (id) groupAssignmentsForItem(id);
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!groupAssignments) {
      setItem(null);
      setOptionGroups([]);
      return;
    }
    if (groupAssignments.optionGroups || groupAssignments.name) {
      setItem(groupAssignments);
      setOptionGroups(Array.isArray(groupAssignments.optionGroups) ? groupAssignments.optionGroups : []);
    } else if (Array.isArray(groupAssignments)) {
      setItem(null);
      setOptionGroups(groupAssignments);
    }
  }, [groupAssignments]);

  // --- Logic Helpers ---
  const safeOptions = Array.isArray(options) ? options : [];
  const safeOptionGroups = Array.isArray(optionGroups) ? optionGroups : [];
  const attachedIds = new Set(safeOptionGroups.map((g) => g.id));
  const availableOptions = safeOptions.filter((g) => !attachedIds.has(g.id));

  // --- Handlers ---
  const handleAddGroupToItem = async (groupId) => {
    if (!item?.id) return;
    const groupToAdd = safeOptions.find((g) => g.id === groupId);
    if (!groupToAdd) return;

    setOptionGroups((prev) => [...prev, groupToAdd]); // Optimistic
    setAttachingId(groupId);

    try {
      const updated = await assignOptionGroup(item.id, groupId);
      if (updated) {
        setItem(updated);
        setOptionGroups(updated.optionGroups || []);
      }
      await useItemOptionStore.getState().groupAssignmentsForItem(item.id);
      await fetchOptions();
    } catch (err) {
      console.error("Failed to attach group:", err);
      setOptionGroups((prev) => prev.filter((g) => g.id !== groupId)); // Rollback
    } finally {
      setAttachingId(null);
    }
  };

  // Open the modal
  const handleRemoveClick = (group) => {
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  // Execute removal
  const handleConfirmRemove = async () => {
    if (!item?.id || !groupToDelete) return;
    
    setIsDeleting(true);
    const groupId = groupToDelete.id;
    
    // Backup for rollback
    const oldGroups = [...safeOptionGroups];
    
    // Optimistic UI update
    setOptionGroups(oldGroups.filter((g) => g.id !== groupId));

    try {
      const result = await deleteOptionGroup(item.id, groupId);
      await groupAssignmentsForItem(id);
      await fetchOptions();
      
      // Close modal
      setDeleteModalOpen(false);
      setGroupToDelete(null);

      if (!result) setOptionGroups(oldGroups); // Rollback if backend failed logic
    } catch (e) {
      console.error("Failed to remove group:", e);
      setOptionGroups(oldGroups); // Rollback
    } finally {
      setIsDeleting(false);
    }
  };

  const priceDisplay = `$${(((item?.price_cents ?? 0) / 100) || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2 group"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Items
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Configure Item</h1>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Item Details */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Item Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
                    <div className="relative h-64 w-full bg-gray-100">
                        {item?.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={item?.name ?? "Item"}
                                fill
                                className="object-cover"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <RectangleStackIcon className="w-16 h-16 opacity-20" />
                            </div>
                        )}
                         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-sm font-bold text-gray-900 border border-gray-100">
                            {priceDisplay}
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{item?.name || "Loading..."}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                <TagIcon className="w-3 h-3" />
                                {item?.category?.name || "Uncategorized"}
                            </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            {item?.description || "No description provided."}
                        </p>

                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div className="flex items-center text-xs text-gray-500">
                                <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-gray-400" />
                                Shop ID: {item?.shop_id ?? "N/A"}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                Updated: {item?.updated_at ? new Date(item.updated_at).toLocaleDateString() : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Options */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. ASSIGNED GROUPS */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            Assigned Groups
                        </h3>
                        <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full shadow-sm">
                            {safeOptionGroups.length} Active
                        </span>
                    </div>

                    <div className="space-y-4">
                        {safeOptionGroups.length === 0 && (
                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-75">
                                <RectangleStackIcon className="w-10 h-10 text-gray-400 mb-2" />
                                <h4 className="text-gray-900 font-medium">No Groups Assigned</h4>
                                <p className="text-gray-500 text-sm">Select a group from the list below to add it.</p>
                            </div>
                        )}

                        {safeOptionGroups.map((group) => (
                            <div key={group.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group hover:border-indigo-200 transition-colors">
                                <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-semibold text-gray-900">{group.name}</h4>
                                        <div className="flex gap-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${group.is_required ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                                {group.is_required ? "Required" : "Optional"}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">
                                                {group.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveClick(group)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                        title="Remove group"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="p-5 flex flex-wrap gap-2">
                                    {(group.options || []).map((opt) => (
                                        <span key={opt.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                            {opt.name}
                                        </span>
                                    ))}
                                    {(!group.options || group.options.length === 0) && (
                                        <span className="text-xs text-gray-400 italic">No options defined in this group.</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 2. AVAILABLE GROUPS */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <ListBulletIcon className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900">Available to Add</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableOptions.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                All available groups have been assigned.
                            </div>
                        )}

                        {availableOptions.map((group) => (
                            <div key={group.id} className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <RectangleStackIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize">{group.type}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${group.is_required ? "text-amber-700 bg-amber-50" : "text-slate-600 bg-slate-50"}`}>
                                        {group.is_required ? "Required" : "Optional"}
                                    </span>
                                </div>
                                
                                <button
                                    disabled={attachingId !== null}
                                    onClick={() => handleAddGroupToItem(group.id)}
                                    className="mt-auto w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {attachingId === group.id ? (
                                        "Adding..."
                                    ) : (
                                        <>
                                            <PlusIcon className="w-4 h-4" /> Add Group
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteGroupModal 
        isOpen={deleteModalOpen}
        onClose={() => { if(!isDeleting) setDeleteModalOpen(false) }}
        onConfirm={handleConfirmRemove}
        groupName={groupToDelete?.name}
        loading={isDeleting}
      />
    </div>
  );
}