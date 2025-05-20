import { brightDataService } from '@/lib/services/brightdata';
import { ApiException, ErrorCode } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => {
  const originalModule = jest.requireActual('@/lib/api');
  return {
    ...originalModule,
    ApiException: class ApiException extends Error {
      code: string;
      details?: any;
      constructor(code: string, message: string, details?: any) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ApiException';
      }
    },
    ErrorCode: {
      EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
      INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
      BAD_REQUEST: 'BAD_REQUEST',
      UNAUTHORIZED: 'UNAUTHORIZED',
      FORBIDDEN: 'FORBIDDEN',
      NOT_FOUND: 'NOT_FOUND',
      CONFLICT: 'CONFLICT',
      TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    }
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Bright Data Error Handling and Fallback Mechanisms', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('API Key Validation', () => {
    it('should throw an error when API key is not configured', async () => {
      // Temporarily override the API key
      const originalApiKey = process.env.BRIGHTDATA_API_KEY;
      process.env.BRIGHTDATA_API_KEY = '';
      
      // Test various methods that require the API key
      await expect(brightDataService.checkZoneConfiguration()).resolves.toEqual({
        success: false,
        error: expect.stringContaining('API key is not configured'),
      });
      
      await expect(brightDataService.testUrl('https://example.com')).resolves.toEqual({
        success: false,
        error: expect.stringContaining('API key is not configured'),
      });
      
      await expect(brightDataService.getAccountInfo()).resolves.toEqual({
        success: false,
        error: expect.stringContaining('API key is not configured'),
      });
      
      // Restore the API key
      process.env.BRIGHTDATA_API_KEY = originalApiKey;
    });
  });
  
  describe('HTTP Error Handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      // Mock 400 Bad Request response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
          error: 'Invalid request parameters',
          message: 'The request parameters are invalid',
        })),
      });
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Invalid request parameters'),
      });
    });
    
    it('should handle 401 Unauthorized errors', async () => {
      // Mock 401 Unauthorized response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
          error: 'Invalid API key',
          message: 'The API key provided is invalid',
        })),
      });
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Invalid API key'),
      });
    });
    
    it('should handle 403 Forbidden errors', async () => {
      // Mock 403 Forbidden response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
          error: 'Access denied',
          message: 'You do not have permission to access this resource',
        })),
      });
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Access denied'),
      });
    });
    
    it('should handle 404 Not Found errors', async () => {
      // Mock 404 Not Found response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
          error: 'Resource not found',
          message: 'The requested resource was not found',
        })),
      });
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Resource not found'),
      });
    });
    
    it('should handle 429 Too Many Requests errors', async () => {
      // Mock 429 Too Many Requests response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'You have exceeded the rate limit for this API',
        })),
      });
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Rate limit exceeded'),
      });
    });
    
    it('should handle 500 Internal Server Error', async () => {
      // Mock 500 Internal Server Error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
          error: 'Internal server error',
          message: 'An internal server error occurred',
        })),
      });
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Internal server error'),
      });
    });
    
    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Network error'),
      });
    });
    
    it('should handle timeout errors', async () => {
      // Mock timeout error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));
      
      // Test error handling
      const result = await brightDataService.testUrl('https://example.com');
      
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining('Timeout'),
      });
    });
  });
  
  describe('Fallback Mechanisms', () => {
    it('should fall back to mock data when API request fails', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API request failed'));
      
      // Mock the mockSearch method
      jest.spyOn(brightDataService, 'mockSearch').mockResolvedValueOnce([
        {
          listingId: 'mock-123',
          title: 'Mock Item',
          price: 100,
          currency: 'USD',
          location: 'Mock Location',
          listingUrl: 'https://example.com/mock',
        }
      ]);
      
      // Test fallback mechanism
      const results = await brightDataService.searchFacebookMarketplace({
        query: 'test',
        limit: 10,
      });
      
      // Verify mockSearch was called
      expect(brightDataService.mockSearch).toHaveBeenCalled();
      
      // Verify results are from mock data
      expect(results[0].listingId).toContain('mock-');
    });
    
    it('should fall back to mock data when API returns empty results', async () => {
      // Mock successful API response but with empty results
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          status_code: 200,
          body: '<div>No results found</div>',
        }),
      });
      
      // Mock empty search results
      jest.spyOn(brightDataService, 'parseMarketplaceSearchResults').mockReturnValueOnce([]);
      
      // Mock the mockSearch method
      jest.spyOn(brightDataService, 'mockSearch').mockResolvedValueOnce([
        {
          listingId: 'mock-123',
          title: 'Mock Item',
          price: 100,
          currency: 'USD',
          location: 'Mock Location',
          listingUrl: 'https://example.com/mock',
        }
      ]);
      
      // Test fallback mechanism
      const results = await brightDataService.searchFacebookMarketplace({
        query: 'test',
        limit: 10,
      });
      
      // Verify mockSearch was called
      expect(brightDataService.mockSearch).toHaveBeenCalled();
      
      // Verify results are from mock data
      expect(results[0].listingId).toContain('mock-');
    });
  });
});