"use client";

import { useState, useEffect } from "react";
import {
  MapPinIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useLanguageContext } from "../components/LanguageProviderClient";
import { useUserStore } from "../stores/userStore";
import Image from "next/image";
// note: we intentionally DON'T import next/image for preview to avoid URL construction errors

export default function ShopForm({ initialData = {}, onSubmit, loading, onBackClick }) {
  const { translations: t } = useLanguageContext();
  const { users, fetchAllUsers } = useUserStore();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // helper to normalize API status (numeric or string) -> 'active'|'inactive'


  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "1",
    latitude: "",
    longitude: "",
    owner_user_id: "",
    open_time: "",
    close_time: "",
    image: "", // file object or server path
  });

  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  // image preview string (blob: | data: | http(s): | relative path)
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!initialData || typeof initialData !== "object") return;

    setFormData({
      name: initialData.name ?? "",
      location: initialData.location ?? "",
      status: initialData.status ??"1",
      latitude: initialData.latitude ?? "",
      longitude: initialData.longitude ?? "",
      owner_user_id: initialData.owner_user_id ?? "",
      open_time: initialData.open_time ?? "",
      close_time: initialData.close_time ?? "",
      image: initialData.image ?? "",
    });

    // Prefer a full image_url if provided by API, otherwise try image (which might be relative)
    if (initialData.image_url && typeof initialData.image_url === "string") {
      setImagePreview(initialData.image_url);
    } else if (initialData.image && typeof initialData.image === "string") {
      setImagePreview(initialData.image);
    } else {
      setImagePreview(null);
    }
  }, [initialData]);

  // cleanup any blob URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && typeof imagePreview === "string" && imagePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, image: file }));

    if (file) {
      // revoke previous blob preview if any
      if (imagePreview && typeof imagePreview === "string" && imagePreview.startsWith("blob:")) {
        try { URL.revokeObjectURL(imagePreview); } catch (err) {}
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert(t.geolocationNotSupported || "Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setLocationStatus("success");
        setTimeout(() => setLocationStatus("idle"), 3000);
      },
      (err) => {
        console.error(err);
        setError(t.couldNotRetrieveLocation || "Could not retrieve location.");
        setLocationStatus("error");
        setTimeout(() => setLocationStatus("idle"), 5000);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err?.message || t.somethingWentWrong || "Something went wrong");
    }
  };

  const submitButtonText = initialData.id
    ? loading
      ? t.savingChanges || "Saving Changes..."
      : t.saveChanges || "Save Changes"
    : loading
    ? t.creatingShop || "Creating Shop..."
    : t.addShop || "Create Shop";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="space-y-4">
        {/* Owner select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.ownerUserId || "Owner User"}</label>
            <select
              name="owner_user_id"
              value={formData.owner_user_id}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="">{t.selectOwner || "Select Owner"}</option>
              {users?.filter(u => u.role === "owner")?.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name || owner.email || `User ${owner.id}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t.ownerUserIdHelp || "Select the owner of this shop."}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t.name || "Shop Name"}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t.location || "Location Address"}</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t.status || "Status"}</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            <option value="1">{t.active || "Active"}</option>
            <option value="0">{t.inactive || "Inactive"}</option>
          </select>
        </div>
      </div>

      {/* Geolocation & times */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.geographicCoordinates || "Geographic Coordinates"}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.latitude || "Latitude"}</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t.longitude || "Longitude"}</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleFetchLocation}
            disabled={locationStatus === "loading"}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              locationStatus === "loading"
                ? "bg-emerald-400 text-white cursor-not-allowed"
                : locationStatus === "success"
                ? "bg-green-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {locationStatus === "loading" && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
            {locationStatus === "success" && <CheckCircleIcon className="h-5 w-5" />}
            {locationStatus === "error" && <MapPinIcon className="h-5 w-5" />}
            {locationStatus === "loading" ? (t.locating || "Locating...") : (t.useCurrentLocation || "Use Current Location")}
          </button>

          {/* open_time (placed visually in grid; you can move it if desired) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.openTime || "Open Time"}</label>
            <input
              type="time"
              name="open_time"
              value={formData.open_time}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">{t.openTimeHelp || "Optional: shop opening time (HH:MM)."}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.closeTime || "Close Time"}</label>
            <input
              type="time"
              name="close_time"
              value={formData.close_time}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">{t.closeTimeHelp || "Optional: shop closing time (HH:MM)."}</p>
          </div>
        </div>

        {/* Image upload + preview */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">{t.image || "Image"}</label>
          <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="w-full text-sm" />
          <p className="text-xs text-gray-500 mt-1">{t.imageHelp || "Optional: upload an image (jpeg, png, gif, webp). Max 2MB."}</p>

          {imagePreview && (
            <div className="mt-3">
              {/* use plain <img> to avoid next/image URL validation errors */}
              <Image
                src={imagePreview}
                alt="Preview"
                width={80}
                height={80}
                className="max-w-xs max-h-40 rounded-md border object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t border-gray-200 flex justify-between gap-4">
        {onBackClick && (
          <button
            type="button"
            onClick={onBackClick}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-70"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {t.backToShops || "Back"}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ml-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition disabled:bg-emerald-400"
        >
          {loading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}
