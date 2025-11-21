'use client';

import { useEffect, useState } from 'react';
import { getAdSpaces, getCategories } from '@/lib/supabase/services';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    adSpaces: { success: boolean; count: number; error?: string };
    categories: { success: boolean; count: number; error?: string };
  }>({
    loading: true,
    adSpaces: { success: false, count: 0 },
    categories: { success: false, count: 0 }
  });

  useEffect(() => {
    const testConnection = async () => {
      console.log('🧪 Testing Supabase connection...');
      
      // Test 1: Fetch ad spaces
      try {
        console.log('📦 Testing ad spaces...');
        const spaces = await getAdSpaces({ availabilityStatus: 'available' });
        console.log('✅ Ad spaces fetched:', spaces.length);
        setStatus(prev => ({
          ...prev,
          adSpaces: { success: true, count: spaces.length }
        }));
      } catch (error) {
        console.error('❌ Ad spaces error:', error);
        setStatus(prev => ({
          ...prev,
          adSpaces: {
            success: false,
            count: 0,
            error: error instanceof Error ? error.message : String(error)
          }
        }));
      }

      // Test 2: Fetch categories
      try {
        console.log('📂 Testing categories...');
        const cats = await getCategories();
        console.log('✅ Categories fetched:', cats.length);
        setStatus(prev => ({
          ...prev,
          categories: { success: true, count: cats.length }
        }));
      } catch (error) {
        console.error('❌ Categories error:', error);
        setStatus(prev => ({
          ...prev,
          categories: {
            success: false,
            count: 0,
            error: error instanceof Error ? error.message : String(error)
          }
        }));
      }

      setStatus(prev => ({ ...prev, loading: false }));
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            
            {status.loading ? (
              <div className="text-gray-600">Testing connection...</div>
            ) : (
              <div className="space-y-4">
                {/* Ad Spaces Test */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.adSpaces.success 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Ad Spaces</h3>
                      {status.adSpaces.success ? (
                        <p className="text-green-700">
                          ✅ Success! Found {status.adSpaces.count} ad spaces
                        </p>
                      ) : (
                        <p className="text-red-700">
                          ❌ Failed: {status.adSpaces.error || 'Unknown error'}
                        </p>
                      )}
                    </div>
                    <div className={`text-2xl ${status.adSpaces.success ? 'text-green-500' : 'text-red-500'}`}>
                      {status.adSpaces.success ? '✓' : '✗'}
                    </div>
                  </div>
                </div>

                {/* Categories Test */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.categories.success 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Categories</h3>
                      {status.categories.success ? (
                        <p className="text-green-700">
                          ✅ Success! Found {status.categories.count} categories
                        </p>
                      ) : (
                        <p className="text-red-700">
                          ❌ Failed: {status.categories.error || 'Unknown error'}
                        </p>
                      )}
                    </div>
                    <div className={`text-2xl ${status.categories.success ? 'text-green-500' : 'text-red-500'}`}>
                      {status.categories.success ? '✓' : '✗'}
                    </div>
                  </div>
                </div>

                {/* Overall Status */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.adSpaces.success && status.categories.success
                    ? 'border-green-500 bg-green-50' 
                    : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <h3 className="font-semibold mb-2">Overall Status</h3>
                  {status.adSpaces.success && status.categories.success ? (
                    <p className="text-green-700">
                      ✅ All tests passed! Your Supabase connection is working correctly.
                      <br />
                      <span className="text-sm text-gray-600 mt-2 block">
                        You can now go back to the home page and the cards should load.
                      </span>
                    </p>
                  ) : (
                    <p className="text-yellow-700">
                      ⚠️ Some tests failed. Check the error messages above and verify:
                      <ul className="list-disc list-inside mt-2 text-sm">
                        <li>Supabase URL and Anon Key are set in .env.local</li>
                        <li>RLS policies allow public read access</li>
                        <li>Data exists in Supabase tables</li>
                        <li>Check browser console for detailed errors</li>
                      </ul>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

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

