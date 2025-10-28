'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStore } from '@/app/stores/useShopStore';
import { useAuthStore } from '@/app/stores/authStore';

export default function CreateShopPage() {
  const router = useRouter();
  const { createShop, loading } = useShopStore();
  const { user, isHydrated } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: '',
    latitude: '',
    longitude: '',
    owner_user_id: '', // keep hidden
  });

  const [error, setError] = useState(null);

  // Set owner_user_id to logged-in user by default
  useEffect(() => {
    if (isHydrated && user) {
      setFormData((prev) => ({ ...prev, owner_user_id: user.id }));
    }
  }, [isHydrated, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createShop(formData);
      alert('Shop created successfully!');
      router.push('/dashboard/shops'); // redirect back to table
    } catch (err) {
      setError(err.message || 'Failed to create shop');
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading user...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Shop</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Hidden input for owner_user_id */}
        <input type="hidden" name="owner_user_id" value={formData.owner_user_id} />

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/shops')}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {loading ? 'Creating...' : 'Create Shop'}
          </button>
        </div>
      </form>
    </div>
  );
}
