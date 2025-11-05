"use client"
import CategoriesTable from '@/app/components/CategoriesTable';
import { useAuthStore } from '@/app/stores/authStore';

export default function CategoriesPage() {  
  const { role } = useAuthStore(); // 'admin' or 'owner'

  // Ensure fallback in case role is undefined
  const userRole = role || 'admin';

  return (
    <div className="p-8">
      <CategoriesTable userRole={userRole} />
    </div>
  );
}
