import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hpkjhaiwwrtqapucddsg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key for server-side operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// Create a Supabase client with the user's session for server components
// This function should only be used in App Router server components or API routes
export const createServerSupabaseClient = async (cookieHeader?: string) => {
  // For API routes or server components that don't use cookies() from next/headers
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
    global: {
      headers: cookieHeader ? {
        cookie: cookieHeader,
      } : undefined,
    },
  });
};

// For use in App Router server components only
export const createServerComponentClient = async () => {
  // Dynamic import to avoid issues with Pages Router
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });
};

// Export types
export type {
  User,
  Session,
  AuthResponse,
  AuthTokenResponse,
  AuthError
} from '@supabase/supabase-js';