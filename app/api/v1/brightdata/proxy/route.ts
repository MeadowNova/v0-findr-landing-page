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
 * GET /api/v1/brightdata/proxy
 * 
 * Get Bright Data proxy configuration details
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // Get proxy details
      const proxyDetails = brightDataService.getProxyDetails();
      
      // Return proxy details
      return successResponse({
        proxyDetails,
      });
    } catch (error) {
      console.error('Error getting Bright Data proxy details:', error);
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to get Bright Data proxy details',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);
