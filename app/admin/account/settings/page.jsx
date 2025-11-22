'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/authStore';
import { useRouter } from 'next/navigation';
import {
  Cog6ToothIcon,
  KeyIcon,
  UserIcon,
  ArrowPathIcon,
  BellAlertIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useLanguageContext } from '../../../components/LanguageProviderClient';

// --- MOCK API FUNCTIONS (Replace with real logic) ---
const mockUpdateUserPassword = async (oldPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (oldPassword === 'invalid') reject({ message: 'Invalid current password.' });
      else resolve({ success: true });
    }, 1500);
  });
};
const mockUpdateNotifications = async (settings) => {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
};

// --- SUB-COMPONENT: Password Change Form ---
function PasswordSettings() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      await mockUpdateUserPassword(formData.currentPassword, formData.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-colors duration-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
      
      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-blue-400">
          {loading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}

// --- SUB-COMPONENT: Notification Settings ---
function NotificationSettings() {
    const [settings, setSettings] = useState({ emailNotifications: true, smsAlerts: false });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleToggle = (name) => setSettings(prev => ({ ...prev, [name]: !prev[name] }));

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);
        try {
            await mockUpdateNotifications(settings);
            setMessage({ type: 'success', text: 'Notification preferences saved.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h3>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {message.text}
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive alerts and updates via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} className="sr-only peer"/>
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">SMS Alerts</p>
                        <p className="text-sm text-gray-500">Get urgent alerts sent to your phone number.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.smsAlerts} onChange={() => handleToggle('smsAlerts')} className="sr-only peer"/>
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:bg-green-400">
                {loading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
                Save Notifications
            </button>
        </div>
    );
}

// --- SUB-COMPONENT: Profile Edit Form ---
function ProfileSettings() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ 
      name: user?.name || '', 
      email: user?.email || '', 
      phone: user?.phone || '' 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || ''
          });
      }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      // MOCK UPDATE
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-colors duration-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile Information</h3>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-blue-400">
          {loading && <ArrowPathIcon className="h-5 w-5 animate-spin" />}
          Save Profile
        </button>
      </form>
    </div>
  );
}

function GeneralSettings() {
  const { lang, setLanguage, translations: t } = useLanguageContext();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {t.generalPreferences || "General Preferences"}
      </h3>

      {/* Language Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.language || "Language"}
        </label>
        <select
          value={lang}
          onChange={(e) => setLanguage(e.target.value)} // fixed
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 transition max-w-xs"
        >
          <option value="en">{t.english || "English (EN)"}</option>
          <option value="kh">{t.khmer || "Khmer (KH)"}</option>
        </select>
        <p className="text-xs text-gray-500 italic">
          {t.languageNote || "Note: Requires application-wide language context implementation."}
        </p>
      </div>
    </div>
  );
}


// --- MAIN SETTINGS PAGE COMPONENT ---
export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Removed all theme state logic (useState, useEffect, setTheme)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon, component: ProfileSettings },
    { id: 'general', name: 'Appearance', icon: AcademicCapIcon, component: GeneralSettings },
    { id: 'password', name: 'Security', icon: KeyIcon, component: PasswordSettings },
    { id: 'notifications', name: 'Notifications', icon: BellAlertIcon, component: NotificationSettings },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ProfileSettings;

  return (
    // Base background is controlled by AdminLayout, ensuring this content area is clean
    <div className="pt-0 max-w-6xl mx-auto"> 
      
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Cog6ToothIcon className="h-8 w-8 text-blue-600 mr-3" />
          User Settings
        </h1>
        <p className="text-gray-500">Configure your account preferences and security.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Navigation Tabs */}
        <nav className="lg:col-span-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 h-fit transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Sections</h2>
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Column: Active Settings Panel */}
        <div className="lg:col-span-3">
            <ActiveComponent />
        </div>
      </div>
    </div>
  );
}