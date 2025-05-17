import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withMiddleware
} from '@/lib/api';
import { brightDataService } from '@/lib/services/brightdata';

/**
 * GET /api/v1/brightdata/quota
 * 
 * Check Bright Data MCP quota
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // Check quota
      const result = await brightDataService.checkQuota();
      
      if (!result.success) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to check Bright Data MCP quota',
          { message: result.error }
        );
      }
      
      // Return quota information
      return successResponse({
        quota: result.quota,
      });
    } catch (error) {
      console.error('Error checking Bright Data MCP quota:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to check Bright Data MCP quota',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);
