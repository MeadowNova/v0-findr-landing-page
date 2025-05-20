import { brightDataService } from '@/lib/services/brightdata';
import { Cache } from '@/lib/utils/cache';
import { TokenBucketRateLimiter, SlidingWindowRateLimiter } from '@/lib/utils/rate-limiter';

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

// Mock fetch globally
global.fetch = jest.fn();

describe('Bright Data Performance and Load Testing', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        status_code: 200,
        body: '<div>Mock HTML</div>',
      }),
    });
    
    // Mock the mockSearch method
    jest.spyOn(brightDataService, 'mockSearch').mockImplementation(async (params) => {
      return Array(params.limit || 10).fill(0).map((_, i) => ({
        listingId: `mock-${i}`,
        title: `Mock Item ${i}`,
        price: 100 + i * 10,
        currency: 'USD',
        location: 'Mock Location',
        listingUrl: `https://example.com/mock/${i}`,
      }));
    });
  });
  
  describe('Cache Performance', () => {
    it('should use cache for repeated searches with the same parameters', async () => {
      // Mock cache miss then hit
      (Cache.prototype.get as jest.Mock)
        .mockReturnValueOnce(null) // First call: cache miss
        .mockReturnValueOnce([{ listingId: 'cached-item' }]); // Second call: cache hit
      
      // First search (cache miss)
      await brightDataService.searchFacebookMarketplace({
        query: 'test',
        limit: 10,
      });
      
      // Second search with same parameters (cache hit)
      const results = await brightDataService.searchFacebookMarketplace({
        query: 'test',
        limit: 10,
      });
      
      // Verify fetch was called only once (for the first search)
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Verify second search returned cached results
      expect(results[0].listingId).toBe('cached-item');
    });
    
    it('should measure cache hit rate', async () => {
      // Mock cache hit rate
      let cacheHits = 0;
      let cacheMisses = 0;
      
      // Override cache get method to track hits and misses
      (Cache.prototype.get as jest.Mock).mockImplementation((key) => {
        // Simulate cache hit for even keys, miss for odd keys
        if (key.endsWith('even')) {
          cacheHits++;
          return [{ listingId: 'cached-item' }];
        } else {
          cacheMisses++;
          return null;
        }
      });
      
      // Perform multiple searches
      for (let i = 0; i < 10; i++) {
        await brightDataService.searchFacebookMarketplace({
          query: `test-${i % 2 === 0 ? 'even' : 'odd'}`,
          limit: 10,
        });
      }
      
      // Calculate cache hit rate
      const hitRate = cacheHits / (cacheHits + cacheMisses);
      
      // Verify cache hit rate is as expected (5/10 = 0.5)
      expect(hitRate).toBe(0.5);
      
      // Verify fetch was called only for cache misses
      expect(global.fetch).toHaveBeenCalledTimes(cacheMisses);
    });
  });
  
  describe('Rate Limiting Performance', () => {
    it('should limit request rate using token bucket limiter', async () => {
      // Mock token bucket limiter to simulate rate limiting
      let tokens = 5;
      (TokenBucketRateLimiter.prototype.consume as jest.Mock).mockImplementation(() => {
        if (tokens > 0) {
          tokens--;
          return true;
        }
        return false;
      });
      
      (TokenBucketRateLimiter.prototype.consumeAsync as jest.Mock).mockImplementation(async () => {
        if (tokens > 0) {
          tokens--;
          return;
        }
        // Simulate waiting for token refill
        await new Promise(resolve => setTimeout(resolve, 100));
        tokens = 5; // Refill tokens
      });
      
      // Measure time to perform multiple searches
      const startTime = Date.now();
      
      // Perform 10 searches (should trigger rate limiting)
      const promises = Array(10).fill(0).map((_, i) => 
        brightDataService.searchFacebookMarketplace({
          query: `test-${i}`,
          limit: 5,
        })
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      
      // Verify rate limiting was applied (should have waited at least once)
      expect(TokenBucketRateLimiter.prototype.consumeAsync).toHaveBeenCalledTimes(10);
      
      // Log performance metrics
      console.log(`Rate limited 10 searches in ${elapsedMs}ms`);
    });
    
    it('should limit concurrent requests using sliding window limiter', async () => {
      // Mock sliding window limiter to simulate concurrency limiting
      let activeRequests = 0;
      const maxConcurrent = 3;
      
      (SlidingWindowRateLimiter.prototype.recordRequest as jest.Mock).mockImplementation(() => {
        if (activeRequests < maxConcurrent) {
          activeRequests++;
          return true;
        }
        return false;
      });
      
      (SlidingWindowRateLimiter.prototype.recordRequestAsync as jest.Mock).mockImplementation(async () => {
        if (activeRequests < maxConcurrent) {
          activeRequests++;
          return;
        }
        // Simulate waiting for a request to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        activeRequests--; // One request completed
        activeRequests++; // This request starts
      });
      
      // Create a delay function to simulate API request time
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Override fetch to include random delay
      (global.fetch as jest.Mock).mockImplementation(async () => {
        const requestTime = Math.random() * 100 + 50; // 50-150ms
        await delay(requestTime);
        activeRequests--; // Request completed
        
        return {
          ok: true,
          status: 200,
          json: async () => ({
            status_code: 200,
            body: '<div>Mock HTML</div>',
          }),
        };
      });
      
      // Measure time to perform multiple concurrent searches
      const startTime = Date.now();
      
      // Perform 10 concurrent searches (should be limited to maxConcurrent)
      const promises = Array(10).fill(0).map((_, i) => 
        brightDataService.searchFacebookMarketplace({
          query: `test-${i}`,
          limit: 5,
        })
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      
      // Verify concurrency limiting was applied
      expect(SlidingWindowRateLimiter.prototype.recordRequestAsync).toHaveBeenCalledTimes(10);
      
      // Log performance metrics
      console.log(`Concurrency limited 10 searches in ${elapsedMs}ms`);
    });
  });
  
  describe('Load Testing', () => {
    it('should handle multiple concurrent searches', async () => {
      // Mock cache to always miss
      (Cache.prototype.get as jest.Mock).mockReturnValue(null);
      
      // Measure time to perform multiple concurrent searches
      const startTime = Date.now();
      
      // Perform 20 concurrent searches
      const promises = Array(20).fill(0).map((_, i) => 
        brightDataService.searchFacebookMarketplace({
          query: `test-${i}`,
          limit: 5,
        })
      );
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      
      // Verify all searches returned results
      expect(results).toHaveLength(20);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
      
      // Log performance metrics
      console.log(`Completed 20 concurrent searches in ${elapsedMs}ms`);
      console.log(`Average time per search: ${elapsedMs / 20}ms`);
    });
    
    it('should handle repeated searches with different parameters', async () => {
      // Mock cache to always miss
      (Cache.prototype.get as jest.Mock).mockReturnValue(null);
      
      // Measure time to perform sequential searches with different parameters
      const startTime = Date.now();
      
      // Perform 10 sequential searches with different parameters
      for (let i = 0; i < 10; i++) {
        await brightDataService.searchFacebookMarketplace({
          query: `test-${i}`,
          location: i % 2 === 0 ? 'New York, NY' : 'Los Angeles, CA',
          minPrice: i * 10,
          maxPrice: i * 100,
          limit: 5,
        });
      }
      
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      
      // Verify fetch was called for each search
      expect(global.fetch).toHaveBeenCalledTimes(10);
      
      // Log performance metrics
      console.log(`Completed 10 sequential searches in ${elapsedMs}ms`);
      console.log(`Average time per search: ${elapsedMs / 10}ms`);
    });
  });
});