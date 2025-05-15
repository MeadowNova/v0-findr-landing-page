import { NextRequest } from 'next/server';
import { successResponse, withMiddleware } from '@/lib/api';

/**
 * GET /api/v1/health
 * 
 * Health check endpoint to verify the API is running
 */
export const GET = withMiddleware(async (req: NextRequest) => {
  return successResponse({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});