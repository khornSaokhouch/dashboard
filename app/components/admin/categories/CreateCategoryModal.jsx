"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import Image from "next/image";
import { useToast } from "../../ToastNotification";
import {
  XMarkIcon,
  ArrowPathIcon,
  TagIcon,
  PhotoIcon,
  PlusIcon ,
} from "@heroicons/react/24/outline";

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  translations = {},
}) {
  const { createCategory, loading } = useCategoryStore();
  const showToast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    status: "1",
    image_category: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Reset form when modal is closed or opened
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", status: "1", image_category: null });
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);
    }
  }, [isOpen]);

  // Clean up blob URL
  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name === 'status') {
        setFormData(prev => ({ ...prev, status: e.target.checked ? '1' : '0' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData((prev) => ({ ...prev, image_category: file }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast(
        translations.pleaseEnterName || "Please enter a category name.",
        "error"
      );
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("status", formData.status);

      if (formData.image_category instanceof File) {
        data.append("image_category", formData.image_category);
      }
      
      // We call the passed onSubmit prop which is handleCreate in the page
      onSubmit(data);
      onClose();

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        translations.failedToCreateCategory ||
        "Failed to create category";
      showToast(msg, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900"
                >
                  {translations.createNewCategory || "Create New Category"}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">

                  {/* Category Details Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-md font-semibold text-gray-800 mb-4">Category Details</p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{translations.name || "Name"}</label>
                        <TagIcon className="pointer-events-none w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3 mt-2" />
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder={translations.namePlaceholder || "e.g. Coffee, Tea"} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations.status || "Status"}
                        </label>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="status" checked={formData.status === "1"} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                          <span className="ml-3 text-sm text-gray-600">
                            {formData.status === "1" ? (translations.active || "Active") : (translations.inactive || "Inactive")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Image Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-md font-semibold text-gray-800 mb-4">Category Icon</p>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                            {previewImage ? (
                                <Image src={previewImage} alt="Image Preview" width={96} height={96} className="object-cover"/>
                            ) : (
                                <PhotoIcon className="w-12 h-12 text-gray-300"/>
                            )}
                        </div>
                        <div className="flex-grow">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">{translations.uploadImage || "Upload Icon"}</label>
                            <input type="file" name="image_category" id="image" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            <p className="text-xs text-gray-500 mt-1">Recommended: PNG, JPG, or ICO.</p>
                        </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2">
                      {translations.cancel || "Cancel"}
                    </button>
                    <button type="submit" disabled={isCreating} className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-indigo-400">
                      {isCreating ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
                      {translations.createCategory || "Create Category"}
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

