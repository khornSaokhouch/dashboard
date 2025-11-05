'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import { useShopStore } from '@/app/stores/useShopStore';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams(); // assuming URL is /dashboard/items/edit/[id]
  const itemId = params.id;

  const { fetchItemById, updateItem, loading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { shops, fetchShops, loading: shopsLoading } = useShopStore();

  const [form, setForm] = useState({
    shop_id: '',
    category_id: '',
    name: '',
    description: '',
    price_cents: '',
    image_file: null,
    is_available: true,
    display_order: '',
    current_image_url: '',
  });

  const [loadingItem, setLoadingItem] = useState(true);

  useEffect(() => {
    async function loadData() {
      await fetchCategories();
      await fetchShops();
      try {
        const item = await fetchItemById(itemId);
        setForm({
          shop_id: item.shop_id || '',
          category_id: item.category_id || '',
          name: item.name || '',
          description: item.description || '',
          price_cents: item.price_cents || '',
          image_file: null,
          is_available: item.is_available ?? true,
          display_order: item.display_order || '',
          current_image_url: item.image_url || '',
        });
      } catch (err) {
        alert('Failed to load item: ' + err.message);
      } finally {
        setLoadingItem(false);
      }
    }
    loadData();
  }, [itemId, fetchItemById, fetchCategories, fetchShops]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('shop_id', form.shop_id);
      formData.append('category_id', form.category_id);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price_cents', form.price_cents);
      formData.append('is_available', form.is_available ? '1' : '0');
      if (form.display_order) formData.append('display_order', form.display_order);
      if (form.image_file) formData.append('image_url', form.image_file);

      await updateItem(itemId, formData);
      alert('Item updated successfully!');
      router.push('/admin/items');
    } catch (err) {
      alert('Failed to update item: ' + err.message);
    }
  };

  if (loadingItem) return <p className="text-center p-8 text-gray-500">Loading item...</p>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        {/* Shop Select */}
        <div>
          <label className="block text-gray-700 mb-1">Shop</label>
          <select
            name="shop_id"
            value={form.shop_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {shopsLoading && <p className="text-gray-500 text-sm mt-1">Loading shops...</p>}
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-gray-700 mb-1">Category</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            rows={3}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-700 mb-1">Price (in cents)</label>
          <input
            type="number"
            name="price_cents"
            value={form.price_cents}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Current Image Preview */}
        {form.current_image_url && !form.image_file && (
          <div>
            <label className="block text-gray-700 mb-1">Current Image</label>
            <img src={form.current_image_url} alt={form.name} className="h-20 w-20 object-cover rounded" />
          </div>
        )}

        {/* Image File */}
        <div>
          <label className="block text-gray-700 mb-1">Change Image</label>
          <input
            type="file"
            name="image_file"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-gray-700">Available</label>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-gray-700 mb-1">Display Order</label>
          <input
            type="number"
            name="display_order"
            value={form.display_order}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
