import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      // Get the user's session from cookies
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        // Get the user's session from cookies
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