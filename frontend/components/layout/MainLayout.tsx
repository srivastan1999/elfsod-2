'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

/**
 * Main layout wrapper that conditionally shows sidebar/topbar
 * Admin portal routes have their own layout, so this is only for regular routes
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Admin portal has its own layout
  if (pathname?.startsWith('/admin-portal')) {
    return <>{children}</>;
  }

  // Regular routes get sidebar and topbar
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-full">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:ml-20">
        <TopBar />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

