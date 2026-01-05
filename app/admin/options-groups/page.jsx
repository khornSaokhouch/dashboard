"use client";

import { useEffect, useState, Fragment } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { useItemOptionStore } from "@/app/stores/useItemoptionStore";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  SwatchIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// --- Sub-Component: Empty State ---
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
    <div className="bg-indigo-50 p-4 rounded-full mb-4">
      <SwatchIcon className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">No Option Groups Found</h3>
    <p className="text-sm text-gray-500 mt-1 max-w-sm text-center mb-6">
      Create option groups like Sugar Level, Toppings, or Size to assign to your items.
    </p>
    <button 
      onClick={onAdd}
      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
    >
      <PlusIcon className="h-4 w-4" />
      Create First Group
    </button>
  </div>
);

// --- Sub-Component: Create/Edit Modal ---
function OptionGroupModal({ isOpen, onClose, onSubmit, initialData, isEditing }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "select",
    is_required: false,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
            name: initialData.name || "",
            type: initialData.type || "select",
            is_required: Boolean(initialData.is_required),
        });
      } else {
        setFormData({ name: "", type: "select", is_required: false });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                        {isEditing ? "Edit Option Group" : "New Option Group"}
                    </Dialog.Title>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Name</label>
                    <div className="relative">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="e.g. Sugar Level, Size"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all sm:text-sm"
                            required
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selection Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['select', 'radio', 'checkbox', 'text'].map((type) => (
                            <div 
                                key={type}
                                onClick={() => setFormData({ ...formData, type })}
                                className={`
                                    cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all
                                    ${formData.type === type 
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' 
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'}
                                `}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.type === type ? 'border-indigo-600' : 'border-gray-400'}`}>
                                    {formData.type === type && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                </div>
                                <span className="text-sm font-medium capitalize">{type}</span>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div>
                        <span className="block text-sm font-semibold text-gray-900">Status</span>
                        <span className="text-xs text-gray-500">If active, customer must make a selection.</span>
                    </div>
                    <Switch
                        checked={formData.is_required}
                        onChange={(checked) => setFormData({ ...formData, is_required: checked })}
                        className={`${
                            formData.is_required ? 'bg-indigo-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                    >
                        <span className={`${formData.is_required ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 shadow-sm">
                      {isEditing ? "Update Group" : "Create Group"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// --- Sub-Component: Delete Confirmation Modal ---
function DeleteOptionGroupModal({ isOpen, onClose, onDelete, loading, itemToDelete }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[200]" onClose={loading ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-2">
                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                      Delete Option Group
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-bold text-gray-900">{itemToDelete?.name}</span>? 
                        This will remove it from all linked items. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50"
                    onClick={onDelete}
                    disabled={loading}
                  >
                    {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin"/> : <TrashIcon className="h-4 w-4" />}
                    Delete Group
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// --- Main Page Component ---
export default function ItemOptionGroups() {
  const {
    options = [],
    fetchOptions,
    loading,
    error,
    createOption,
    updateOption,
    deleteOption,
  } = useItemOptionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOptions().catch(console.error);
  }, [fetchOptions]);

  const openCreateModal = () => {
    setEditingOption(null);
    setIsModalOpen(true);
  };

  const openEditModal = (option) => {
    setEditingOption(option);
    setIsModalOpen(true);
  };

  const openDeleteModal = (option) => {
    setOptionToDelete(option);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (data) => {
    try {
      await createOption(data);
      setIsModalOpen(false);
      fetchOptions();
    } catch (err) {
      alert("Failed to create option.");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateOption(editingOption.id, data);
      setIsModalOpen(false);
      setEditingOption(null);
      fetchOptions();
    } catch (err) {
      alert("Failed to update option.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!optionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOption(optionToDelete.id);
      await fetchOptions();
      setIsDeleteModalOpen(false);
      setOptionToDelete(null);
    } catch (err) {
      alert("Failed to delete option.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for Badge Styles
  const getTypeBadgeStyle = (type) => {
    switch (type) {
        case 'select': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
        case 'checkbox': return 'bg-purple-50 text-purple-700 ring-purple-600/20';
        case 'radio': return 'bg-orange-50 text-orange-700 ring-orange-600/20';
        default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Option Groups</h1>
            <p className="text-sm text-gray-500 mt-1">Manage modifiers and variations for your menu items.</p>
        </div>
        <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
            <PlusIcon className="h-4 w-4" />
            Add Group
        </button>
      </div>

      {/* Loading & Error */}
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{String(error)}</div>}
      
      {/* Search Bar */}
      {options.length > 0 && (
        <div className="mb-6 max-w-md relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search option groups..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-shadow"
            />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
             {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
        </div>
      ) : options.length === 0 ? (
        <EmptyState onAdd={openCreateModal} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider pl-8">Group Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider pr-8">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredOptions.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">No matching results</td></tr>
                    )}
                    {filteredOptions.map((option) => (
                        <tr key={option.id} className="hover:bg-gray-50/80 transition-colors group">
                            
                            {/* Name (ID Removed) */}
                            <td className="px-6 py-4 pl-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ListBulletIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {option.name}
                                    </div>
                                </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getTypeBadgeStyle(option.type)} uppercase`}>
                                    {option.type}
                                </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                                {option.is_required ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                        Inactive
                                    </span>
                                )}
                            </td>

                            {/* Actions (Always Visible) */}
                            <td className="px-6 py-4 text-right pr-8">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => openEditModal(option)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => openDeleteModal(option)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      <OptionGroupModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingOption ? handleUpdate : handleCreate}
        initialData={editingOption}
        isEditing={!!editingOption}
      />

      {/* Modal for Delete Confirmation */}
      <DeleteOptionGroupModal
        isOpen={isDeleteModalOpen}
        itemToDelete={optionToDelete}
        onDelete={handleDeleteConfirm}
        onClose={() => setIsDeleteModalOpen(false)}
        loading={isDeleting}
      />
    </div>
  );
}