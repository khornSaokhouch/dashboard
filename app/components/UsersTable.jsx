"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/app/stores/userStore";
import { useAuthStore } from "@/app/stores/authStore";
import {
  TrashIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguageContext } from "../components/LanguageProviderClient";
import { useToast } from "../components/ToastNotification";
import CreateUserModal from "./users/CreateUserModal";
import EditUserModal from "./users/EditUserModal";
import DeleteUserModal from "./users/DeleteUserModal";

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

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isOwner = user?.role?.toLowerCase() === "owner";

  const [query, setQuery] = useState("");
  const [filterRole, setFilterRole] = useState(""); // New state for role filter
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isHydrated) fetchAllUsers();
  }, [isHydrated, fetchAllUsers]);

  // ... (rest of the component)

  const filteredUsers = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const base = users || [];
    let allowed = base.filter(Boolean).filter((u) => {
      if (isAdmin) return u.role?.toLowerCase() !== "admin";
      if (isOwner) return u.role?.toLowerCase() === "customer";
      return false;
    });

    // Apply role filter if filterRole is set
    if (filterRole) {
      allowed = allowed.filter((u) => u.role?.toLowerCase() === filterRole.toLowerCase());
    }

    if (!lower) return allowed;
    return allowed.filter((u) =>
      [u.name, u.email, u.phone, u.role].some((f) =>
        String(f || "")
          .toLowerCase()
          .includes(lower)
      )
    );
  }, [users, query, isAdmin, isOwner, filterRole]); // Add filterRole to dependencies

  const userToDelete = users.find((u) => u.id === deletingUserId);

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
  };

  const handleUpdate = async (formData) => {
    if (!isAdmin || !editingUser) return;
    setIsUpdating(true);
    try {
      await updateUser(formData);
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

  const handleCreate = async (newUserData) => {
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

  const initials = (name = "") =>
    name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6">
        {/* Title and Description */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
        </div>

        {/* Search, Filter, and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full">
          {/* Search Bar */}
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

          {/* New Filter by Role dropdown */}
          <select
            className="w-full md:w-48 border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">{translations.allRoles || "All Roles"}</option>
            <option value="admin">{translations.admin || "Admin"}</option>
            <option value="owner">{translations.owner || "Owner"}</option>
            <option value="customer">{translations.customer || "Customer"}</option>
          </select>

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

          <CreateUserModal
            isOpen={isCreatingUser && isAdmin}
            onClose={() => setIsCreatingUser(false)}
            onSubmit={handleCreate}
            isCreating={isCreating}
            translations={translations}
          />

          <EditUserModal
            isOpen={!!editingUser && isAdmin}
            onClose={() => setEditingUser(null)}
            onSubmit={handleUpdate}
            isUpdating={isUpdating}
            editingUser={editingUser}
            translations={translations}
          />

          <DeleteUserModal
            isOpen={!!deletingUserId && isAdmin}
            onClose={() => setDeletingUserId(null)}
            onConfirm={handleConfirmedDelete}
            isDeleting={isDeleting}
            userToDelete={userToDelete}
            translations={translations}
          />
    </div>
  );
}