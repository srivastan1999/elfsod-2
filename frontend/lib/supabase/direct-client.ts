/**
 * Direct HTTP client for Supabase - bypasses fetch issues in serverless environments
 * Uses native Node.js https module for more reliable connections
 */

import https from 'https';
import http from 'http';

interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
    syscall?: string;
  } | null;
}

export async function directSupabaseQuery<T>(
  table: string,
  options: {
    select?: string;
    filter?: Record<string, any>;
    limit?: number;
    orderBy?: { column: string; ascending?: boolean };
  } = {}
): Promise<SupabaseResponse<T[]>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    console.error('❌ Missing environment variables:', missing);
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    
    return {
      data: null,
      error: {
        message: `Supabase environment variables not configured. Missing: ${missing.join(', ')}`,
        details: 'Please check Netlify environment variables are set for production context'
      }
    };
  }

  try {
    // Build query string
    const params = new URLSearchParams();
    if (options.select) {
      params.append('select', options.select);
    } else {
      params.append('select', '*');
    }
    
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    if (options.orderBy) {
      const order = options.orderBy.ascending !== false ? 'asc' : 'desc';
      params.append('order', `${options.orderBy.column}.${order}`);
    }

    // Add filters
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });
    }

    const url = new URL(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`);
    
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = JSON.parse(data);
              resolve({
                data: jsonData as T[],
                error: null
              });
            } catch (parseError) {
              resolve({
                data: null,
                error: {
                  message: 'Failed to parse response',
                  details: parseError instanceof Error ? parseError.message : String(parseError)
                }
              });
            }
          } else {
            resolve({
              data: null,
              error: {
                message: `HTTP ${res.statusCode}`,
                details: data
              }
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ HTTPS request error:', error);
        console.error('Request details:', {
          hostname: url.hostname,
          path: url.pathname + url.search,
          urlSet: !!supabaseUrl,
          keySet: !!supabaseKey
        });
        
        resolve({
          data: null,
          error: {
            message: 'Network error',
            details: error.message,
            code: (error as any).code,
            syscall: (error as any).syscall
          }
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          data: null,
          error: {
            message: 'Request timeout'
          }
        });
      });

      req.end();
    });
  } catch (error) {
    return {
      data: null,
      error: {
        message: 'Request failed',
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

