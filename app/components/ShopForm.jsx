'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, ArrowPathIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLanguageContext } from '../components/LanguageProviderClient';

export default function ShopForm({ initialData = {}, onSubmit, loading, onBackClick }) {
  const { translations: t } = useLanguageContext(); // get translation

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'active',
    latitude: '',
    longitude: '',
    owner_user_id: '',
  });
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    if (!initialData || typeof initialData !== 'object') return;
    setFormData({
      name: initialData.name ?? '',
      location: initialData.location ?? '',
      status: initialData.status ?? 'active',
      latitude: initialData.latitude ?? '',
      longitude: initialData.longitude ?? '',
      owner_user_id: initialData.owner_user_id ?? '',
    });
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert(t.geolocationNotSupported || 'Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setLocationStatus('success');
        setTimeout(() => setLocationStatus('idle'), 3000);
      },
      (err) => {
        console.error(err);
        setError(t.couldNotRetrieveLocation || 'Could not retrieve location.');
        setLocationStatus('error');
        setTimeout(() => setLocationStatus('idle'), 5000);
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
      setError(err?.message || t.somethingWentWrong || 'Something went wrong');
    }
  };

  const submitButtonText = initialData.id
    ? loading
      ? t.savingChanges || 'Saving Changes...'
      : t.saveChanges || 'Save Changes'
    : loading
    ? t.creatingShop || 'Creating Shop...'
    : t.addShop || 'Create Shop';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.name || 'Shop Name'}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.location || 'Location Address'}
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.status || 'Status'}
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="active">{t.active || 'Active'}</option>
            <option value="inactive">{t.inactive || 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Geolocation */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {t.geographicCoordinates || 'Geographic Coordinates'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.latitude || 'Latitude'}
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.longitude || 'Longitude'}
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleFetchLocation}
            disabled={locationStatus === 'loading'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              locationStatus === 'loading'
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : locationStatus === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {locationStatus === 'loading' && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
            {locationStatus === 'success' && <CheckCircleIcon className="h-5 w-5" />}
            {locationStatus === 'error' && <MapPinIcon className="h-5 w-5" />}
            {locationStatus === 'loading'
              ? t.locating || 'Locating...'
              : t.useCurrentLocation || 'Use Current Location'}
          </button>
        </div>
      </div>

      <input type="hidden" name="owner_user_id" value={formData.owner_user_id} />

      {/* Buttons */}
      <div className="pt-4 border-t border-gray-200 flex justify-between gap-4">
        {onBackClick && (
          <button
            type="button"
            onClick={onBackClick}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-70"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {t.backToShops || 'Back'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="ml-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-blue-400"
        >
          {loading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}
