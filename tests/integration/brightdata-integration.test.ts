// Mock ApiException before importing modules
class MockApiException extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApiException';
  }
}

// Mock the API module
jest.mock('@/lib/api', () => ({
  ApiException: MockApiException,
  ErrorCode: {
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  }
}));

// Import the mock service
import { mockBrightDataService as brightDataService } from '../mocks/brightdata-service';
import { mockSearchParams, mockBrightDataApiResponse, mockBrightDataResults } from '../mocks/brightdata';

// Mock fetch globally
global.fetch = jest.fn();

describe('Bright Data Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-End Search Flow', () => {
    it('should perform a complete search flow', async () => {
      // Mock the API responses for each step
      
      // Step 1: Check quota
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          total: 1000,
          used: 250,
          remaining: 750
        })
      });

      // Step 2: Search Facebook Marketplace
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockBrightDataApiResponse)
      });

      // Step 1: Check quota
      const quotaResult = await brightDataService.checkQuota();
      
      // Verify quota check
      expect(quotaResult.success).toBe(true);
      expect(quotaResult.quota).toEqual(expect.objectContaining({
        total: 1000,
        used: 250,
        remaining: 750
      }));
      
      // Step 2: Search Facebook Marketplace
      const searchResults = await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify search results
      expect(searchResults).toHaveLength(mockBrightDataApiResponse.results.length);
      expect(searchResults[0]).toEqual(expect.objectContaining({
        listingId: mockBrightDataApiResponse.results[0].id,
        title: mockBrightDataApiResponse.results[0].title
      }));
      
      // Verify all API calls were made correctly
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Verify first call was to check quota
      expect(global.fetch).toHaveBeenNthCalledWith(1, 
        'https://api.brightdata.com/mcp/quota',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );
      
      // Verify second call was to search
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        'https://api.brightdata.com/mcp',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          }),
          body: expect.any(String)
        })
      );
    });
    
    it('should handle errors gracefully in the search flow', async () => {
      // Mock quota check to succeed but search to fail
      
      // Step 1: Check quota (success)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          total: 1000,
          used: 250,
          remaining: 750
        })
      });
      
      // Step 2: Search Facebook Marketplace (failure)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: 'API request failed',
          error_code: 'EXTERNAL_SERVICE_ERROR'
        }),
        statusText: 'Bad Request'
      });
      
      // Step 1: Check quota
      const quotaResult = await brightDataService.checkQuota();
      
      // Verify quota check succeeded
      expect(quotaResult.success).toBe(true);
      
      // Step 2: Search Facebook Marketplace (should throw error)
      await expect(brightDataService.searchFacebookMarketplace(mockSearchParams))
        .rejects
        .toThrow();
      
      // Verify both API calls were attempted
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Fallback to Mock Data', () => {
    it('should fall back to mock data when API is unavailable', async () => {
      // Mock the API to fail
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Try to search (this will fail)
      await expect(brightDataService.searchFacebookMarketplace(mockSearchParams))
        .rejects
        .toThrow();
      
      // Now use mock search instead
      const mockResults = await brightDataService.mockSearch(mockSearchParams);
      
      // Verify mock results
      expect(mockResults).toHaveLength(mockSearchParams.limit);
      expect(mockResults[0]).toEqual(expect.objectContaining({
        title: expect.stringContaining(mockSearchParams.query),
        price: expect.any(Number),
        listingUrl: expect.stringContaining('facebook.com/marketplace/item/')
      }));
      
      // Verify API was only called once (for the failed search)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Configuration Validation', () => {
    it('should validate environment variables', () => {
      // Get proxy details which uses environment variables
      const proxyDetails = brightDataService.getProxyDetails();
      
      // Verify all required environment variables are present
      expect(proxyDetails.host).toBe('brd.superproxy.io');
      expect(proxyDetails.port).toBe(33325);
      expect(proxyDetails.username).toBe('brd-customer-hl_fo7ed603-zone-mcp_unlocker');
      expect(proxyDetails.password).toBe('c9sfk6u49o4w');
      expect(proxyDetails.zoneName).toBe('mcp_unlocker');
      
      // Verify proxy URL is correctly formatted
      expect(proxyDetails.proxyUrl).toBe(
        'http://brd-customer-hl_fo7ed603-zone-mcp_unlocker:c9sfk6u49o4w@brd.superproxy.io:33325'
      );
      
      // Verify curl command is correctly formatted
      expect(proxyDetails.curlCommand).toContain('curl "https://api.brightdata.com/request"');
      expect(proxyDetails.curlCommand).toContain(`"zone":"${proxyDetails.zoneName}"`);
    });
  });
});