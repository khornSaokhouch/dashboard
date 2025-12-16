"use client";

import React from "react";

export default function ItemRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-4"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-4 py-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
        </div>
      </td>
    </tr>
  );
}
