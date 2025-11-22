'use client';

import {
  ArrowUpIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ClockIcon,
  Cog6ToothIcon,   // ✅ Add this line
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- DUMMY DATA ---
const stats = [
  {
    name: "Total Revenue",
    value: "$45,231",
    icon: CurrencyDollarIcon,
    change: "+12.5%",
    changeType: "increase",
    color: "blue",
  },
  {
    name: "New Orders",
    value: "1,250",
    icon: ShoppingBagIcon,
    change: "+8.1%",
    changeType: "increase",
    color: "green",
  },
  {
    name: "New Users",
    value: "75",
    icon: UsersIcon,
    change: "-1.9%",
    changeType: "decrease",
    color: "red",
  },
  {
    name: "Active Shops",
    value: "54",
    icon: CubeIcon,
    change: "+5.0%",
    changeType: "increase",
    color: "amber",
  },
];

const recentOrders = [
  { id: 1001, customer: "Alice Johnson", amount: 45.99, status: "Delivered", date: "2m ago" },
  { id: 1002, customer: "Bob Smith", amount: 23.50, status: "Pending", date: "1h ago" },
  { id: 1003, customer: "Charlie Brown", amount: 120.00, status: "Processing", date: "4h ago" },
  { id: 1004, customer: "Dana Scully", amount: 7.85, status: "Cancelled", date: "1d ago" },
  { id: 1005, customer: "Fox Mulder", amount: 55.40, status: "Delivered", date: "2d ago" },
];

// --- UTILITY COMPONENTS ---

// Component to render status badges
const StatusBadge = ({ status }) => {
  let colorClasses;
  switch (status) {
    case "Delivered":
      colorClasses = "bg-green-100 text-green-800";
      break;
    case "Pending":
      colorClasses = "bg-yellow-100 text-yellow-800";
      break;
    case "Processing":
      colorClasses = "bg-blue-100 text-blue-800";
      break;
    case "Cancelled":
      colorClasses = "bg-red-100 text-red-800";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-800";
  }
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      {status}
    </span>
  );
};


// Component for KPI Cards
function StatCard({ stat }) {
  const Icon = stat.icon;
  
  // Dynamic color selection for the icon background
  let iconBgClass;
  let iconTextClass;
  switch (stat.color) {
    case 'blue':
      iconBgClass = 'bg-blue-100';
      iconTextClass = 'text-blue-600';
      break;
    case 'green':
      iconBgClass = 'bg-green-100';
      iconTextClass = 'text-green-600';
      break;
    case 'red':
      iconBgClass = 'bg-red-100';
      iconTextClass = 'text-red-600';
      break;
    case 'amber':
      iconBgClass = 'bg-amber-100';
      iconTextClass = 'text-amber-600';
      break;
    default:
      iconBgClass = 'bg-gray-100';
      iconTextClass = 'text-gray-600';
  }

  // Trend indicator styling
  const trendClasses = stat.changeType === "increase"
    ? "text-green-500 bg-green-50"
    : "text-red-500 bg-red-50";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transition duration-300 hover:shadow-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
        <div className={`p-2 rounded-full ${iconBgClass}`}>
          <Icon className={`h-5 w-5 ${iconTextClass}`} />
        </div>
      </div>
      <div className="mt-1 flex justify-between items-end">
        <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
        <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trendClasses}`}>
          <ArrowUpIcon className={`h-3 w-3 inline mr-1 ${stat.changeType === "decrease" ? "transform rotate-180" : ""}`} />
          {stat.change}
        </div>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD COMPONENT ---

export default function AdminDashboardPage() {
  const adminName = "Jane Doe"; // Replace with actual user name if needed

  return (
    <div className="space-y-8">
      {/* 1. Dashboard Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {adminName}!</h1>
        <p className="text-gray-500 mt-1">
          Here is a summary of your operations for the last 30 days.
        </p>
      </header>

      {/* 2. KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* 3. Main Content Area (Layout split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Activity & Performance */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Orders Table */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-500 mr-2" /> Recent Activity
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/50 transition duration-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
                <Link href="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all orders &rarr;
                </Link>
            </div>
          </div>
          
          {/* Placeholder for Performance Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-80 flex items-center justify-center">
             <span className="text-gray-400">Placeholder for Revenue Chart (e.g., using Recharts/Nivo)</span>
          </div>

        </div>

        {/* Right Column (1/3 width) - Quick Links & Summary */}
        <div className="lg:col-span-1 space-y-6">

          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/shops/new" className="text-center p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow-md">
                <ShoppingBagIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Add Shop</span>
              </Link>
              <Link href="/admin/users/new" className="text-center p-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
                <UsersIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Add User</span>
              </Link>
              <Link href="/admin/categories" className="text-center p-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
                <CubeIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Categories</span>
              </Link>
              <Link href="/admin/settings" className="text-center p-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150">
                <Cog6ToothIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </div>

          {/* Top Selling Items Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Selling Items</h2>
            <ul className="space-y-3">
                <li className="flex justify-between text-sm text-gray-700 border-b border-gray-50 pb-1"><span>1. Pizza Margherita</span><span className="font-semibold">300 sold</span></li>
                <li className="flex justify-between text-sm text-gray-700 border-b border-gray-50 pb-1"><span>2. Sushi Combo A</span><span className="font-semibold">250 sold</span></li>
                <li className="flex justify-between text-sm text-gray-700 border-b border-gray-50 pb-1"><span>3. Gourmet Burger</span><span className="font-semibold">180 sold</span></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}