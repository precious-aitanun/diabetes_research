
import { createClient } from '@supabase/supabase-js';

// Custom fetch wrapper with timeout
const fetchWithTimeout = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutMs = 15000;
  
  const timeout = setTimeout(() => {
    console.warn(`Request timed out after ${timeoutMs}ms`);
    controller.abort();
  }, timeoutMs);

  return fetch(input, {
    ...init,
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeout);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeout);
      throw error;
    });
};

// These should be set in your environment
// Fix: Use type assertion on import.meta to allow access to Vite-specific 'env' property which may not be present in the default TypeScript ImportMeta interface
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://hxztmxdfdrhrigryovab.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_KTGYGLcvbd2g7EBfjflWhg_MEVCigfa';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL and Anon Key not found in process.env. Make sure they are provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.0',
    },
    fetch: fetchWithTimeout,
  },
});
