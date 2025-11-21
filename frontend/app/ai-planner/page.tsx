'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AIPlannerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to goal page
    router.push('/ai-planner/goal');
  }, [router]);

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#E91E63] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to AI Planner...</p>
      </div>
    </div>
  );
}
