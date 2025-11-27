"use client";

import React, { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  translations = {},
}) {
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "customer",
  });

  const handleNewUserChange = (e) =>
    setNewUserData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newUserData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isCreating && onClose()}
        aria-hidden="true"
      />
      <div className="relative bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl transform transition">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {translations.addNewUser || "Add New User"}
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
              value={newUserData.name}
              onChange={handleNewUserChange}
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
              value={newUserData.email}
              onChange={handleNewUserChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.phone || "Phone"}
            </label>
            <input
              name="phone"
              value={newUserData.phone}
              onChange={handleNewUserChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.password || "Password"}
              </label>
              <input
                required
                minLength={8}
                type="password"
                name="password"
                value={newUserData.password}
                onChange={handleNewUserChange}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.confirmPassword || "Confirm Password"}
              </label>
              <input
                required
                minLength={8}
                type="password"
                name="password_confirmation"
                value={newUserData.password_confirmation}
                onChange={handleNewUserChange}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.role || "Role"}
            </label>
            <select
              name="role"
              value={newUserData.role}
              onChange={handleNewUserChange}
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
              disabled={isCreating}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
            >
              {isCreating && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              {translations.createUser || "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
