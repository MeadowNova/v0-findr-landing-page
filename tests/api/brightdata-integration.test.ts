import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/brightdata/route';
import { GET as GET_quota } from '@/app/api/v1/brightdata/quota/route';
import { GET as GET_proxy } from '@/app/api/v1/brightdata/proxy/route';
import { POST as POST_test } from '@/app/api/v1/brightdata/test/route';
import { brightDataService } from '@/lib/services/brightdata';
import { ApiException, ErrorCode } from '@/lib/api';

// Mock the brightDataService
jest.mock('@/lib/services/brightdata', () => ({
  brightDataService: {
    getAccountInfo: jest.fn(),
    checkZoneConfiguration: jest.fn(),
    getProxyDetails: jest.fn(),
    checkQuota: jest.fn(),
    testUrl: jest.fn(),
    testMCPPreset: jest.fn(),
    createOrUpdateMCPPreset: jest.fn(),
    searchFacebookMarketplace: jest.fn(),
    mockSearch: jest.fn(),
    generateCacheKey: jest.fn(),
    applyRateLimiting: jest.fn(),
    fetchWithRetry: jest.fn(),
  },
  facebookMarketplacePresetConfig: {
    preset_name: 'fb-marketplace-scraper',
    target_urls: ['facebook.com/marketplace/*'],
    request_settings: {
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
      cookies_handling: {
        enabled: true,
        session_persistence: true,
      },
    },
  },
}));

// Mock the NextRequest
class MockNextRequest extends NextRequest {
  validatedBody?: any;
  validatedQuery?: any;
  
  constructor(url: string, options: any = {}) {
    super(new URL(url, 'https://example.com'), options);
    
    if (options.validatedBody) {
      this.validatedBody = options.validatedBody;
    }
    
    if (options.validatedQuery) {
      this.validatedQuery = options.validatedQuery;
    }
  }
}

// Mock the API context
const mockApiContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin',
  },
  auth: {
    userId: 'test-user-id',
    role: 'admin',
  },
};

describe('Bright Data API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/brightdata', () => {
    it('should return configuration and account information', async () => {
      // Mock the brightDataService methods
      (brightDataService.getAccountInfo as jest.Mock).mockResolvedValueOnce({
        success: true,
        accountInfo: {
          zone: 'mcp_unlocker',
          status: 'active',
          quota: {
            total: 1000,
            used: 250,
            remaining: 750,
          },
        },
      });
      
      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: true,
        zoneInfo: {
          zone: 'mcp_unlocker',
          status: 'active',
        },
      });
      
      (brightDataService.getProxyDetails as jest.Mock).mockReturnValueOnce({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'test-username',
        password: 'test-password',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
        curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer test-api-key" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\'',
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
          accountInfo: {
            zone: 'mcp_unlocker',
            status: 'active',
            quota: {
              total: 1000,
              used: 250,
              remaining: 750,
            },
          },
          accountError: null,
          zoneInfo: {
            zone: 'mcp_unlocker',
            status: 'active',
          },
          zoneError: null,
          proxyDetails: {
            host: 'brd.superproxy.io',
            port: 33325,
            username: 'test-username',
            password: 'test-password',
            zoneName: 'mcp_unlocker',
            proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
            curlCommand: expect.any(String),
          },
        },
      });
      
      // Verify the service methods were called
      expect(brightDataService.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(brightDataService.checkZoneConfiguration).toHaveBeenCalledTimes(1);
      expect(brightDataService.getProxyDetails).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.getAccountInfo as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to get account info',
      });
      
      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to check zone configuration',
      });
      
      (brightDataService.getProxyDetails as jest.Mock).mockReturnValueOnce({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'test-username',
        password: 'test-password',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
        curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer test-api-key" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\'',
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
          accountInfo: null,
          accountError: 'Failed to get account info',
          zoneInfo: null,
          zoneError: 'Failed to check zone configuration',
          proxyDetails: {
            host: 'brd.superproxy.io',
            port: 33325,
            username: 'test-username',
            password: 'test-password',
            zoneName: 'mcp_unlocker',
            proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
            curlCommand: expect.any(String),
          },
        },
      });
    });
    
    it('should handle unexpected errors', async () => {
      // Mock the brightDataService methods to throw errors
      (brightDataService.getAccountInfo as jest.Mock).mockRejectedValueOnce(
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
            message: 'Unexpected error',
          },
        },
      });
    });
  });
  
  describe('POST /api/v1/brightdata', () => {
    it('should check zone configuration', async () => {
      // Mock the brightDataService methods
      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: true,
        zoneInfo: {
          zone: 'mcp_unlocker',
          status: 'active',
        },
      });
      
      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata', {
        method: 'POST',
      });
      
      // Call the handler
      const response = await POST(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'Bright Data zone configuration checked successfully',
          zoneInfo: {
            zone: 'mcp_unlocker',
            status: 'active',
          },
        },
      });
      
      // Verify the service method was called
      expect(brightDataService.checkZoneConfiguration).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to check zone configuration',
      });
      
      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata', {
        method: 'POST',
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
          message: 'Failed to check Bright Data zone configuration',
          details: {
            message: 'Failed to check zone configuration',
          },
        },
      });
    });
  });
  
  describe('GET /api/v1/brightdata/quota', () => {
    it('should return quota information', async () => {
      // Mock the brightDataService methods
      (brightDataService.checkQuota as jest.Mock).mockResolvedValueOnce({
        success: true,
        quota: {
          total: 1000,
          used: 250,
          remaining: 750,
          reset_date: '2023-12-31T23:59:59Z',
        },
      });
      
      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/quota');
      
      // Call the handler
      const response = await GET_quota(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          quota: {
            total: 1000,
            used: 250,
            remaining: 750,
            reset_date: '2023-12-31T23:59:59Z',
          },
        },
      });
      
      // Verify the service method was called
      expect(brightDataService.checkQuota).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.checkQuota as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to check quota',
      });
      
      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/quota');
      
      // Call the handler
      const response = await GET_quota(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(502);
      expect(responseData).toEqual({
        success: false,
        error: {
          code: 'EXTERNAL_SERVICE_ERROR',
          message: 'Failed to check Bright Data MCP quota',
          details: {
            message: 'Failed to check quota',
          },
        },
      });
    });
  });
  
  describe('GET /api/v1/brightdata/proxy', () => {
    it('should return proxy configuration details', async () => {
      // Mock the brightDataService methods
      (brightDataService.getProxyDetails as jest.Mock).mockReturnValueOnce({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'test-username',
        password: 'test-password',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
        curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer test-api-key" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\'',
      });
      
      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/proxy');
      
      // Call the handler
      const response = await GET_proxy(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          proxyDetails: {
            host: 'brd.superproxy.io',
            port: 33325,
            username: 'test-username',
            password: 'test-password',
            zoneName: 'mcp_unlocker',
            proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
            curlCommand: expect.any(String),
          },
        },
      });
      
      // Verify the service method was called
      expect(brightDataService.getProxyDetails).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('POST /api/v1/brightdata/test', () => {
    it('should test a URL with Bright Data MCP preset', async () => {
      // Mock the brightDataService methods
      (brightDataService.testMCPPreset as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          status_code: 200,
          body: '<html><body>Test HTML</body></html>',
          extracted_data: {
            title: 'Test Item',
            price: '$150',
            location: 'New York, NY',
          },
        },
      });
      
      // Create a mock request with a valid URL
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        validatedBody: {
          url: 'https://facebook.com/marketplace/item/123456789',
        },
      });
      
      // Call the handler
      const response = await POST_test(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'Bright Data MCP preset tested successfully',
          data: {
            status_code: 200,
            body: '<html><body>Test HTML</body></html>',
            extracted_data: {
              title: 'Test Item',
              price: '$150',
              location: 'New York, NY',
            },
          },
        },
      });
      
      // Verify the service method was called
      expect(brightDataService.testMCPPreset).toHaveBeenCalledTimes(1);
      expect(brightDataService.testMCPPreset).toHaveBeenCalledWith('https://facebook.com/marketplace/item/123456789');
    });
    
    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.testMCPPreset as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to test preset',
      });
      
      // Create a mock request with a valid URL
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        validatedBody: {
          url: 'https://facebook.com/marketplace/item/123456789',
        },
      });
      
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
            message: 'Failed to test preset',
          },
        },
      });
    });
    
    it('should validate the URL format', async () => {
      // Create a mock request with an invalid URL
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'invalid-url',
        }),
      });
      
      // Mock the validation error
      const validationError = new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid request body',
            details: {
              issues: [
                {
                  code: 'invalid_string',
                  message: 'Invalid URL format',
                  path: ['url'],
                },
              ],
            },
          },
        }),
        { status: 400 }
      );
      
      // Mock the withBodyValidation function
      jest.mock('@/lib/api', () => ({
        ...jest.requireActual('@/lib/api'),
        withBodyValidation: jest.fn().mockReturnValue(() => validationError),
      }));
      
      // Call the handler
      const response = await POST_test(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        success: false,
        error: expect.objectContaining({
          code: 'BAD_REQUEST',
        }),
      });
    });
  });
  
  describe('Integration with Facebook Marketplace Scraping', () => {
    it('should search Facebook Marketplace and return results', async () => {
      // Mock the brightDataService methods
      (brightDataService.searchFacebookMarketplace as jest.Mock).mockResolvedValueOnce([
        {
          listingId: '123456789',
          title: 'Vintage Mid-Century Chair',
          price: 150,
          currency: 'USD',
          location: 'Brooklyn, NY',
          listingUrl: 'https://www.facebook.com/marketplace/item/123456789/',
          imageUrl: 'https://example.com/image1.jpg',
        },
        {
          listingId: '987654321',
          title: 'Modern Sofa',
          price: 300,
          currency: 'USD',
          location: 'Manhattan, NY',
          listingUrl: 'https://www.facebook.com/marketplace/item/987654321/',
          imageUrl: 'https://example.com/image2.jpg',
        },
      ]);
      
      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        validatedBody: {
          query: 'vintage chair',
          location: 'New York, NY',
          minPrice: 50,
          maxPrice: 200,
          limit: 10,
        },
      });
      
      // Mock the search service
      const mockSearchService = {
        createSearch: jest.fn().mockResolvedValue({
          searchId: 'test-search-id',
          jobId: 'test-job-id',
        }),
      };
      
      // Mock the search processor service
      const mockSearchProcessorService = {
        processJob: jest.fn().mockResolvedValue(undefined),
      };
      
      // Mock the services
      jest.mock('@/lib/services/search', () => ({
        searchService: mockSearchService,
      }));
      
      jest.mock('@/lib/services/search-processor', () => ({
        searchProcessorService: mockSearchProcessorService,
      }));
      
      // Import the route handler
      const { POST: POST_search } = require('@/app/api/v1/searches/route');
      
      // Call the handler
      const response = await POST_search(req, mockApiContext as any);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual({
        success: true,
        data: {
          searchId: 'test-search-id',
          jobId: 'test-job-id',
          message: 'Search created successfully',
        },
      });
    });
  });
});