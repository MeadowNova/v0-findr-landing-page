import fs from 'fs';
import path from 'path';
import { brightDataService } from '@/lib/services/brightdata';
import { parseMarketplaceSearchResults, parseMarketplaceListingDetails } from '@/lib/utils/html-parser';
import { Cache } from '@/lib/utils/cache';

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
    }
  };
});

// Mock the cache module
jest.mock('@/lib/utils/cache', () => {
  return {
    Cache: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      has: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      size: jest.fn(),
      getOrSet: jest.fn(),
    }))
  };
});

// Mock the rate limiter module
jest.mock('@/lib/utils/rate-limiter', () => {
  return {
    TokenBucketRateLimiter: jest.fn().mockImplementation(() => ({
      consume: jest.fn().mockReturnValue(true),
      consumeAsync: jest.fn().mockResolvedValue(undefined),
      canConsume: jest.fn().mockReturnValue(true),
      getTokens: jest.fn().mockReturnValue(10),
    })),
    SlidingWindowRateLimiter: jest.fn().mockImplementation(() => ({
      recordRequest: jest.fn().mockReturnValue(true),
      recordRequestAsync: jest.fn().mockResolvedValue(undefined),
      canMakeRequest: jest.fn().mockReturnValue(true),
      getRequestCount: jest.fn().mockReturnValue(0),
      getTimeUntilNextRequest: jest.fn().mockReturnValue(0),
    }))
  };
});

// Mock the HTML parser module
jest.mock('@/lib/utils/html-parser', () => {
  return {
    parseMarketplaceSearchResults: jest.fn(),
    parseMarketplaceListingDetails: jest.fn(),
    extractListingIdFromUrl: jest.fn(),
    extractPriceAndCurrency: jest.fn(),
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Facebook Marketplace Scraper Integration', () => {
  // Load test fixtures
  const searchHtml = fs.readFileSync(
    path.join(process.cwd(), 'tests/fixtures/facebook-marketplace-search.html'),
    'utf-8'
  );
  
  const itemHtml = fs.readFileSync(
    path.join(process.cwd(), 'tests/fixtures/facebook-marketplace-item.html'),
    'utf-8'
  );
  
  const mockSearchParams = {
    query: 'vintage chair',
    location: 'New York, NY',
    radius: 10,
    minPrice: 50,
    maxPrice: 200,
    category: 'furniture',
    limit: 10,
  };
  
  const mockSearchResults = [
    {
      listingId: '123456789',
      title: 'Vintage Mid-Century Chair',
      price: 150,
      currency: 'USD',
      location: 'Brooklyn, NY',
      distance: 5,
      listingUrl: 'https://www.facebook.com/marketplace/item/123456789/',
      imageUrl: 'https://example.com/image1.jpg',
      description: 'Beautiful vintage mid-century chair in excellent condition.',
      category: 'Furniture',
      condition: 'Good',
      sellerInfo: {
        name: 'John Doe',
        rating: '★★★★☆ 4.8',
        joinedDate: 'January 2019',
        profileUrl: 'https://www.facebook.com/user/johndoe',
      },
      postedAt: '2 days ago',
    },
    // Add more mock results as needed
  ];
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the cache mock
    (Cache as jest.Mock).mockClear();
    
    // Mock the HTML parser to return our mock results
    (parseMarketplaceSearchResults as jest.Mock).mockReturnValue(mockSearchResults);
    (parseMarketplaceListingDetails as jest.Mock).mockReturnValue(mockSearchResults[0]);
  });
  
  describe('searchFacebookMarketplace', () => {
    it('should search Facebook Marketplace and return results', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          status_code: 200,
          body: searchHtml,
        }),
      });
      
      // Mock cache miss
      (Cache.prototype.get as jest.Mock).mockReturnValueOnce(null);
      
      // Call the service
      const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
          }),
          body: expect.any(String),
        })
      );
      
      // Verify the HTML parser was called
      expect(parseMarketplaceSearchResults).toHaveBeenCalledWith(searchHtml);
      
      // Verify results match our mock results
      expect(results).toEqual(mockSearchResults);
      
      // Verify the results were cached
      expect(Cache.prototype.set).toHaveBeenCalledWith(
        expect.any(String),
        mockSearchResults,
        undefined
      );
    });
    
    it('should return cached results if available', async () => {
      // Mock cache hit
      (Cache.prototype.get as jest.Mock).mockReturnValueOnce(mockSearchResults);
      
      // Call the service
      const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify fetch was NOT called
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Verify the HTML parser was NOT called
      expect(parseMarketplaceSearchResults).not.toHaveBeenCalled();
      
      // Verify results match our mock results
      expect(results).toEqual(mockSearchResults);
    });
    
    it('should handle API errors and fall back to mock data', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({
          status_code: 500,
          error: 'Internal Server Error',
        }),
      });
      
      // Mock cache miss
      (Cache.prototype.get as jest.Mock).mockReturnValueOnce(null);
      
      // Mock the mockSearch method
      jest.spyOn(brightDataService, 'mockSearch').mockResolvedValueOnce(mockSearchResults);
      
      // Call the service
      const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify mockSearch was called
      expect(brightDataService.mockSearch).toHaveBeenCalledWith(mockSearchParams);
      
      // Verify results match our mock results
      expect(results).toEqual(mockSearchResults);
      
      // Verify the mock results were cached (with shorter TTL)
      expect(Cache.prototype.set).toHaveBeenCalledWith(
        expect.any(String),
        mockSearchResults,
        expect.any(Number)
      );
    });
    
    it('should handle empty search results and fall back to mock data', async () => {
      // Mock successful API response but with no results
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          status_code: 200,
          body: '<div>No results found</div>',
        }),
      });
      
      // Mock cache miss
      (Cache.prototype.get as jest.Mock).mockReturnValueOnce(null);
      
      // Mock empty search results
      (parseMarketplaceSearchResults as jest.Mock).mockReturnValueOnce([]);
      
      // Mock the mockSearch method
      jest.spyOn(brightDataService, 'mockSearch').mockResolvedValueOnce(mockSearchResults);
      
      // Call the service
      const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify mockSearch was called
      expect(brightDataService.mockSearch).toHaveBeenCalledWith(mockSearchParams);
      
      // Verify results match our mock results
      expect(results).toEqual(mockSearchResults);
    });
    
    it('should apply rate limiting before making API requests', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({
          status_code: 200,
          body: searchHtml,
        }),
      });
      
      // Mock cache miss
      (Cache.prototype.get as jest.Mock).mockReturnValueOnce(null);
      
      // Spy on the applyRateLimiting method
      jest.spyOn(brightDataService, 'applyRateLimiting');
      
      // Call the service
      await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify rate limiting was applied
      expect(brightDataService.applyRateLimiting).toHaveBeenCalled();
    });
    
    it('should retry on rate limiting errors', async () => {
      // Mock rate limiting error then success
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: jest.fn().mockResolvedValueOnce({
            status_code: 429,
            error: 'Rate limit exceeded',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValueOnce({
            status_code: 200,
            body: searchHtml,
          }),
        });
      
      // Mock cache miss
      (Cache.prototype.get as jest.Mock).mockReturnValueOnce(null);
      
      // Mock setTimeout
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });
      
      // Call the service
      const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
      
      // Verify fetch was called twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Verify results match our mock results
      expect(results).toEqual(mockSearchResults);
    });
  });
  
  describe('fetchWithRetry', () => {
    it('should retry failed requests up to max retries', async () => {
      // Mock failed responses for all retries
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValueOnce('Server Error 1'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValueOnce('Server Error 2'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValueOnce('Server Error 3'),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValueOnce('Server Error 4'),
        });
      
      // Mock setTimeout
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });
      
      // Call fetchWithRetry with 3 max retries
      await expect(
        brightDataService.fetchWithRetry(
          'https://example.com',
          { method: 'GET' },
          3,
          100
        )
      ).rejects.toThrow();
      
      // Verify fetch was called 4 times (initial + 3 retries)
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
    
    it('should return successful response immediately', async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ success: true }),
      });
      
      // Call fetchWithRetry
      const response = await brightDataService.fetchWithRetry(
        'https://example.com',
        { method: 'GET' }
      );
      
      // Verify fetch was called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Verify response is correct
      expect(response.ok).toBe(true);
      expect(await response.json()).toEqual({ success: true });
    });
    
    it('should retry on network errors', async () => {
      // Mock network error then success
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValueOnce({ success: true }),
        });
      
      // Mock setTimeout
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });
      
      // Call fetchWithRetry
      const response = await brightDataService.fetchWithRetry(
        'https://example.com',
        { method: 'GET' }
      );
      
      // Verify fetch was called twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Verify response is correct
      expect(response.ok).toBe(true);
      expect(await response.json()).toEqual({ success: true });
    });
  });
  
  describe('generateCacheKey', () => {
    it('should generate consistent cache keys for the same parameters', () => {
      const key1 = brightDataService.generateCacheKey(mockSearchParams);
      const key2 = brightDataService.generateCacheKey(mockSearchParams);
      
      expect(key1).toBe(key2);
    });
    
    it('should generate different cache keys for different parameters', () => {
      const key1 = brightDataService.generateCacheKey(mockSearchParams);
      const key2 = brightDataService.generateCacheKey({
        ...mockSearchParams,
        query: 'modern sofa',
      });
      
      expect(key1).not.toBe(key2);
    });
    
    it('should normalize parameters for consistent cache keys', () => {
      const key1 = brightDataService.generateCacheKey({
        query: 'Vintage Chair',
        location: 'New York, NY',
        minPrice: 50,
        maxPrice: 200,
        category: 'Furniture',
        limit: 10,
      });
      
      const key2 = brightDataService.generateCacheKey({
        query: 'vintage chair',
        location: 'new york, ny',
        minPrice: 50,
        maxPrice: 200,
        category: 'furniture',
        limit: 10,
      });
      
      expect(key1).toBe(key2);
    });
  });
});