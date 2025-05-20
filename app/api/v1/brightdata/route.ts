import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withBodyValidation, 
  withMiddleware,
  z
} from '@/lib/api';
import { brightDataService } from '@/lib/services/brightdata';

// Test preset request schema
const testPresetSchema = z.object({
  url: z.string().url('Invalid URL format').refine(
    (url) => url.includes('facebook.com/marketplace'),
    { message: 'URL must be a Facebook Marketplace URL' }
  ),
});

// Test preset request type
type TestPresetRequest = z.infer<typeof testPresetSchema>;

/**
 * GET /api/v1/brightdata
 * 
 * Get Bright Data configuration and account information
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // Get account information
      const accountResult = await brightDataService.getAccountInfo();
      
      // Check zone configuration
      const zoneResult = await brightDataService.checkZoneConfiguration();
      
      // Return configuration and account information
      return successResponse({
        accountInfo: accountResult.success ? accountResult.accountInfo : null,
        accountError: accountResult.success ? null : accountResult.error,
        zoneInfo: zoneResult.success ? zoneResult.zoneInfo : null,
        zoneError: zoneResult.success ? null : zoneResult.error,
        proxyDetails: brightDataService.getProxyDetails()
      });
    } catch (error) {
      console.error('Error getting Bright Data configuration:', error);
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to get Bright Data configuration',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);

/**
 * POST /api/v1/brightdata
 * 
 * Check Bright Data zone configuration
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // Check zone configuration
      const result = await brightDataService.checkZoneConfiguration();
      
      if (!result.success) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to check Bright Data zone configuration',
          { message: result.error }
        );
      }
      
      // Return success response
      return successResponse({
        message: 'Bright Data zone configuration checked successfully',
        zoneInfo: result.zoneInfo,
      });
    } catch (error) {
      console.error('Error checking Bright Data zone configuration:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to check Bright Data zone configuration',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);

/**
 * POST /api/v1/brightdata/test
 * 
 * Test Bright Data API with a sample URL
 */
export const POST_test = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(testPresetSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { url } = (req as any).validatedBody as TestPresetRequest;
    
    try {
      // Test URL
      const result = await brightDataService.testUrl(url);
      
      if (!result.success) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to test URL with Bright Data API',
          { message: result.error }
        );
      }
      
      // Return test results
      return successResponse({
        message: 'URL tested successfully with Bright Data API',
        data: result.data,
      });
    } catch (error) {
      console.error('Error testing URL with Bright Data API:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to test URL with Bright Data API',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);
