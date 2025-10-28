'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState('');

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const { user } = await login(email, password); // <-- destructure here
    if (user.role === 'admin') {
      router.push('/dashboard');
    } else {
      setError('You do not have permission to access the admin dashboard.');
    }
  } catch (err) {
    setError(err.response?.data?.message || err.message || 'Login failed');
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: 'url("/images/login_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-black/25"></div>

      <div className="relative bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/images/logo.png"
            alt="Sunrise Coffee Logo"
            className="h-28 w-auto object-contain"
          />
        </div>

        <h2 className="text-3xl font-bold mb-2 text-gray-800 tracking-wide">Welcome Back</h2>
        <p className="text-gray-600 mb-8 text-lg">Please log in to your account</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 placeholder-gray-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 placeholder-gray-500 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center text-gray-700 select-none">
              <input
                type="checkbox"
                className="mr-2 rounded text-amber-600 border-gray-300 focus:ring-amber-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="text-amber-600 hover:underline font-medium">
              Forgot Password?
            </a>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 text-lg font-semibold ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-base text-gray-700">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-amber-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
