// app/components/admin/items/ItemsTable.jsx
'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  TagIcon,
} from '@heroicons/react/24/outline';
import ItemRowSkeleton from '@/app/components/admin/items/ItemRowSkeleton';

// 1. Empty State
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-lg">
      <div className="bg-gray-50 p-4 rounded-full mb-3">
          <TagIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">No items found</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">
          Try adjusting your search or create a new item.
      </p>
  </div>
);

// 2. Toggle Switch Component
const ToggleSwitch = ({ item, handleToggle, togglingId }) => {
  const isChecked = item.is_available === 1 || item.is_available === true;
  const isLoading = togglingId === item.id;

  return (
    <button
      onClick={(e) => {
          e.stopPropagation();
          handleToggle(item.id, item.is_available);
      }}
      disabled={isLoading}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
        ${isChecked ? 'bg-green-500' : 'bg-gray-200'}
        ${isLoading ? 'opacity-50' : ''}
      `}
    >
      <span className="sr-only">Toggle availability</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${isChecked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

export default function ItemsTable({
  itemArray,
  loading,
  query,
  filterCategoryId,
  sortBy,
  fetchItems,
  handleDeleteClick,
  setEditingItemId,
  setShowEditItemModal,
  handleToggle,
  togglingId,
}) {
  const router = useRouter();

  const isGrouped =
    Array.isArray(itemArray) &&
    itemArray.length > 0 &&
    typeof itemArray[0] === 'object' &&
    'category' in itemArray[0] &&
    'items' in itemArray[0];

  const formatPrice = (val) => {
    if (val === undefined || val === null || val === '') return '—';
    const raw = parseFloat(val);
    if (!Number.isFinite(raw)) return String(val);
    return (raw / 100).toFixed(2);
  };
  
  const getPriceDisplay = (item) => {
      if (item.price_cents) return formatPrice(item.price_cents);
      if (item.price) return formatPrice(item.price);
      return '0.00';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const goDetail = (id) => {
    router.push(`/admin/items/detail/${id}`);
  };

  // Loading State
  if (loading) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {[...Array(5)].map((_, i) => <ItemRowSkeleton key={i} />)}
                </tbody>
            </table>
        </div>
    );
  }

  // Empty State
  if (!itemArray || (Array.isArray(itemArray) && itemArray.length === 0)) {
    return <EmptyState />;
  }

  // Render Table
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Item Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Available
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Updated
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            
            {/* --- GROUPED VIEW --- */}
            {isGrouped && itemArray.map((group, gIndex) => (
                <Fragment key={`group-${gIndex}`}>
                  {/* Category Header Row */}
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                           {group.category?.image_url ? (
                               <Image src={group.category.image_url} alt="" width={24} height={24} className="object-cover h-full w-full" unoptimized />
                           ) : (
                               <TagIcon className="h-3 w-3 text-gray-400" />
                           )}
                         </div>
                        <span className="text-sm font-bold text-gray-800">{group.category?.name || 'Uncategorized'}</span>
                        <span className="ml-2 text-xs text-gray-500">({group.items?.length || 0} items)</span>
                      </div>
                    </td>
                  </tr>

                  {/* Items in Group */}
                  {Array.isArray(group.items) && group.items.map((item) => (
                      <Row 
                        key={item.id} 
                        item={item} 
                        isGrouped={true}
                        formatDate={formatDate}
                        getPriceDisplay={getPriceDisplay}
                        goDetail={goDetail}
                        handleToggle={handleToggle}
                        setEditingItemId={setEditingItemId}
                        setShowEditItemModal={setShowEditItemModal}
                        handleDeleteClick={handleDeleteClick}
                        togglingId={togglingId}
                      />
                  ))}
                </Fragment>
            ))}

            {/* --- FLAT VIEW --- */}
            {!isGrouped && itemArray.map((item) => (
                <Row 
                    key={item.id} 
                    item={item} 
                    isGrouped={false}
                    formatDate={formatDate}
                    getPriceDisplay={getPriceDisplay}
                    goDetail={goDetail}
                    handleToggle={handleToggle}
                    setEditingItemId={setEditingItemId}
                    setShowEditItemModal={setShowEditItemModal}
                    handleDeleteClick={handleDeleteClick}
                    togglingId={togglingId}
                />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sub-component for Row (Image removed from first column)
function Row({ 
    item, isGrouped, getPriceDisplay, formatDate, goDetail, 
    setEditingItemId, setShowEditItemModal, handleDeleteClick, togglingId, handleToggle
}) {
    return (
        <tr className="hover:bg-blue-50/30 transition-colors">
            {/* Item Name (Text Only) */}
            <td className="px-6 py-3 whitespace-nowrap">
                <div 
                    className="flex flex-col cursor-pointer group" 
                    onClick={() => goDetail(item.id)}
                >
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                    </div>
                    {item.display_order && (
                        <div className="text-[10px] text-gray-400">Order: {item.display_order}</div>
                    )}
                </div>
            </td>

            {/* Category */}
            <td className="px-6 py-3 whitespace-nowrap">
                {isGrouped ? (
                   <span className="text-xs text-gray-400 italic">See Header</span>
                ) : (
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                     {item.category?.name || '—'}
                   </span>
                )}
            </td>

            {/* Price */}
            <td className="px-6 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-semibold">${getPriceDisplay(item)}</div>
            </td>

            {/* Status Toggle */}
            <td className="px-6 py-3 whitespace-nowrap">
                <ToggleSwitch item={item} handleToggle={handleToggle} togglingId={togglingId} />
            </td>

            {/* Date */}
            <td className="px-6 py-3 whitespace-nowrap hidden lg:table-cell">
                <span className="text-xs text-gray-500">{formatDate(item.updated_at)}</span>
            </td>

            {/* Actions */}
            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditingItemId(item.id); setShowEditItemModal(true); }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors"
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}