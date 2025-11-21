'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestDirectConnectionPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    test1: { success: boolean; message: string; error: string };
    test2: { success: boolean; message: string; error: string };
    test3: { success: boolean; message: string; error: string };
  }>({
    loading: true,
    test1: { success: false, message: 'Not tested', error: '' },
    test2: { success: false, message: 'Not tested', error: '' },
    test3: { success: false, message: 'Not tested', error: '' }
  });

  useEffect(() => {
    const runTests = async () => {
      console.log('🧪 Testing browser-side direct Supabase connection...');

      // Test 1: Create Supabase client
      let test1Result = { success: false, message: 'Failed to create client', error: '' };
      try {
        const supabase = createClient();
        test1Result = { success: true, message: '✅ Supabase client created successfully', error: '' };
        console.log('✅ Test 1: Client created');
      } catch (error) {
        test1Result = {
          success: false,
          message: '❌ Failed to create client',
          error: error instanceof Error ? error.message : String(error)
        };
        console.error('❌ Test 1 failed:', error);
      }
      setStatus(prev => ({ ...prev, test1: test1Result }));

      // Test 2: Try to fetch categories
      let test2Result = { success: false, message: 'Not tested', error: '' };
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(1);

        if (error) {
          test2Result = {
            success: false,
            message: `❌ Query failed: ${error.message}`,
            error: error.message
          };
          console.error('❌ Test 2 failed:', error);
        } else {
          test2Result = {
            success: true,
            message: `✅ Query successful! Found ${data?.length || 0} categories`,
            error: ''
          };
          console.log('✅ Test 2: Query successful', data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('cors') || 
                           errorMessage.includes('Access-Control') || errorMessage.includes('Failed to fetch');
        
        test2Result = {
          success: false,
          message: isCorsError 
            ? '❌ CORS Error - Supabase blocking browser requests'
            : `❌ Network/connection error: ${errorMessage}`,
          error: errorMessage
        };
        console.error('❌ Test 2 error:', error);
        if (isCorsError) {
          console.error('🚫 This is likely a CORS issue. Check:');
          console.error('  1. Supabase project is active (not paused)');
          console.error('  2. CORS settings in Supabase dashboard');
          console.error('  3. Network/firewall blocking requests');
        }
      }
      setStatus(prev => ({ ...prev, test2: test2Result }));

      // Test 3: Try raw fetch to Supabase REST API
      let test3Result = { success: false, message: 'Not tested', error: '' };
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          test3Result = {
            success: false,
            message: '❌ Environment variables not set',
            error: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing'
          };
        } else {
          console.log('🔍 Testing raw fetch to:', `${supabaseUrl}/rest/v1/categories`);
          console.log('🔑 Using key:', supabaseKey.substring(0, 20) + '...');
          
          const response = await fetch(`${supabaseUrl}/rest/v1/categories?select=*&limit=1`, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            // Add mode to help debug CORS
            mode: 'cors',
            credentials: 'omit'
          });

          if (response.ok) {
            const data = await response.json();
            test3Result = {
              success: true,
              message: `✅ Raw fetch successful! Found ${data?.length || 0} categories`,
              error: ''
            };
            console.log('✅ Test 3: Raw fetch successful', data);
          } else {
            const errorText = await response.text();
            test3Result = {
              success: false,
              message: `❌ HTTP ${response.status}: ${errorText.substring(0, 100)}`,
              error: errorText
            };
            console.error('❌ Test 3 failed:', response.status, errorText);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCorsError = errorMessage.includes('Failed to fetch') || 
                           errorMessage.includes('CORS') || 
                           errorMessage.includes('cors') ||
                           errorMessage.includes('Access-Control');
        
        test3Result = {
          success: false,
          message: isCorsError
            ? '❌ CORS Error - Browser blocked request to Supabase'
            : `❌ Fetch error: ${errorMessage}`,
          error: errorMessage
        };
        console.error('❌ Test 3 error:', error);
        if (isCorsError) {
          console.error('🚫 CORS Error Details:');
          console.error('  - Browser is blocking the request');
          console.error('  - Check Supabase dashboard → Settings → API');
          console.error('  - Verify project is active (not paused)');
          console.error('  - Check browser console Network tab for CORS headers');
        }
      }
      setStatus(prev => ({ ...prev, test3: test3Result, loading: false }));
    };

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Browser-Side Direct Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Connection Tests</h2>
            
            {status.loading ? (
              <div className="text-gray-600">Running tests...</div>
            ) : (
              <div className="space-y-4">
                {/* Test 1 */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.test1.success 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <h3 className="font-semibold mb-2">Test 1: Create Supabase Client</h3>
                  <p className={status.test1.success ? 'text-green-700' : 'text-red-700'}>
                    {status.test1.message}
                  </p>
                  {status.test1.error && (
                    <p className="text-xs text-red-600 mt-2">{status.test1.error}</p>
                  )}
                </div>

                {/* Test 2 */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.test2.success 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <h3 className="font-semibold mb-2">Test 2: Query Using Supabase Client</h3>
                  <p className={status.test2.success ? 'text-green-700' : 'text-red-700'}>
                    {status.test2.message}
                  </p>
                  {status.test2.error && (
                    <p className="text-xs text-red-600 mt-2">{status.test2.error}</p>
                  )}
                </div>

                {/* Test 3 */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.test3.success 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}>
                  <h3 className="font-semibold mb-2">Test 3: Raw Fetch to Supabase REST API</h3>
                  <p className={status.test3.success ? 'text-green-700' : 'text-red-700'}>
                    {status.test3.message}
                  </p>
                  {status.test3.error && (
                    <p className="text-xs text-red-600 mt-2">{status.test3.error}</p>
                  )}
                </div>

                {/* Overall Status */}
                <div className={`p-4 rounded-lg border-2 ${
                  status.test1.success && status.test2.success && status.test3.success
                    ? 'border-green-500 bg-green-50' 
                    : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <h3 className="font-semibold mb-2">Overall Status</h3>
                  {status.test1.success && status.test2.success && status.test3.success ? (
                    <p className="text-green-700">
                      ✅ All tests passed! Browser can connect to Supabase directly.
                      <br />
                      <span className="text-sm text-gray-600 mt-2 block">
                        The direct service should work. Check why the fallback isn't working.
                      </span>
                    </p>
                  ) : (
                    <div className="text-yellow-700">
                      <p>⚠️ Some tests failed. Possible issues:</p>
                      <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                        {!status.test1.success && <li>Cannot create Supabase client (check env vars)</li>}
                        {!status.test2.success && <li>Supabase client query failed (check RLS policies)</li>}
                        {!status.test3.success && <li>Raw fetch failed (check CORS or network)</li>}
                        <li>Check browser console (F12) for detailed errors</li>
                        <li>Verify Supabase project is active in dashboard</li>
                        <li>Check if CORS is blocking requests</li>
                      </ul>
                    </div>
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

