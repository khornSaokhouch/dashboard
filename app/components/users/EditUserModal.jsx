"use client";

import React, { useState, useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  isUpdating,
  editingUser,
  translations = {},
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        role: editingUser.role || "customer",
      });
    }
  }, [editingUser]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return; // Add null check for editingUser
    onSubmit({ id: editingUser.id, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isUpdating && onClose()}
        aria-hidden
      />
      <div className="relative bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {translations.editingUser || "Editing User"}:{" "}
            <span className="text-emerald-600">{editingUser?.name}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.name || "Name"}
            </label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.email || "Email"}
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.phone || "Phone"}
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.role || "Role"}
            </label>
            <select
              required
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            >
              <option value="owner">{translations.owner || "Owner"}</option>
              <option value="customer">
                {translations.customer || "Customer"}
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg"
            >
              {translations.cancel || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
            >
              {isUpdating && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              {translations.updateUser || "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
