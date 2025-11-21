import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard - Elfsod",
  description: "Manage advertising inventory and ad spaces",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-full">
        <Sidebar />
      </div>
      
      {/* Main content - Admin doesn't need TopBar with location/date selector */}
      <div className="flex-1 lg:ml-20">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

