'use client';

import { useState, useEffect } from 'react';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import Image from 'next/image';
import { useToast } from '../../ToastNotification'; // Relative path to ToastNotification
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // For close icon and loading spinner

export default function CreateItemModal({ isOpen, onClose, isCreating, onSuccess }) {
  const { createItem, loading: itemStoreLoading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();
  const showToast = useToast();

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price_cents: '',
    image_file: null,
    is_available: true,
  });

  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Load categories when the modal opens
      fetchCategories();
      // Reset form when modal opens
      setForm({
        category_id: '',
        name: '',
        description: '',
        price_cents: '',
        image_file: null,
        is_available: true,
      });
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
    }
    // Cleanup preview URL on unmount or when modal closes
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [isOpen, fetchCategories]); // fetchCategories stable from store

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files && files[0];

      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }

      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setLocalPreviewUrl(previewUrl);
        setForm((prev) => ({ ...prev, image_file: file }));
      } else {
        setForm((prev) => ({ ...prev, image_file: null }));
      }
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

      const parsed = parseFloat(String(form.price_cents).replace(',', '.'));
      if (isNaN(parsed)) {
        throw new Error('Invalid price. Please enter a numeric value like 2.43');
      }
      const cents = Math.round(parsed * 100);
      formData.append('price_cents', String(cents));

      formData.append('is_available', form.is_available ? '1' : '0');

      if (form.image_file) {
        formData.append('image_url', form.image_file);
      }

      await createItem(formData);
      showToast('Item created successfully!', 'success');
      onClose(); // Close modal on success
      if (onSuccess) onSuccess(); // Notify parent component
    } catch (err) {
      const msg = err?.message || String(err);
      showToast('Failed to create item: ' + msg, 'error');
    }
  };

  function formatToTwoDecimals(priceStr) {
    if (priceStr === null || priceStr === undefined || String(priceStr).trim() === '') return '';
    const parsed = parseFloat(String(priceStr).replace(',', '.'));
    if (Number.isNaN(parsed)) return String(priceStr);
    return parsed.toFixed(2);
  }

  if (!isOpen) return null;

  const loading = isCreating || itemStoreLoading;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />
      <div className="relative bg-white max-w-lg w-full rounded-2xl p-4 shadow-2xl transform transition">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Category */}
          <div>
            <label className="block text-gray-700 mb-1">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            <div className="mt-3">
              {localPreviewUrl && (
                <Image src={localPreviewUrl} alt="Preview" className="max-h-48 rounded-md object-contain" unoptimized width={80} height={80}/>
              )}
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
              disabled={loading}
            />
            <label className="text-gray-700">Available</label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
