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
import { brightDataService, facebookMarketplacePresetConfig } from '@/lib/services/brightdata';

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
 * Get Bright Data MCP configuration
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // Check quota
      const quotaResult = await brightDataService.checkQuota();
      
      // Return configuration and quota information
      return successResponse({
        config: facebookMarketplacePresetConfig,
        quota: quotaResult.success ? quotaResult.quota : null,
        quotaError: quotaResult.success ? null : quotaResult.error,
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
 * Create or update Bright Data MCP preset
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      // Create or update preset
      const result = await brightDataService.createOrUpdateMCPPreset();
      
      if (!result.success) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to create/update Bright Data MCP preset',
          { message: result.error }
        );
      }
      
      // Return success response
      return successResponse({
        message: 'Bright Data MCP preset created/updated successfully',
        presetId: result.presetId,
      });
    } catch (error) {
      console.error('Error creating/updating Bright Data MCP preset:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to create/update Bright Data MCP preset',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);

/**
 * POST /api/v1/brightdata/test
 * 
 * Test Bright Data MCP preset with a sample URL
 */
export const POST_test = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(testPresetSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { url } = (req as any).validatedBody as TestPresetRequest;
    
    try {
      // Test preset
      const result = await brightDataService.testMCPPreset(url);
      
      if (!result.success) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to test Bright Data MCP preset',
          { message: result.error }
        );
      }
      
      // Return test results
      return successResponse({
        message: 'Bright Data MCP preset tested successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Error testing Bright Data MCP preset:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to test Bright Data MCP preset',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true, requiredRole: 'admin' }
);
