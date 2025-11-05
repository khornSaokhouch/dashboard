'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/app/stores/userStore';
import { useAuthStore } from '@/app/stores/authStore';
import { TrashIcon, ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function UserTable() {
  const { users, fetchAllUsers, deleteUser, updateUser, loading, error } = useUserStore();
  const { user, isHydrated } = useAuthStore();

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: '' });

  useEffect(() => {
    if (isHydrated) fetchAllUsers();
  }, [isHydrated, fetchAllUsers]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Access Denied. You must be logged in.</p>
      </div>
    );
  }

  const isAdmin = user.role.toLowerCase() === 'admin';
  const isOwner = user.role.toLowerCase() === 'owner';

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        alert('User deleted successfully.');
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  const startEdit = (u) => {
    if (!isAdmin) return;
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone ?? '',
      role: u.role,
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await updateUser({
        id: editingUser.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        role: formData.role,
      });
      setEditingUser(null);
      alert('User updated successfully.');
      fetchAllUsers();
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    }
  };

  // Filter users based on role
  const filteredUsers = users.filter((u) => {
    if (isAdmin) return ['customer', 'owner'].includes(u.role.toLowerCase());
    if (isOwner) return u.role.toLowerCase() === 'customer';
    return false;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        {isAdmin && (
          <button
            onClick={fetchAllUsers}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500 text-center">Loading users...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {!loading && filteredUsers.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        u.role.toLowerCase() === 'owner'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => startEdit(u)}
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <PencilSquareIcon className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && !error && (
        <p className="text-gray-500 text-center mt-6">No users found.</p>
      )}

      {/* Edit User Modal */}
      {editingUser && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="owner">Owner</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
