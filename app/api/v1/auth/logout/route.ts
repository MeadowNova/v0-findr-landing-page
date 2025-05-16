import { NextRequest } from 'next/server';
import { successResponse, withMiddleware } from '@/lib/api';
import { authService } from '@/lib/supabase/auth';

/**
 * POST /api/v1/auth/logout
 * 
 * Logout the current user
 */
export const POST = withMiddleware(
  async (req: NextRequest) => {
    // Logout with Supabase
    const { error } = await authService.logout();
    
    if (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we'll return success
      // as the client should still clear their local tokens
    }
    
    return successResponse({
      message: 'Successfully logged out',
    });
  },
  { requireAuth: true }
);
