'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useShopStore } from '@/app/stores/useShopStore';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams(); // get dynamic route params
  const categoryId = params.id; // /edit/:id
  const { fetchCategoryById, updateCategory, loading } = useCategoryStore();
  const { shops, fetchShops } = useShopStore();

  const [formData, setFormData] = useState({
    shop_id: '',
    name: '',
    display_order: '',
    image_category: null,
  });

  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch shops
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Fetch category data
  useEffect(() => {
    const loadCategory = async () => {
      if (!categoryId) return;
      try {
        const category = await fetchCategoryById(categoryId);
        setFormData({
          shop_id: category.shop_id,
          name: category.name,
          display_order: category.display_order ?? '',
          image_category: null,
        });
        setPreviewImage(category.image_category_url ?? null);
      } catch (err) {
        setError('Failed to load category.');
      }
    };
    loadCategory();
  }, [categoryId, fetchCategoryById]);

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

      await updateCategory(categoryId, data);
      alert('Category updated successfully!');
      router.push('/dashboard/categories');
    } catch (err) {
      setError(err.message || 'Failed to update category');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Category</h1>

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
            onClick={() => router.push('/dashboard/categories')}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
