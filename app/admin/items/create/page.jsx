'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import Image from 'next/image';

export default function CreateItemPage() {
  const router = useRouter();
  const { createItem, loading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price_cents: '',
    image_file: null,          // File object
    is_available: true,
    current_image_url: '',     // remote URL, if editing existing item (kept for fallback)
  });

  // local preview URL for selected file
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  useEffect(() => {
    // load categories on mount
    fetchCategories();
    // cleanup preview on unmount
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchCategories typically stable from store; if not, add to deps

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // File input handling
    if (type === 'file') {
      const file = files && files[0];

      // Revoke previous preview url if exists
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }

      if (file) {
        // create new preview and set file
        const previewUrl = URL.createObjectURL(file);
        setLocalPreviewUrl(previewUrl);
        setForm((prev) => ({ ...prev, image_file: file }));
      } else {
        // user cleared the file input: remove file and keep any remote url
        setForm((prev) => ({ ...prev, image_file: null }));
      }
      return;
    }

    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // default text/select/textarea handling
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('category_id', form.category_id);
      formData.append('name', form.name);
      formData.append('description', form.description);

      const parsed = parseFloat(String(form.price_cents).replace(',', '.'));
      if (isNaN(parsed)) {
        throw new Error('Invalid price. Please enter a numeric value like 2.43');
      }
      const cents = Math.round(parsed * 100);
      formData.append('price_cents', String(cents));

      formData.append('is_available', form.is_available ? '1' : '0');

      // Append file if present. Use the field name your backend expects.
      // Some backends expect 'image' or 'image_file' or 'image_url' (if sending URL).
      // Here we'll append as 'image' — change to 'image_url' if your server expects that name.
      if (form.image_file) {
        formData.append('image_url', form.image_file);
      }

      await createItem(formData);
      alert('Item created successfully!');
      router.push('/admin/items');
    } catch (err) {
      // make sure err.message exists
      const msg = err?.message || String(err);
      alert('Failed to create item: ' + msg);
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
          {/* Preview area: prefer local preview if file chosen, otherwise show remote current_image_url */}
          <div className="mt-3">
            {localPreviewUrl ? (
              <Image src={localPreviewUrl} alt="Preview" className="max-h-48 rounded-md object-contain" unoptimized width={80} height={80}/>
            ) : form.current_image_url ? (
              <Image src={form.current_image_url} alt="Current" className="max-h-48 rounded-md object-contain" unoptimized width={80} height={80}  />
            ) : null}
          </div>
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
