'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/app/stores/userStore';
import { useAuthStore } from '@/app/stores/authStore';
import {
  TrashIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useLanguageContext } from '../components/LanguageProviderClient';

const getRoleBadge = (role) => {
    const lowerRole = role.toLowerCase();
    switch (lowerRole) {
        case 'admin':
            return 'bg-red-100 text-red-800';
        case 'owner':
            return 'bg-blue-100 text-blue-800';
        case 'customer':
        default:
            return 'bg-green-100 text-green-800';
    }
};

export default function UserTable() {
  const { users, fetchAllUsers, deleteUser, updateUser, loading, error } = useUserStore();
  const { user, isHydrated } = useAuthStore();
  const { translations } = useLanguageContext(); // ✅

  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isHydrated) fetchAllUsers();
  }, [isHydrated, fetchAllUsers]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500 bg-gray-50">
        <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-2" />
        {translations.loadingAuth || 'Loading authentication...'}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center text-red-700">
        <p>{translations.accessDenied || 'Access Denied. You must be logged in.'}</p>
      </div>
    );
  }

  const isAdmin = user.role.toLowerCase() === 'admin';
  const isOwner = user.role.toLowerCase() === 'owner';

  const userToDelete = users.find(u => u.id === deletingUserId);

  const startDelete = (id) => { if (!isAdmin) return; setDeletingUserId(id); };
  const handleConfirmedDelete = async () => {
    if (!isAdmin || !deletingUserId) return;
    setIsDeleting(true);
    try { await deleteUser(deletingUserId); setDeletingUserId(null); fetchAllUsers(); } 
    catch (err) { alert(translations.failedDeleteUser + err.message); } 
    finally { setIsDeleting(false); }
  };

  const startEdit = (u) => {
    if (!isAdmin) return;
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, phone: u.phone ?? '', role: u.role });
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsUpdating(true);
    try { await updateUser({ id: editingUser.id, ...formData }); setEditingUser(null); fetchAllUsers(); } 
    catch (err) { alert(translations.failedUpdateUser + err.message); } 
    finally { setIsUpdating(false); }
  };

  const filteredUsers = users.filter((u) => {
    if (isAdmin) return u.role.toLowerCase() !== 'admin';
    if (isOwner) return u.role.toLowerCase() === 'customer';
    return false;
  });

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="h-7 w-7 text-blue-600 mr-2" />
            {translations.userManagement || 'User Management'}
        </h1>
        {isAdmin && (
          <button
            onClick={fetchAllUsers}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-md disabled:bg-blue-400"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {translations.refreshData || 'Refresh Data'}
          </button>
        )}
      </div>

      {loading && <p className="text-blue-500 text-center py-8 flex items-center justify-center">
        <ArrowPathIcon className="h-6 w-6 animate-spin mr-2" /> {translations.fetchingUsers || 'Fetching users...'}
      </p>}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-semibold">{translations.error || 'Error:'}</p>
            <p>{error}</p>
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.name || 'Name'}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.email || 'Email'}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.phone || 'Phone'}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.role || 'Role'}</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">{translations.actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-blue-50/50 transition duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition duration-150"
                              title={translations.editUser || 'Edit User'}
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => startDelete(u.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition duration-150"
                              title={translations.deleteUser || 'Delete User'}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">{translations.noActions || 'No actions'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && !error && (
        <p className="text-gray-500 text-center mt-12 text-lg">{translations.noUsers || 'No users available for your role.'}</p>
      )}

{/* -------------------- 4. EDIT USER MODAL -------------------- */}
{editingUser && isAdmin && (
  <div className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-[100]">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
        {translations.editingUser || 'Editing User'}: <span className="text-blue-600">{editingUser.name}</span>
      </h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{translations.name || 'Name'}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{translations.email || 'Email'}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{translations.phone || 'Phone'}</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{translations.role || 'Role'}</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 transition"
            required
          >
            <option value="owner">{translations.owner || 'Owner'}</option>
            <option value="customer">{translations.customer || 'Customer'}</option>
          </select>
        </div>
        {/* Actions */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditingUser(null)}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 rounded-lg transition"
            disabled={isUpdating}
          >
            {translations.cancel || 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition disabled:bg-blue-400 flex items-center gap-2"
            disabled={isUpdating}
          >
            {isUpdating && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
            {translations.saveChanges || 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* -------------------- 5. DELETE CONFIRMATION MODAL -------------------- */}
{deletingUserId && userToDelete && isAdmin && (
  <div className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-[100]">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900">
        {translations.confirmDeletion || 'Confirm Deletion'}
      </h3>
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          {translations.confirmDeleteMessage || 'Are you sure you want to delete user'}{' '}
          <span className="font-bold text-red-600">{userToDelete.name}</span>? {translations.thisCannotBeUndone || 'This action cannot be undone.'}
        </p>
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => setDeletingUserId(null)}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 rounded-lg transition"
          disabled={isDeleting}
        >
          {translations.cancel || 'Cancel'}
        </button>
        <button
          type="button"
          onClick={handleConfirmedDelete}
          className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition disabled:bg-red-400 flex items-center gap-2"
          disabled={isDeleting}
        >
          {isDeleting && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
          {translations.deletePermanently || 'Delete Permanently'}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}