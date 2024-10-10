"use client"; // Isso transforma o componente em um Client Component

import Dashboard from '@/components/dashboard/Dashboard';
import { ProtectedRoute }  from '@/lib/protectedRoute';

export default function Home() {

  return (
    <ProtectedRoute>
    <div className="p-4">
      <Dashboard />
    </div>
    </ProtectedRoute>
  );
}
