'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useShopStore } from '@/app/stores/useShopStore';

export default function EditShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id;

  const { shops, fetchShops, updateShop, loading } = useShopStore();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: '',
    latitude: '',
    longitude: '',
    owner_user_id: '', // keep it hidden
  });

  const [error, setError] = useState(null);

  // Load shops if not already fetched
  useEffect(() => {
    if (shops.length === 0) fetchShops();
  }, [shops, fetchShops]);

  // Pre-fill form with shop data
  useEffect(() => {
    const shop = shops.find((s) => s.id.toString() === shopId);
    if (shop) {
      setFormData({
        name: shop.name || '',
        location: shop.location || '',
        status: shop.status || '',
        latitude: shop.latitude || '',
        longitude: shop.longitude || '',
        owner_user_id: shop.owner_user_id || '', // keep it hidden
      });
    }
  }, [shops, shopId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await updateShop({ id: shopId, ...formData });
      alert('Shop updated successfully!');
      router.push('/dashboard/shops');
    } catch (err) {
      setError(err.message || 'Failed to update shop');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Shop</h1>

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
            {loading ? 'Updating...' : 'Update Shop'}
          </button>
        </div>
      </form>
    </div>
  );
}
