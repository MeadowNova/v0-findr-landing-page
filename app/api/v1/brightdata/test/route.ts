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
 * POST /api/v1/brightdata/test
 * 
 * Test Bright Data MCP preset with a sample URL
 */
export const POST = withMiddleware(
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
