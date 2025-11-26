"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/app/stores/userStore";
import { useAuthStore } from "@/app/stores/authStore";
import {
  TrashIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguageContext } from "../components/LanguageProviderClient";
import { useToast } from "../components/ToastNotification";

/*
  Rewritten UsersTable component
  - Fixes JSX parse errors (properly closed tags)
  - Slightly modernized UI with search, avatar initials, and nicer modals
  - Preserves original store calls and behaviour
*/

const ROLE_BADGES = {
  admin: "bg-red-100 text-red-800",
  owner: "bg-sky-100 text-sky-800",
  customer: "bg-emerald-100 text-emerald-800",
};

function getRoleBadge(role = "") {
  return ROLE_BADGES[role?.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export default function UsersTable() {
  const {
    users = [],
    fetchAllUsers,
    deleteUser,
    updateUser,
    createUser,
    loading,
    error,
  } = useUserStore();
  const { user, isHydrated } = useAuthStore();
  const { translations = {} } = useLanguageContext();
  const showToast = useToast();

  // Local UI state
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
  });
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "customer",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isHydrated) fetchAllUsers();
  }, [isHydrated, fetchAllUsers]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-500 bg-gray-50 rounded-xl p-6">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-3" />
        <span>{translations.loadingAuth || "Loading authentication..."}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-700">
        <p>
          {translations.accessDenied || "Access Denied. You must be logged in."}
        </p>
      </div>
    );
  }

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isOwner = user?.role?.toLowerCase() === "owner";

  // Filter users based on current user role (keeps original intent)
  const filteredUsers = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const base = users || [];
    let allowed = base.filter((u) => {
      if (isAdmin) return u.role?.toLowerCase() !== "admin";
      if (isOwner) return u.role?.toLowerCase() === "customer";
      return false;
    });
    if (!lower) return allowed;
    return allowed.filter((u) =>
      [u.name, u.email, u.phone, u.role].some((f) =>
        String(f || "")
          .toLowerCase()
          .includes(lower)
      )
    );
  }, [users, query, isAdmin, isOwner]);

  const userToDelete = users.find((u) => u.id === deletingUserId);

  // Handlers
  const startDelete = (id) => {
    if (!isAdmin)
      return showToast(
        translations.noPermission || "You don't have permission",
        "error"
      );
    setDeletingUserId(id);
  };

  const handleConfirmedDelete = async () => {
    if (!isAdmin || !deletingUserId) return;
    setIsDeleting(true);
    try {
      await deleteUser(deletingUserId);
      setDeletingUserId(null);
      await fetchAllUsers();
      showToast(
        translations.userDeletedSuccessfully || "User deleted successfully!",
        "success"
      );
    } catch (err) {
      showToast(
        (translations.failedDeleteUser || "Failed to delete user: ") +
          (err?.message || ""),
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (u) => {
    if (!isAdmin)
      return showToast(
        translations.noPermission || "You don't have permission",
        "error"
      );
    setEditingUser(u);
    setFormData({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "customer",
    });
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingUser) return;
    setIsUpdating(true);
    try {
      await updateUser({ id: editingUser.id, ...formData });
      setEditingUser(null);
      await fetchAllUsers();
      showToast(
        translations.userUpdatedSuccessfully || "User updated successfully!",
        "success"
      );
    } catch (err) {
      showToast(
        (translations.failedUpdateUser || "Failed to update user: ") +
          (err?.message || ""),
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNewUserChange = (e) =>
    setNewUserData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isAdmin)
      return showToast(
        translations.noPermission || "You don't have permission",
        "error"
      );
    if (newUserData.password !== newUserData.password_confirmation) {
      showToast(
        translations.passwordMismatch || "Passwords do not match!",
        "error"
      );
      return;
    }
    setIsCreating(true);
    try {
      await createUser(newUserData);
      setIsCreatingUser(false);
      setNewUserData({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role: "customer",
      });
      await fetchAllUsers();
      showToast(
        translations.userCreatedSuccessfully || "User created successfully!",
        "success"
      );
    } catch (err) {
      showToast(
        (translations.failedCreateUser || "Failed to create user: ") +
          (err?.message || ""),
        "error"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Small helper for avatar initials
  const initials = (name = "") =>
    name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {translations.userManagement || "User Management"}
            </h1>
            <p className="text-sm text-gray-500">
              {translations.manageUsersDesc ||
                "Create, edit or remove users from the system."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm w-full md:w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="search"
              className="w-full outline-none text-sm"
              placeholder={
                translations.searchPlaceholder ||
                "Search name, email, phone or role..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => setIsCreatingUser(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                disabled={loading}
              >
                <UserPlusIcon className="h-5 w-5" />
                <span className="text-sm">
                  {translations.addUser || "Add User"}
                </span>
              </button>
              <button
                onClick={() => fetchAllUsers()}
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

      {/* status / error */}
      {(loading || isCreating || isUpdating || isDeleting) && (
        <div className="py-6 text-center text-blue-600 flex items-center justify-center gap-3">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          <span>{translations.fetchingUsers || "Fetching users..."}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          <p className="font-semibold">{translations.error || "Error:"}</p>
          <p className="text-sm">{String(error)}</p>
        </div>
      )}

      {/* table */}
      {!loading && filteredUsers.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">{translations.name || "Name"}</th>
                  <th className="px-6 py-3">{translations.email || "Email"}</th>
                  <th className="px-6 py-3">{translations.phone || "Phone"}</th>
                  <th className="px-6 py-3">{translations.role || "Role"}</th>
                  <th className="px-6 py-3 text-right">
                    {translations.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                        {initials(u.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {translations.joinedOn
                            ? `${translations.joinedOn}: ${
                                u.created_at?.split("T")[0] || "—"
                              }`
                            : u.created_at?.split("T")[0] || ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              title={translations.editUser || "Edit User"}
                              className="p-2 rounded-md hover:bg-indigo-50"
                            >
                              <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                            </button>
                            <button
                              onClick={() => startDelete(u.id)}
                              title={translations.deleteUser || "Delete User"}
                              className="p-2 rounded-md hover:bg-red-50"
                            >
                              <TrashIcon className="h-5 w-5 text-red-600" />
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            {translations.noActions || "No actions"}
                          </span>
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
            {translations.noUsers || "No users available for your role."}
          </div>
        )
      )}

      {/* -------------------- CREATE USER MODAL -------------------- */}
      {isCreatingUser && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isCreating && setIsCreatingUser(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl transform transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {translations.addNewUser || "Add New User"}
              </h3>
              <button
                onClick={() => setIsCreatingUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
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
                  onClick={() => setIsCreatingUser(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  {translations.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
                >
                  {isCreating && (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  )}
                  {translations.createUser || "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- EDIT USER MODAL -------------------- */}
      {editingUser && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isUpdating && setEditingUser(null)}
            aria-hidden
          />
          <div className="relative bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {translations.editingUser || "Editing User"}:{" "}
                <span className="text-indigo-600">{editingUser.name}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
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
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  {translations.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
                >
                  {isUpdating && (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  )}
                  {translations.saveChanges || "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- DELETE CONFIRMATION -------------------- */}
      {deletingUserId && userToDelete && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isDeleting && setDeletingUserId(null)}
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
                {userToDelete.name}
              </span>
              ?{" "}
              {translations.thisCannotBeUndone ||
                "This action cannot be undone."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeletingUserId(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                {translations.cancel || "Cancel"}
              </button>
              <button
                onClick={handleConfirmedDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
              >
                {isDeleting && (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                )}
                {translations.deletePermanently || "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
