// Mock NextRequest before importing modules
class MockNextRequest {
  url: string;
  method: string;
  headers: Headers;
  validatedBody?: any;

  constructor(url: string, options: any = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Headers(options.headers || {});
    if (options.body) {
      this.validatedBody = JSON.parse(options.body);
    }
  }
}

// Mock next/server module
jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    json: (data: any, init?: ResponseInit) => new Response(JSON.stringify(data), init),
  },
}));
import { GET, POST, POST_test } from '@/app/api/v1/brightdata/route';
import { mockBrightDataService, mockFacebookMarketplacePresetConfig } from '../mocks/brightdata-service';
import {
  mockCreatePresetResponse,
  mockTestPresetResponse,
  mockQuotaResponse,
  mockErrorResponse
} from '../mocks/brightdata';

// Mock the brightDataService
jest.mock('@/lib/services/brightdata', () => ({
  brightDataService: mockBrightDataService,
  facebookMarketplacePresetConfig: mockFacebookMarketplacePresetConfig
}));

// Mock the API context
const mockApiContext = {
  auth: {
    userId: 'user-123',
    role: 'admin'
  }
};

describe('Bright Data API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/brightdata', () => {
    it('should return configuration and quota information', async () => {
      // Mock the checkQuota method
      (brightDataService.checkQuota as jest.Mock).mockResolvedValueOnce({
        success: true,
        quota: mockQuotaResponse
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata');

      // Call the handler
      const response = await GET(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          config: expect.objectContaining({
            preset_name: 'fb-marketplace-scraper'
          }),
          quota: mockQuotaResponse,
          quotaError: null
        }
      });

      // Verify the service was called
      expect(brightDataService.checkQuota).toHaveBeenCalledTimes(1);
    });

    it('should handle quota check errors gracefully', async () => {
      // Mock the checkQuota method to return an error
      (brightDataService.checkQuota as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to check quota'
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata');

      // Call the handler
      const response = await GET(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          config: expect.any(Object),
          quota: null,
          quotaError: 'Failed to check quota'
        }
      });
    });

    it('should handle unexpected errors', async () => {
      // Mock the checkQuota method to throw an error
      (brightDataService.checkQuota as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata');

      // Call the handler
      const response = await GET(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get Bright Data configuration',
          details: {
            message: 'Unexpected error'
          }
        }
      });
    });
  });

  describe('POST /api/v1/brightdata', () => {
    it('should create or update the MCP preset', async () => {
      // Mock the createOrUpdateMCPPreset method
      (brightDataService.createOrUpdateMCPPreset as jest.Mock).mockResolvedValueOnce({
        success: true,
        presetId: mockCreatePresetResponse.preset_id
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata', {
        method: 'POST'
      });

      // Call the handler
      const response = await POST(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'Bright Data MCP preset created/updated successfully',
          presetId: mockCreatePresetResponse.preset_id
        }
      });

      // Verify the service was called
      expect(brightDataService.createOrUpdateMCPPreset).toHaveBeenCalledTimes(1);
    });

    it('should handle preset creation errors', async () => {
      // Mock the createOrUpdateMCPPreset method to return an error
      (brightDataService.createOrUpdateMCPPreset as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to create preset'
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata', {
        method: 'POST'
      });

      // Call the handler
      const response = await POST(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(502);
      expect(responseData).toEqual({
        success: false,
        error: {
          code: 'EXTERNAL_SERVICE_ERROR',
          message: 'Failed to create/update Bright Data MCP preset',
          details: {
            message: 'Failed to create preset'
          }
        }
      });
    });
  });

  describe('POST /api/v1/brightdata/test', () => {
    it('should test the MCP preset with a valid URL', async () => {
      // Mock the testMCPPreset method
      (brightDataService.testMCPPreset as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockTestPresetResponse
      });

      // Create a mock request with a valid URL
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://facebook.com/marketplace/item/123456789'
        })
      });

      // Add validatedBody to the request (normally done by middleware)
      (req as any).validatedBody = {
        url: 'https://facebook.com/marketplace/item/123456789'
      };

      // Call the handler
      const response = await POST_test(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'Bright Data MCP preset tested successfully',
          data: mockTestPresetResponse
        }
      });

      // Verify the service was called with the correct URL
      expect(brightDataService.testMCPPreset).toHaveBeenCalledTimes(1);
      expect(brightDataService.testMCPPreset).toHaveBeenCalledWith(
        'https://facebook.com/marketplace/item/123456789'
      );
    });

    it('should handle test preset errors', async () => {
      // Mock the testMCPPreset method to return an error
      (brightDataService.testMCPPreset as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to test preset'
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://facebook.com/marketplace/item/123456789'
        })
      });

      // Add validatedBody to the request (normally done by middleware)
      (req as any).validatedBody = {
        url: 'https://facebook.com/marketplace/item/123456789'
      };

      // Call the handler
      const response = await POST_test(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(502);
      expect(responseData).toEqual({
        success: false,
        error: {
          code: 'EXTERNAL_SERVICE_ERROR',
          message: 'Failed to test Bright Data MCP preset',
          details: {
            message: 'Failed to test preset'
          }
        }
      });
    });
  });
});