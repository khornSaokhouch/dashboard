'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';

export default function CreateItemPage() {
  const router = useRouter();
  const { createItem, loading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price_cents: '',
    image_file: null,
    is_available: true,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }

    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('category_id', form.category_id);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price_cents', form.price_cents);
      formData.append('is_available', form.is_available ? '1' : '0');

      if (form.image_file) {
        formData.append('image_url', form.image_file);
      }

      await createItem(formData);
      alert('Item created successfully!');
      router.push('/admin/items');
    } catch (err) {
      alert('Failed to create item: ' + err.message);
    }
  };

   // Normalize user input and format to exactly 2 decimals (string)
   function formatToTwoDecimals(priceStr) {
    if (priceStr === null || priceStr === undefined || String(priceStr).trim() === '') return '';
    const parsed = parseFloat(String(priceStr).replace(',', '.'));
    if (Number.isNaN(parsed)) return String(priceStr); // leave invalid input unchanged
    return parsed.toFixed(2);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        {/* Category */}
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
            {categories?.map((cat) => (
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
          <label className="block text-gray-700 mb-1">Price (e.g. 1.43)</label>
          <input
            name="price_cents"
            value={form.price_cents}
            onChange={handleChange}
            onBlur={(e) =>
              setForm((prev) => ({ ...prev, price_cents: formatToTwoDecimals(e.target.value) }))
            }
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Image File */}
        <div>
          <label className="block text-gray-700 mb-1">Image</label>
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
}