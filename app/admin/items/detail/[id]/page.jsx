"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";
import { useAuthStore } from "@/app/stores/authStore";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

const ItemDetail = () => {
  const params = useParams();
  const id = params?.id ?? null;
  const router = useRouter();

  const {
    groupAssignments,
    options,
    loading,
    error,
    groupAssignmentsForItem,
    fetchOptions,
    assignOptionGroup,
  } = useItemOptionStore();
  const token = useAuthStore((s) => s.token);

  const [item, setItem] = useState(null);
  const [optionGroups, setOptionGroups] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // attachingId stores the id of the group currently being attached (optimistic per-group loader)
  const [attachingId, setAttachingId] = useState(null);

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
      setOptionGroups(
        Array.isArray(groupAssignments.optionGroups)
          ? groupAssignments.optionGroups
          : []
      );
    } else if (Array.isArray(groupAssignments)) {
      setItem(null);
      setOptionGroups(groupAssignments);
    } else {
      setItem(null);
      setOptionGroups([]);
    }
  }, [groupAssignments]);

  // normalize arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeOptionGroups = Array.isArray(optionGroups) ? optionGroups : [];

  // set of attached ids for quick lookup
  const attachedIds = new Set(safeOptionGroups.map((g) => g.id));
  // available options exclude groups already attached
  const availableOptions = safeOptions.filter((g) => !attachedIds.has(g.id));

  const handleAddGroupToItem = async (groupId) => {
    if (!item?.id) return;
  
    const groupToAdd = safeOptions.find((g) => g.id === groupId);
    if (!groupToAdd) return;
  
    // Optimistic update
    setOptionGroups((prev) => [...prev, groupToAdd]);
  
    setAttachingId(groupId);
  
    try {
      const updated = await assignOptionGroup(item.id, groupId);
  
      if (updated) {
        setItem(updated);
        setOptionGroups(updated.optionGroups || []);
      }
  
      // Close sheet
      setIsSheetOpen(false);
  
      // 🔄 REFRESH PAGE (get new data)
     await fetchOptions();
  
    } catch (err) {
      console.error("Failed to attach group:", err);
  
      // rollback optimistic update
      setOptionGroups((prev) => prev.filter((g) => g.id !== groupId));
    } finally {
      setAttachingId(null);
    }
  };
  

  const priceDisplay = `$${(((item?.price_cents ?? 0) / 100) || 0).toFixed(2)}`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Items Management
        </button>

        <button
          onClick={() => setIsSheetOpen(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Option Group
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Item Detail</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        {item?.image_url && (
          <div className="mb-6">
            <Image
              src={item.image_url}
              alt={item?.name ?? "Item image"}
              width={800}
              height={600}
              className="rounded-lg object-cover w-full"
              unoptimized={true}
            />
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {item?.name ?? "Item"}
        </h2>
        <p className="text-xl text-gray-700 mb-4">{priceDisplay}</p>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">Description:</h3>
        <p className="text-gray-600 mb-6">
          {item?.description || "No description available."}
        </p>

        <div className="border-t pt-4 text-sm text-gray-500 mb-6 space-y-1">
          <p>
            <strong>Category:</strong> {item?.category?.name || "N/A"}
          </p>
          <p>
            <strong>Shop:</strong> {item?.shop_id ?? "N/A"}
          </p>

          <p>
            <strong>Display Order:</strong> {item?.display_order ?? "N/A"}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {item?.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {item?.updated_at ? new Date(item.updated_at).toLocaleString() : "N/A"}
          </p>
        </div>

        {/* READ-ONLY OPTION GROUPS */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Option Groups (read-only)</h3>

          <div className="space-y-4">
            {safeOptionGroups.length > 0 ? (
              safeOptionGroups.map((group) => (
                <div key={group.id} className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-base font-semibold text-gray-800">{group.name}</div>
                      <div className="text-xs text-gray-500">
                        {group.type} • {group.is_required ? "Required" : "Optional"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{group?.pivot ? "Attached" : ""}</div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {(Array.isArray(group?.options) ? group.options : []).map((opt) => {
                      const priceAdjRaw = opt?.price_adjust_cents ?? opt?.price_adjust ?? 0;
                      let priceAdj = 0;
                      if (priceAdjRaw === null || priceAdjRaw === undefined) priceAdj = 0;
                      else {
                        const rawStr = String(priceAdjRaw);
                        if (rawStr.includes(".") && rawStr.split(".")[1]?.length === 2) {
                          priceAdj = Number(rawStr);
                        } else {
                          const n = Number(rawStr);
                          priceAdj = Number.isFinite(n) ? n / 100 : 0;
                        }
                      }
                      const adjLabel = priceAdj ? `+${priceAdj.toFixed(2)}` : null;

                      return (
                        <div
                          key={opt.id}
                          className={`inline-flex items-center gap-3 px-3 py-2 rounded-md border bg-white text-sm ${
                            Number(opt?.is_active) === 1 ? "" : "opacity-60"
                          }`}
                        >
                          {opt?.icon_url ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                              <Image src={opt.icon_url} alt={opt.name} width={32} height={32} unoptimized={true} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                              {opt?.name?.charAt(0) || "•"}
                            </div>
                          )}

                          <div className="leading-tight">
                            <div className="font-medium text-gray-800">{opt?.name}</div>
                            {adjLabel && <div className="text-xs text-gray-500">{adjLabel}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No option groups attached to this item.</div>
            )}
          </div>
        </div>
      </div>

      {/* SHEET: Add Option Group */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm" onClick={() => setIsSheetOpen(false)} />

          <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform">
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Option Group</h2>
                <p className="text-sm text-gray-500">Select a group to attach to this item.</p>
              </div>
              <button onClick={() => setIsSheetOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {availableOptions.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-4">
                        <RectangleStackIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{group.name}</h3>
                        <div className="flex space-x-2 text-xs text-gray-500 mt-1">
                          <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{group.type}</span>
                          <span className={`${group.is_required ? "text-red-500" : "text-green-500"}`}>
                            {group.is_required ? "Required" : "Optional"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={attachingId !== null}
                      onClick={() => handleAddGroupToItem(group.id)}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm whitespace-nowrap"
                    >
                      {attachingId === group.id ? "Adding..." : "Add +"}
                    </button>
                  </div>
                ))}

                {availableOptions.length === 0 && <div className="text-sm text-gray-500">No option groups available.</div>}
              </div>
            </div>

            <div className="p-4 border-t bg-white">
              <button onClick={() => setIsSheetOpen(false)} className="w-full text-center text-gray-500 hover:text-gray-700 text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
