"use client";

import { useState, useEffect } from "react";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function CreateCategoryModal({ closeModal }) {
  const { createCategory, loading } = useCategoryStore();

  const [formData, setFormData] = useState({
    name: "",
    status: "1", // default active
    image_category: null, // File object
  });

  const [previewImage, setPreviewImage] = useState(null);

  // cleanup preview blob when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewImage);
        } catch (e) {}
      }
    };
  }, [previewImage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      // revoke previous blob if any
      if (previewImage && previewImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewImage);
        } catch (err) {}
      }
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    try {
      const data = new FormData();
      // required fields
      data.append("name", formData.name.trim());
      // status (0 or 1)
      if (formData.status !== undefined && formData.status !== null) {
        data.append("status", String(formData.status));
      }
  
    
      // image file only if a File object
      if (formData.image_category instanceof File) {
        data.append("image_category", formData.image_category);
      }

      await createCategory(data);

      // cleanup preview blob after successful upload
      if (previewImage && previewImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewImage);
        } catch (err) {}
      }

      toast.success("Category created successfully!");
      closeModal();
    } catch (err) {
      // normalize error message
      const msg = err?.response?.data?.message || err?.message || "Failed to create category";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Category</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category Image</label>
            <input
              type="file"
              name="image_category"
              accept=".png,.svg,.ico,image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            {previewImage && (
              <Image
                src={previewImage}
                width={80}
                height={80}
                alt="Preview"
                className="mt-2 h-20 w-20 object-cover rounded border"
                unoptimized={true}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
