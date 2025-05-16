import { NextRequest } from 'next/server';
import { ApiContext, successResponse, withMiddleware } from '@/lib/api';
import { authService } from '@/lib/supabase/auth';

/**
 * GET /api/v1/auth/me
 *
 * Get the current authenticated user's information
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // This endpoint requires authentication
    return successResponse({
      user: context.user,
    });
  },
  { requireAuth: true }
);