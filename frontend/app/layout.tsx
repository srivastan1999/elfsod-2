import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Elfsod - Advertising Inventory Aggregator",
  description: "Discover, plan, and book advertising spaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-gray-50">
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
