'use client';

import {
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

import { useUserStore } from '../../stores/userStore';
import { useItemStore } from '../../stores/useItemStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useShopStore } from '../../stores/useShopStore';

// --- MOCK DATA FOR CHART ---
const chartData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

// --- ICON MAPPER ---
const iconMap = {
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
};

const getIcon = (iconName) => {
  return iconMap[iconName] || CubeIcon;
};

// --- SKELETON COMPONENT ---
const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
    <div className="mt-2 h-8 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// --- UI COMPONENTS ---

function StatCard({ stat }) {
  const Icon = getIcon(stat.icon);
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</p>
        <div className={`p-2 rounded-lg ${colors[stat.color] || 'bg-gray-50 text-gray-600'}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const adminName = 'Jane Doe';
  const [isMounted, setIsMounted] = useState(false);

  const { users, fetchAllUsers, loading: loadingUsers } = useUserStore();
  const { items, fetchItems, loading: loadingItems } = useItemStore();
  const { categories, fetchCategories, loading: loadingCategories } = useCategoryStore();
  const { shops, fetchShops, loading: loadingShops } = useShopStore();

  useEffect(() => {
    setIsMounted(true);
    fetchAllUsers();
    fetchItems();
    fetchCategories();
    fetchShops();
  }, [fetchAllUsers, fetchItems, fetchCategories, fetchShops]);

  const loading = loadingUsers || loadingItems || loadingCategories || loadingShops;

  const stats = [
    { name: 'Total Users', value: users.length, icon: 'UsersIcon', color: 'green' },
    { name: 'Total Products', value: items.length, icon: 'CubeIcon', color: 'blue' },
    { name: 'Total Categories', value: categories.length, icon: 'ShoppingBagIcon', color: 'amber' },
    { name: 'Total Shops', value: shops.length, icon: 'ShoppingBagIcon', color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10 space-y-8">
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {adminName}!
          </h1>
          <p className="text-gray-500 font-medium">
            Here's what's happening with your platform today.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition">
          <PlusIcon className="h-5 w-5" />
          Add New Product
        </button>
      </header>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          stats.map((stat) => <StatCard key={stat.name} stat={stat} />)
        )}
      </div>

      {/* 3. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bar Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Sales Performance</h2>
            <select className="text-sm border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:ring-indigo-500">
              <option>Last 7 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-80 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/users" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </Link>
              <Link href="/admin/shops" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition">
                <span className="text-sm font-medium text-gray-700">View Shop Requests</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Top Selling</h2>
            <div className="space-y-4">
              {[
                { name: 'Pizza Margherita', sold: 300, price: '$12.00' },
                { name: 'Sushi Combo A', sold: 250, price: '$24.00' },
                { name: 'Gourmet Burger', sold: 180, price: '$15.00' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.sold} units sold</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}