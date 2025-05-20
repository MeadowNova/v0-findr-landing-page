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
import {
  mockSearchParams,
  mockBrightDataApiResponse,
  mockBrightDataResults,
  mockCreatePresetResponse,
  mockTestPresetResponse,
  mockQuotaResponse,
  mockErrorResponse
} from '../mocks/brightdata';

// Mock fetch globally
global.fetch = jest.fn();

describe('Bright Data Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('searchFacebookMarketplace', () => {
    it('should search Facebook Marketplace and return results', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockBrightDataApiResponse)
      });

      const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.brightdata.com/mcp',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab'
          }),
          body: expect.any(String)
        })
      );

      // Verify the request body contains the search parameters
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody).toEqual(expect.objectContaining({
        preset: 'fb-marketplace-scraper',
        query: mockSearchParams.query,
        location: mockSearchParams.location,
        radius: mockSearchParams.radius,
        min_price: mockSearchParams.minPrice,
        max_price: mockSearchParams.maxPrice,
        category: mockSearchParams.category,
        limit: mockSearchParams.limit
      }));

      // Verify results are mapped correctly
      expect(results).toHaveLength(mockBrightDataApiResponse.results.length);
      expect(results[0]).toEqual(expect.objectContaining({
        listingId: mockBrightDataApiResponse.results[0].id,
        title: mockBrightDataApiResponse.results[0].title,
        price: 150, // Parsed from '$150'
        currency: 'USD',
        location: mockBrightDataApiResponse.results[0].location
      }));
    });

    it('should throw an error when API key is not configured', async () => {
      // Temporarily override the API key
      const originalApiKey = process.env.BRIGHTDATA_API_KEY;
      process.env.BRIGHTDATA_API_KEY = '';

      await expect(brightDataService.searchFacebookMarketplace(mockSearchParams))
        .rejects
        .toThrow(new ApiException(
          'EXTERNAL_SERVICE_ERROR',
          'Bright Data API key is not configured'
        ));

      // Restore the API key
      process.env.BRIGHTDATA_API_KEY = originalApiKey;
    });

    it('should throw an error when API request fails', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
        statusText: 'Bad Request'
      });

      await expect(brightDataService.searchFacebookMarketplace(mockSearchParams))
        .rejects
        .toThrow(new ApiException(
          'EXTERNAL_SERVICE_ERROR',
          'Bright Data MCP API request failed',
          { message: mockErrorResponse.message }
        ));
    });

    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(brightDataService.searchFacebookMarketplace(mockSearchParams))
        .rejects
        .toThrow(new ApiException(
          'EXTERNAL_SERVICE_ERROR',
          'Failed to search Facebook Marketplace',
          { message: 'Network error' }
        ));
    });
  });

  describe('mockSearch', () => {
    it('should return mock search results', async () => {
      const results = await brightDataService.mockSearch(mockSearchParams);

      // Verify results structure
      expect(results).toHaveLength(mockSearchParams.limit);
      expect(results[0]).toEqual(expect.objectContaining({
        listingId: expect.any(String),
        title: expect.stringContaining(mockSearchParams.query),
        price: expect.any(Number),
        currency: 'USD',
        location: mockSearchParams.location,
        distance: expect.any(Number),
        listingUrl: expect.stringContaining('facebook.com/marketplace/item/'),
        imageUrl: expect.stringContaining('https://picsum.photos/seed/'),
        description: expect.stringContaining(mockSearchParams.query),
        sellerInfo: expect.objectContaining({
          name: expect.any(String),
          rating: expect.any(String),
          joinedDate: expect.any(String),
          profileUrl: expect.any(String)
        }),
        postedAt: expect.any(String)
      }));
    });

    it('should respect the limit parameter', async () => {
      const customLimit = 5;
      const results = await brightDataService.mockSearch({
        ...mockSearchParams,
        limit: customLimit
      });

      expect(results).toHaveLength(customLimit);
    });

    it('should respect the price range parameters', async () => {
      const minPrice = 100;
      const maxPrice = 200;
      const results = await brightDataService.mockSearch({
        ...mockSearchParams,
        minPrice,
        maxPrice
      });

      // All prices should be within the specified range
      results.forEach(result => {
        expect(result.price).toBeGreaterThanOrEqual(minPrice);
        expect(result.price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });

  describe('createOrUpdateMCPPreset', () => {
    it('should create or update the MCP preset', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockCreatePresetResponse)
      });

      const result = await brightDataService.createOrUpdateMCPPreset();

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.brightdata.com/mcp/presets',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab'
          }),
          body: expect.any(String)
        })
      );

      // Verify result
      expect(result).toEqual({
        success: true,
        presetId: mockCreatePresetResponse.preset_id
      });
    });

    it('should handle API errors', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
        statusText: 'Bad Request'
      });

      const result = await brightDataService.createOrUpdateMCPPreset();

      // Verify result contains error
      expect(result).toEqual({
        success: false,
        error: expect.any(String)
      });
    });
  });

  describe('testMCPPreset', () => {
    it('should test the MCP preset with a sample URL', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTestPresetResponse)
      });

      const testUrl = 'https://facebook.com/marketplace/item/123456789';
      const result = await brightDataService.testMCPPreset(testUrl);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.brightdata.com/mcp/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab'
          }),
          body: expect.any(String)
        })
      );

      // Verify request body
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody).toEqual({
        preset: 'fb-marketplace-scraper',
        url: testUrl
      });

      // Verify result
      expect(result).toEqual({
        success: true,
        data: mockTestPresetResponse
      });
    });

    it('should handle API errors', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
        statusText: 'Bad Request'
      });

      const testUrl = 'https://facebook.com/marketplace/item/123456789';
      const result = await brightDataService.testMCPPreset(testUrl);

      // Verify result contains error
      expect(result).toEqual({
        success: false,
        error: expect.any(String)
      });
    });
  });

  describe('checkQuota', () => {
    it('should check the quota information', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockQuotaResponse)
      });

      const result = await brightDataService.checkQuota();

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.brightdata.com/mcp/quota',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab'
          })
        })
      );

      // Verify result
      expect(result).toEqual({
        success: true,
        quota: mockQuotaResponse
      });
    });

    it('should handle API errors', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse),
        statusText: 'Bad Request'
      });

      const result = await brightDataService.checkQuota();

      // Verify result contains error
      expect(result).toEqual({
        success: false,
        error: expect.any(String)
      });
    });
  });

  describe('getProxyDetails', () => {
    it('should return proxy connection details', () => {
      const proxyDetails = brightDataService.getProxyDetails();

      // Verify proxy details
      expect(proxyDetails).toEqual({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'brd-customer-hl_fo7ed603-zone-mcp_unlocker',
        password: 'c9sfk6u49o4w',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://brd-customer-hl_fo7ed603-zone-mcp_unlocker:c9sfk6u49o4w@brd.superproxy.io:33325',
        curlCommand: expect.stringContaining('curl "https://api.brightdata.com/request"')
      });
    });
  });
});