'use client';

import { useState, useEffect } from 'react';

export default function ShopForm({ initialData = {}, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'active',
    latitude: '',
    longitude: '',
    owner_user_id: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData && typeof initialData === 'object') {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name ?? '',
        location: initialData.location ?? '',
        status: initialData.status ?? 'active',
        latitude: initialData.latitude ?? '',
        longitude: initialData.longitude ?? '',
        owner_user_id: initialData.owner_user_id ?? '',
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <input type="hidden" name="owner_user_id" value={formData.owner_user_id} />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
      >
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </form>
  );
}
