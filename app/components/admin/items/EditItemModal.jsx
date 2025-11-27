'use client';

import { useState, useEffect } from 'react';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import Image from 'next/image';
import { useToast } from '../../ToastNotification'; // Relative path to ToastNotification
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // For close icon and loading spinner

export default function EditItemModal({ isOpen, onClose, itemId, onSuccess }) {
  const showToast = useToast();
  const { fetchItemById, updateItem, loading: itemStoreLoading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price_cents: '', // displayed as decimal string like "2.43"
    is_available: true,
    current_image_url: '',
    image_url: '', // either URL string or File object
  });

  const [loadingItem, setLoadingItem] = useState(false); // Only internal loading for fetching existing item
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  // Normalize user input and format to exactly 2 decimals (string)
  function formatToTwoDecimals(priceStr) {
    if (priceStr === null || priceStr === undefined || String(priceStr).trim() === '') return '';
    const parsed = parseFloat(String(priceStr).replace(',', '.'));
    if (Number.isNaN(parsed)) return String(priceStr); // leave invalid input unchanged
    return parsed.toFixed(2);
  }

  // Load item + categories when modal opens or itemId changes
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!isOpen || !itemId) {
        setForm({ // Reset form when modal is not open or no itemId
          category_id: '',
          name: '',
          description: '',
          price_cents: '',
          is_available: true,
          current_image_url: '',
          image_url: '',
        });
        if (localPreviewUrl) {
          URL.revokeObjectURL(localPreviewUrl);
          setLocalPreviewUrl(null);
        }
        return;
      }

      setLoadingItem(true);

      try {
        await fetchCategories(); // Always fetch categories when modal opens

        const item = await fetchItemById(itemId);

        if (!mounted) return;

        let priceDisplay = '';
        if (item.price_cents !== undefined && item.price_cents !== null && item.price_cents !== '') {
          const cents = Number(item.price_cents);
          if (!Number.isNaN(cents)) {
            priceDisplay = (cents / 100).toFixed(2);
          } else {
            priceDisplay = String(item.price_cents);
          }
        }

        setForm({
          category_id: item.category_id ?? '',
          name: item.name ?? '',
          description: item.description ?? '',
          price_cents: priceDisplay,
          is_available: item.is_available === 1 || item.is_available === true,
          current_image_url: item.image_url ?? '',
          image_url: item.image_url ?? '', // Default to current URL, will be replaced by File if selected
        });
      } catch (error) {
        showToast('Failed to load item: ' + (error?.message ?? String(error)), 'error');
        onClose(); // Close modal on error loading item
      } finally {
        if (mounted) setLoadingItem(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [isOpen, itemId, fetchCategories, fetchItemById]); // Add isOpen and itemId to dependencies

  // Revoke object URL for local preview on unmount or whenever localPreviewUrl changes
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);


  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files?.[0] ?? null;

      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }

      if (!file) {
        setForm((prev) => ({
          ...prev,
          image_url: prev.current_image_url || '', // Revert to remote URL if file cleared
        }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setLocalPreviewUrl(preview);

      setForm((prev) => ({
        ...prev,
        image_url: file, // Store the File object
      }));
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

      formData.append('category_id', String(form.category_id));
      formData.append('name', form.name);
      formData.append('description', form.description);

      const parsed = parseFloat(String(form.price_cents).replace(',', '.'));
      if (isNaN(parsed)) {
        throw new Error('Invalid price. Please enter a numeric value like 2.43');
      }
      const cents = Math.round(parsed * 100);
      formData.append('price_cents', String(cents));

      formData.append('is_available', form.is_available ? '1' : '0');

      if (form.image_url instanceof File) {
        formData.append('image_url', form.image_url);
      }

      await updateItem(itemId, formData);

      showToast('Item updated successfully!', 'success');
      onClose(); // Close modal on success
      if (onSuccess) onSuccess(); // Notify parent component
    } catch (error) {
      showToast('Failed to update item: ' + (error?.message ?? String(error)), 'error');
    }
  };

  if (!isOpen) return null;

  const loading = itemStoreLoading || loadingItem;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />
      <div className="relative bg-white max-w-lg w-full rounded-2xl p-4 shadow-2xl transform transition">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Item ({itemId})</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loadingItem ? (
          <div className="text-center p-8 text-gray-500 flex items-center justify-center gap-2">
            <ArrowPathIcon className="h-5 w-5 animate-spin" /> Loading item...
          </div>
        ) : (
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
              <label className="block text-gray-700 mb-1">Price (e.g. 2.43)</label>
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

            {/* Image Preview */}
            {(localPreviewUrl || form.current_image_url) && (
              <div>
                <label className="block text-gray-700 mb-1">Image Preview</label>
                <div className="h-20 w-20 rounded overflow-hidden border">
                  {localPreviewUrl ? (
                    // use native <img> for blob preview URL
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={localPreviewUrl} className="h-full w-full object-cover" alt="preview" />
                  ) : (
                    <Image
                      src={form.current_image_url}
                      alt={form.name}
                      width={80}
                      height={80}
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
              </div>
            )}

            {/* Change Image */}
            <div>
              <label className="block text-gray-700 mb-1">Change Image</label>
              <input
                type="file"
                accept="image/*"
                name="image_url"
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_available"
                checked={form.is_available}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Available</span>
            </div>

            {/* Submit */}
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
                className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {itemStoreLoading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                Update Item
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
