'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/app/stores/userStore';
import { useAuthStore } from '@/app/stores/authStore';
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function UsersPage() {
  const { users, fetchAllUsers, deleteUser, loading, error } = useUserStore();
  const { user, isHydrated } = useAuthStore();

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

  if (!user || user.role.toLowerCase() !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Access Denied. Admins only.</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        alert('User deleted successfully.');
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={fetchAllUsers}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition"
          disabled={loading}
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-500 text-center">Loading users...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {!loading && users.length > 0 && (
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        u.role.toLowerCase() === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && users.length === 0 && !error && (
        <p className="text-gray-500 text-center mt-6">No users found.</p>
      )}
    </div>
  );
}
