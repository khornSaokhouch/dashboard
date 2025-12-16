"use client";

import { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { 
  ArrowPathIcon, 
  PlusIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  PhotoIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useUserStore } from "@/app/stores/userStore";
import Image from "next/image";

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Map Click Handler
const LocationPicker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
};

const initialFormData = {
  name: "",
  location: "",
  status: "1",
  owner_user_id: "",
  open_time: "08:00",
  close_time: "17:00",
  latitude: 11.5564,
  longitude: 104.9282,
  image: null,
};

export default function CreateShopModal({ isOpen, onClose, onSubmit, isCreating, translations }) {
  const [formData, setFormData] = useState(initialFormData);
  const [position, setPosition] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { users, fetchAllUsers } = useUserStore();
  const owners = users.filter(user => user.role === 'owner');

  useEffect(() => {
    if (isOpen) {
        fetchAllUsers();
        const initialPosition = L.latLng(formData.latitude, formData.longitude);
        setPosition(initialPosition);
    } else {
        setFormData(initialFormData);
        setImagePreview(null);
        setPosition(null);
    }
  }, [isOpen, fetchAllUsers]);
  
  useEffect(() => {
    if (position) {
      setFormData(prev => ({ ...prev, latitude: position.lat, longitude: position.lng }));
    }
  }, [position]);
  
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
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
            {/* Wider Modal (max-w-5xl) to allow side-by-side layout */}
            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div>
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    {translations.addShop || "Add New Shop"}
                  </Dialog.Title>
                  <p className="text-xs text-gray-500">Enter details and pin location.</p>
                </div>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Main Content - Grid Layout */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto lg:overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                    
                    {/* LEFT SIDE: Inputs (Cols 1-5) */}
                    <div className="lg:col-span-5 p-6 space-y-5 overflow-y-auto custom-scrollbar">
                      
                      {/* Image Upload - Compact Horizontal */}
                      <div className="flex items-center gap-4 p-3 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="relative w-16 h-16 shrink-0 bg-white rounded-lg shadow-sm border overflow-hidden flex items-center justify-center group">
                          {imagePreview ? (
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                          ) : (
                            <PhotoIcon className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <label htmlFor="image" className="block text-sm font-semibold text-indigo-600 cursor-pointer hover:text-indigo-500">
                                {translations.uploadImage || "Upload Logo"}
                            </label>
                            <p className="text-xs text-gray-500 truncate">Max 10MB. PNG, JPG.</p>
                            <input type="file" name="image" id="image" onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">{translations.name || "Shop Name"}</label>
                        <div className="relative">
                            <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                            className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm" placeholder="e.g. Coffee House" />
                        </div>
                      </div>

                      {/* Owner & Status Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">{translations.owner || "Owner"}</label>
                            <div className="relative">
                                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                <select name="owner_user_id" value={formData.owner_user_id} onChange={handleChange} required
                                className="block w-full pl-10 pr-8 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm">
                                    <option value="">Select...</option>
                                    {owners.map(owner => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">{translations.status || "Status"}</label>
                            <div className="relative">
                                <TagIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                <select name="status" value={formData.status} onChange={handleChange}
                                className="block w-full pl-10 pr-8 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm">
                                    <option value="1">Active</option>
                                    <option value="0">Pending</option>
                                </select>
                            </div>
                        </div>
                      </div>

                      {/* Time Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">{translations.openTime || "Open"}</label>
                            <input type="time" name="open_time" value={formData.open_time} onChange={handleChange} required
                            className="block w-full px-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">{translations.closeTime || "Close"}</label>
                            <input type="time" name="close_time" value={formData.close_time} onChange={handleChange} required
                            className="block w-full px-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm" />
                        </div>
                      </div>

                      {/* Location Input */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">{translations.location || "Address"}</label>
                        <div className="relative">
                            <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required
                            className="block w-full pl-10 pr-3 py-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm shadow-sm" placeholder="Street address..." />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE: Map (Cols 6-12) */}
                    <div className="lg:col-span-7 relative h-96 lg:h-auto bg-gray-100 border-l border-gray-200">
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-md text-xs font-medium text-gray-600 border border-gray-200 pointer-events-none">
                         Click map to pin location
                      </div>
                      <MapContainer
                        center={[formData.latitude, formData.longitude]}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker position={position} setPosition={setPosition} />
                      </MapContainer>
                    </div>
                  </div>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                    {translations.cancel || "Cancel"}
                  </button>
                  <button type="submit" disabled={isCreating} className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isCreating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                    {translations.addShop || "Create Shop"}
                  </button>
                </div>
              </form>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}