'use client';

import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!user) return null; // or a loader

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Main content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name}!</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Email</h3>
              <p>{user.email || 'Not provided'}</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Role</h3>
              <p>{user.role}</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">ID</h3>
              <p>{user.id}</p>
            </div>
          </div>

          {/* Additional dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Profile</h3>
              <p>Profile image and details can go here.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Settings</h3>
              <p>User settings and preferences can go here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
