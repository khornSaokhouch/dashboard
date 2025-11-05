'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useShopStore } from '@/app/stores/useShopStore';

export default function CreateCategoryPage() {
  const router = useRouter();
  const { createCategory, loading } = useCategoryStore();
  const { shops, fetchShops } = useShopStore();

  const [formData, setFormData] = useState({
    shop_id: '',
    name: '',
    display_order: '',
    image_category: null, // file
  });

  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch shops on load
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.shop_id) {
      setError('Please select a shop.');
      return;
    }

    try {
      const data = new FormData();
      data.append('shop_id', Number(formData.shop_id));
      data.append('name', formData.name);
      if (formData.display_order) data.append('display_order', formData.display_order);
      if (formData.image_category) data.append('image_category', formData.image_category);

      await createCategory(data);
      alert('Category created successfully!');
      router.push('/admin/categories');
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Category</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Shop</label>
          <select
            name="shop_id"
            value={formData.shop_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Name */}
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

        {/* Display Order */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Display Order</label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Category Image */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Category Image</label>
          <input
            type="file"
            name="image_category"
            accept="image/*"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-2 h-20 w-20 object-cover rounded border"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
