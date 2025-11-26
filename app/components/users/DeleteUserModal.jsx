"use client";

import React from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  userToDelete,
  translations = {},
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isDeleting && onClose()}
        aria-hidden
      />
      <div className="relative bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {translations.confirmDeletion || "Confirm Deletion"}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {translations.confirmDeleteMessage ||
            "Are you sure you want to delete user"}{" "}
          <span className="font-semibold text-red-600">
            {userToDelete?.name}
          </span>
          ?{" "}
          {translations.thisCannotBeUndone || "This action cannot be undone."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            {translations.cancel || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
          >
            {isDeleting && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
            {translations.deletePermanently || "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
