"use client";

import { useState, useEffect } from "react";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import Image from "next/image";
import { useToast } from "../../ToastNotification";
import {
  ArrowUpOnSquareIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  translations = {},
}) {
  const { updateCategory, loading } = useCategoryStore();
  const showToast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    status: "1",
    image_category: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        status: category.status || "1",
        image_category: null,
      });
      setPreviewImage(category.image_category_url || category.image_url || null);
    }
  }, [category]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleChange = (e) => {
    const { name, value, files, checked } = e.target;

    if (name === "status") {
      setFormData((prev) => ({ ...prev, status: checked ? "1" : "0" }));
      return;
    }

    if (files && files[0]) {
      const file = files[0];
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData((prev) => ({ ...prev, image_category: file }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
      data.append("_method", "PUT");

      if (formData.image_category instanceof File) {
        data.append("image_category", formData.image_category);
      }

      await updateCategory(category.id, data);

      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      showToast(
        translations.categoryUpdated || "Category updated successfully!",
        "success"
      );
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        translations.failedToUpdateCategory ||
        "Failed to update category";
      showToast(msg, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />
      <div className="relative bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl transform transition">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {translations.editCategory || "Edit Category"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* NAME FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {translations.name || "Name"}
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2"
              placeholder={translations.namePlaceholder || "e.g. Coffee, Tea"}
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.categoryIcon || "Category Icon"}
            </label>

            <div className="mt-1 flex justify-center px-6 pt-5 pb-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition">
              <div className="text-center space-y-2">
                {previewImage ? (
                  <div className="relative group cursor-pointer w-32 h-32 mx-auto rounded-lg overflow-hidden border">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData((p) => ({ ...p, image_category: null }));
                        }}
                        className="bg-red-600 text-white p-1 rounded-full"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ArrowUpOnSquareIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <label
                      htmlFor="image_category_edit"
                      className="cursor-pointer text-gray-600 hover:text-gray-800 text-sm"
                    >
                      <span>{translations.uploadFile || "Upload File"}</span>
                      <input
                        id="image_category_edit"
                        name="image_category"
                        type="file"
                        className="sr-only"
                        onChange={handleChange}
                        accept=".ico"
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      {translations.icoOnly || "ICO file only"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.status || "Status"}
            </label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status === "1"}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="ml-3 text-sm text-gray-600">
                {formData.status === "1"
                  ? translations.active || "Active"
                  : translations.inactive || "Inactive"}
              </span>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg"
            >
              {translations.cancel || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
            >
              {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              {translations.updateCategory || "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
