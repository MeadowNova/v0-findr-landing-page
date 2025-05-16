import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://hpkjhaiwwrtqapucddsg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa2poYWl3d3J0cWFwdWNkZHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTUyNjMsImV4cCI6MjA2MjkzMTI2M30.pWLxgF4nEEyUjT38X10N8WaRZri8-Etgc7LJqPefAS4';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types
export type { 
  User,
  Session,
  AuthResponse,
  AuthTokenResponse,
  AuthError
} from '@supabase/supabase-js';