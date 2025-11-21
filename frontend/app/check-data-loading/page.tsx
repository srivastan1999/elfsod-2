'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdSpaces, getCategories } from '@/lib/supabase/services';

export default function CheckDataLoadingPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    nextjs: { success: boolean; count: number; error?: string };
    direct: { success: boolean; count: number; error?: string };
    categories: { success: boolean; count: number; error?: string };
  }>({
    loading: true,
    nextjs: { success: false, count: 0 },
    direct: { success: false, count: 0 },
    categories: { success: false, count: 0 }
  });

  useEffect(() => {
    const checkData = async () => {
      console.log('🔍 Checking data loading from all sources...');

      // Test 1: Next.js API Route
      let nextjsResult = { success: false, count: 0, error: '' };
      try {
        const response = await fetch('/api/ad-spaces?limit=5');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            nextjsResult = { success: true, count: result.data.length, error: '' };
            console.log('✅ Next.js API:', result.data.length, 'ad spaces');
          } else {
            nextjsResult = { success: false, count: 0, error: 'Invalid response format' };
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          nextjsResult = { success: false, count: 0, error: errorData.error || `HTTP ${response.status}` };
        }
      } catch (error) {
        nextjsResult = {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : String(error)
        };
        console.error('❌ Next.js API failed:', error);
      }
      setStatus(prev => ({ ...prev, nextjs: nextjsResult }));

      // Test 2: Direct Supabase Service
      let directResult = { success: false, count: 0, error: '' };
      try {
        const spaces = await getAdSpaces();
        directResult = { success: true, count: Math.min(spaces.length, 5), error: '' };
        console.log('✅ Direct Service:', spaces.length, 'ad spaces');
      } catch (error) {
        directResult = {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : String(error)
        };
        console.error('❌ Direct Service failed:', error);
      }
      setStatus(prev => ({ ...prev, direct: directResult }));

      // Test 3: Categories
      let categoriesResult = { success: false, count: 0, error: '' };
      try {
        const categories = await getCategories();
        categoriesResult = { success: true, count: categories.length, error: '' };
        console.log('✅ Categories:', categories.length, 'categories');
      } catch (error) {
        categoriesResult = {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : String(error)
        };
        console.error('❌ Categories failed:', error);
      }
      setStatus(prev => ({ ...prev, categories: categoriesResult, loading: false }));
    };

    checkData();
  }, []);

  const allFailed = !status.nextjs.success && !status.direct.success;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Data Loading Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {status.loading ? (
            <div className="text-gray-600">Checking data sources...</div>
          ) : (
            <>
              {/* Next.js API */}
              <div className={`p-4 rounded-lg border-2 ${
                status.nextjs.success 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <h3 className="font-semibold mb-2">1. Next.js API Route (/api/ad-spaces)</h3>
                {status.nextjs.success ? (
                  <p className="text-green-700">
                    ✅ Success! Found {status.nextjs.count} ad spaces
                  </p>
                ) : (
                  <div>
                    <p className="text-red-700">❌ Failed</p>
                    <p className="text-xs text-red-600 mt-1">{status.nextjs.error}</p>
                  </div>
                )}
              </div>

              {/* Direct Service */}
              <div className={`p-4 rounded-lg border-2 ${
                status.direct.success 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <h3 className="font-semibold mb-2">2. Direct Supabase Service (Browser-side)</h3>
                {status.direct.success ? (
                  <p className="text-green-700">
                    ✅ Success! Found {status.direct.count} ad spaces
                  </p>
                ) : (
                  <div>
                    <p className="text-red-700">❌ Failed</p>
                    <p className="text-xs text-red-600 mt-1">{status.direct.error}</p>
                    {status.direct.error?.includes('Failed to fetch') && (
                      <p className="text-xs text-yellow-600 mt-2">
                        💡 This is likely a CORS issue. Check Supabase dashboard.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className={`p-4 rounded-lg border-2 ${
                status.categories.success 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <h3 className="font-semibold mb-2">3. Categories</h3>
                {status.categories.success ? (
                  <p className="text-green-700">
                    ✅ Success! Found {status.categories.count} categories
                  </p>
                ) : (
                  <div>
                    <p className="text-red-700">❌ Failed</p>
                    <p className="text-xs text-red-600 mt-1">{status.categories.error}</p>
                  </div>
                )}
              </div>

              {/* Overall Status */}
              <div className={`p-4 rounded-lg border-2 ${
                !allFailed
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}>
                <h3 className="font-semibold mb-2">Overall Status</h3>
                {!allFailed ? (
                  <div className="text-green-700">
                    <p>✅ At least one data source is working!</p>
                    <p className="text-sm mt-2">
                      {status.direct.success && '✅ Direct service works - cards should load'}
                      {status.nextjs.success && !status.direct.success && '✅ Next.js API works - cards should load'}
                    </p>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p>❌ All data sources failed!</p>
                    <div className="text-sm mt-2 space-y-1">
                      <p>• Next.js API: SSL certificate issue (Node.js)</p>
                      <p>• Direct Service: CORS or connection issue (Browser)</p>
                      <p className="mt-2 font-semibold">💡 Solutions:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Check Supabase project is active (not paused)</li>
                        <li>Configure CORS in Supabase dashboard</li>
                        <li>Verify environment variables are correct</li>
                        <li>Check browser console for detailed errors</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t">
            <a 
              href="/" 
              className="text-[#E91E63] hover:text-[#F50057] font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

