'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdSpacesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-full z-50">
        <AdminSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

