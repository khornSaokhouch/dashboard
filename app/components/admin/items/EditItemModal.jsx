'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useItemStore } from '@/app/stores/useItemStore';
import { useCategoryStore } from '@/app/stores/useCategoryStore';
import Image from 'next/image';
import { useToast } from '@/app/components/ToastNotification'; 
import { 
  XMarkIcon, 
  ArrowPathIcon, 
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  StopIcon,
  PencilSquareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function EditItemModal({ isOpen, onClose, itemId, onSuccess }) {
  const showToast = useToast();
  const { fetchItemById, updateItem, loading: itemStoreLoading } = useItemStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price_cents: '',
    is_available: true,
    current_image_url: '',
    image_url: '', 
  });

  const [loadingItem, setLoadingItem] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!isOpen || !itemId) {
        setForm({
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
        await fetchCategories();
        const item = await fetchItemById(itemId);
        if (!mounted) return;

        let priceDisplay = '';
        if (item.price_cents !== undefined && item.price_cents !== null) {
          const cents = Number(item.price_cents);
          priceDisplay = !Number.isNaN(cents) ? (cents / 100).toFixed(2) : String(item.price_cents);
        }

        setForm({
          category_id: item.category_id ?? '',
          name: item.name ?? '',
          description: item.description ?? '',
          price_cents: priceDisplay,
          is_available: item.is_available === 1 || item.is_available === true,
          current_image_url: item.image_url ?? '',
          image_url: item.image_url ?? '',
        });
      } catch (error) {
        showToast('Failed to load item: ' + error.message, 'error');
        onClose();
      } finally {
        if (mounted) setLoadingItem(false);
      }
    }
    loadData();
    return () => { 
        mounted = false; 
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); 
    };
  }, [isOpen, itemId, fetchCategories, fetchItemById]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files?.[0] ?? null;
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);

      if (!file) {
        setLocalPreviewUrl(null);
        setForm((prev) => ({ ...prev, image_url: prev.current_image_url || '' }));
        return;
      }
      setLocalPreviewUrl(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, image_url: file }));
      return;
    }

    if (name === 'is_available') {
         setForm((prev) => ({ ...prev, is_available: value === 'true' }));
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
      if (isNaN(parsed)) throw new Error('Invalid price.');
      const cents = Math.round(parsed * 100);
      formData.append('price_cents', String(cents));

      formData.append('is_available', form.is_available ? '1' : '0');

      if (form.image_url instanceof File) {
        formData.append('image_url', form.image_url);
      }

      await updateItem(itemId, formData);
      showToast('Item updated successfully!', 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast('Failed to update: ' + error.message, 'error');
    }
  };

  const formatToTwoDecimals = (val) => {
    if (!val) return '';
    const parsed = parseFloat(String(val).replace(',', '.'));
    return Number.isNaN(parsed) ? val : parsed.toFixed(2);
  };

  const loading = itemStoreLoading || loadingItem;
  // Logic to determine which image to show in preview
  const displayImage = localPreviewUrl || form.current_image_url;

  return (
    <Transition appear show={isOpen} as="div">
       <Dialog as="div" className="relative z-[100]" onClose={() => !loading && onClose()}>
        <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
            <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                        <div>
                            <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                Edit Item
                            </Dialog.Title>
                            <p className="text-xs text-gray-500">Update item details and availability.</p>
                        </div>
                        <button onClick={onClose} disabled={loading} className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {loadingItem ? (
                         <div className="flex-1 flex items-center justify-center p-12">
                             <div className="flex flex-col items-center text-gray-500">
                                <ArrowPathIcon className="h-8 w-8 animate-spin mb-2 text-indigo-500" />
                                <span className="text-sm font-medium">Loading item data...</span>
                             </div>
                         </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto lg:overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                                
                                {/* LEFT SIDE: Inputs (Cols 1-7) */}
                                <div className="lg:col-span-7 p-6 space-y-5 overflow-y-auto custom-scrollbar">
                                    
                                    {/* Image Upload - Compact */}
                                    <div className="flex items-center gap-4 p-3 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="relative w-16 h-16 shrink-0 bg-white rounded-lg shadow-sm border overflow-hidden flex items-center justify-center group">
                                            {displayImage ? (
                                                <Image src={displayImage} alt="Preview" fill className="object-cover" unoptimized />
                                            ) : (
                                                <PhotoIcon className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label htmlFor="image_url" className="block text-sm font-semibold text-indigo-600 cursor-pointer hover:text-indigo-500">
                                                Change Image
                                            </label>
                                            <p className="text-xs text-gray-500 truncate">Leave blank to keep current.</p>
                                            <input type="file" name="image_url" id="image_url" onChange={handleChange} accept="image/*" className="hidden" />
                                        </div>
                                    </div>

                                    {/* Name & Category Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Item Name</label>
                                            <div className="relative">
                                                <TagIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                                <input type="text" name="name" value={form.name} onChange={handleChange} required disabled={loading}
                                                    className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Category</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-2.5 w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-400 rounded-full">C</div>
                                                <select name="category_id" value={form.category_id} onChange={handleChange} required disabled={loading}
                                                    className="block w-full pl-10 pr-8 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm"
                                                >
                                                    <option value="">Select Category...</option>
                                                    {categories?.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Status Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Price ($)</label>
                                            <div className="relative">
                                                <CurrencyDollarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                                <input type="text" name="price_cents" value={form.price_cents} onChange={handleChange} 
                                                    onBlur={(e) => setForm((prev) => ({ ...prev, price_cents: formatToTwoDecimals(e.target.value) }))}
                                                    required disabled={loading}
                                                    className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Status</label>
                                            <div className="relative">
                                                {form.is_available ? 
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute left-3 top-2.5" /> : 
                                                    <StopIcon className="w-5 h-5 text-red-400 absolute left-3 top-2.5" />
                                                }
                                                <select name="is_available" value={form.is_available} onChange={handleChange} disabled={loading}
                                                    className="block w-full pl-10 pr-8 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm"
                                                >
                                                    <option value="true">Available</option>
                                                    <option value="false">Unavailable</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                                        <div className="relative">
                                            <DocumentTextIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                                            <textarea name="description" value={form.description} onChange={handleChange} rows={4} disabled={loading}
                                                className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE: Live Preview (Cols 8-12) */}
                                <div className="lg:col-span-5 bg-gray-50 border-l border-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                                     <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/5 to-transparent"></div>
                                     
                                     <div className="text-center mb-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Preview</h4>
                                        <p className="text-xs text-gray-400 mt-1">Live updates as you edit</p>
                                     </div>

                                     {/* Mobile Card Preview */}
                                     <div className="w-64 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform transition-all hover:scale-[1.02] duration-300">
                                        <div className="h-40 bg-gray-200 relative">
                                            {displayImage ? (
                                                <Image src={displayImage} alt="Preview" fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    <PhotoIcon className="w-12 h-12 opacity-50" />
                                                </div>
                                            )}
                                            {/* Price Tag Overlay */}
                                            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm text-sm font-bold text-gray-800">
                                                ${form.price_cents || '0.00'}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-bold text-gray-800 line-clamp-1">{form.name || "Item Name"}</h5>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 h-8">
                                                {form.description || "No description provided yet..."}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${form.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {form.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                                <button className="p-1.5 rounded-full bg-indigo-50 text-indigo-600">
                                                    <PlusIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={onClose} disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {itemStoreLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PencilSquareIcon className="w-4 h-4" />}
                                Update Item
                            </button>
                        </div>
                    </form>
                    )}
                </Dialog.Panel>
            </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}