"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCategoryStore } from "@/app/stores/useCategoryStore";
import Image from "next/image";
import { useToast } from "@/app/components/ToastNotification";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id;
  const { fetchCategoryById, updateCategory, loading } = useCategoryStore();
  const showToast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    status: "1",
    image_category: null, // File or null
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Load category once
  useEffect(() => {
    let mounted = true;
    const loadCategory = async () => {
      if (!categoryId) return;
      try {
        const category = await fetchCategoryById(categoryId);
        if (!mounted) return;

        setFormData({
          name: category.name ?? "",
          status: category.status ?? "1",
          image_category: null,
        });

        // Accept either image_url or image_category_url depending on API
        setPreviewImage(category.image_url ?? category.image_category_url ?? null);
      } catch (err) {
        if (!mounted) return;
        showToast("Failed to load category.", "error");
      }
    };

    loadCategory();
    return () => {
      mounted = false;
    };
  }, [categoryId, fetchCategoryById]);

  // Cleanup blob preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewImage && typeof previewImage === "string" && previewImage.startsWith("blob:")) {
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

      // revoke previous blob if we created one
      setPreviewImage((prev) => {
        if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(prev);
          } catch (err) {}
        }
        return URL.createObjectURL(file);
      });

      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast("Please enter a category name.", "error");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.status !== undefined && formData.status !== null) {
        data.append("status", String(formData.status));
      }

      if (formData.image_category instanceof File) {
        data.append("image_category", formData.image_category);
      }

      // Use POST + _method=PUT so Laravel accepts multipart
      data.append("_method", "PUT");

      await updateCategory(categoryId, data);

      // revoke local blob preview after successful upload
      if (previewImage && typeof previewImage === "string" && previewImage.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewImage);
        } catch (err) {}
      }

      showToast("Category updated successfully!", "success");
      router.push("/admin/categories");
    } catch (err) {
      // normalize message
      const msg = err?.response?.data?.message || err?.message || "Failed to update category";
      showToast(msg, "error");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Category</h1>

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

        {/* Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Status</label>
          <select
            name="status"
            value={String(formData.status)}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
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
            <div className="mt-2">
              {/* If previewImage is a remote URL Next may try to optimize it; unoptimized=true avoids requirement to list domains */}
              <Image
                src={previewImage}
                alt="Preview"
                width={80}
                height={80}
                className="h-20 w-20 object-cover rounded border"
                unoptimized={true}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            {loading ? "Updating..." : "Update Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
