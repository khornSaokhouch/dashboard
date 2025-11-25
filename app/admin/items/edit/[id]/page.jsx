'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import Image from 'next/image';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id;

  const { fetchItemById, updateItem, loading } = useItemStore();
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

  const [loadingItem, setLoadingItem] = useState(true);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  // Normalize user input and format to exactly 2 decimals (string)
  function formatToTwoDecimals(priceStr) {
    if (priceStr === null || priceStr === undefined || String(priceStr).trim() === '') return '';
    const parsed = parseFloat(String(priceStr).replace(',', '.'));
    if (Number.isNaN(parsed)) return String(priceStr); // leave invalid input unchanged
    return parsed.toFixed(2);
  }

  // Load item + categories when itemId changes
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!itemId) return;

      setLoadingItem(true);

      try {
        await fetchCategories();

        const item = await fetchItemById(itemId);

        if (!mounted) return;

        // If API returns integer cents, convert to decimal string for the UI
        let priceDisplay = '';
        if (item.price_cents !== undefined && item.price_cents !== null && item.price_cents !== '') {
          const cents = Number(item.price_cents);
          if (!Number.isNaN(cents)) {
            priceDisplay = (cents / 100).toFixed(2);
          } else {
            // fallback: use whatever came from API
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
          // default image_url to the current URL (string) until user selects a file
          image_url: item.image_url ?? '',
        });
      } catch (error) {
        alert('Failed to load item: ' + (error?.message ?? String(error)));
      } finally {
        if (mounted) setLoadingItem(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
    // include deps that come from hooks/stores to satisfy lint and ensure freshness
  }, [itemId, fetchCategories, fetchItemById]);

  // Revoke object URL on unmount or whenever localPreviewUrl changes (cleanup runs before next effect)
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

      // revoke existing preview if present
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }

      if (!file) {
        // user cleared file selection: restore image_url to the existing remote URL
        setForm((prev) => ({
          ...prev,
          image_url: prev.current_image_url || '',
        }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setLocalPreviewUrl(preview);

      setForm((prev) => ({
        ...prev,
        // store the File object so we can append it to FormData on submit
        image_url: file,
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

      // parse decimal price (like "2.43") then convert to integer cents (243)
      const parsed = parseFloat(String(form.price_cents).replace(',', '.'));
      if (isNaN(parsed)) {
        throw new Error('Invalid price. Please enter a numeric value like 2.43');
      }
      const cents = Math.round(parsed * 100);
      formData.append('price_cents', String(cents));

      formData.append('is_available', form.is_available ? '1' : '0');

      // Only append file if the user selected a File object
      if (form.image_url instanceof File) {
        formData.append('image_url', form.image_url);
      }
      // If they didn't choose a new file, we don't append image_url so the backend keeps the existing one

      await updateItem(itemId, formData);

      alert('Item updated successfully!');
      router.push('/admin/items');
    } catch (error) {
      alert('Failed to update item: ' + (error?.message ?? String(error)));
    }
  };

  if (loadingItem) return <p className="text-center p-8 text-gray-500">Loading item...</p>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Item</h1>

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
          <input type="file" accept="image/*" name="image_url" onChange={handleChange} />
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
          />
          <span>Available</span>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
