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
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

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
