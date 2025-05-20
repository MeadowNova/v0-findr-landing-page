import { TokenBucketRateLimiter, SlidingWindowRateLimiter } from '@/lib/utils/rate-limiter';

describe('Rate Limiter Utilities', () => {
  describe('TokenBucketRateLimiter', () => {
    it('should allow consuming tokens up to capacity', () => {
      const limiter = new TokenBucketRateLimiter({
        capacity: 5,
        refillRate: 1, // 1 token per second
      });
      
      // Should be able to consume up to capacity
      expect(limiter.consume(1)).toBe(true);
      expect(limiter.consume(2)).toBe(true);
      expect(limiter.consume(2)).toBe(true);
      
      // Should not be able to consume more than capacity
      expect(limiter.consume(1)).toBe(false);
    });
    
    it('should refill tokens over time', async () => {
      const limiter = new TokenBucketRateLimiter({
        capacity: 5,
        refillRate: 10, // 10 tokens per second
      });
      
      // Consume all tokens
      expect(limiter.consume(5)).toBe(true);
      expect(limiter.consume(1)).toBe(false);
      
      // Wait for tokens to refill
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms = 2 tokens at 10/sec
      
      // Should be able to consume refilled tokens
      expect(limiter.consume(2)).toBe(true);
      expect(limiter.consume(1)).toBe(false);
    });
    
    it('should wait for tokens with consumeAsync', async () => {
      const limiter = new TokenBucketRateLimiter({
        capacity: 5,
        refillRate: 10, // 10 tokens per second
      });
      
      // Consume all tokens
      expect(limiter.consume(5)).toBe(true);
      
      // Start timer
      const startTime = Date.now();
      
      // Wait for tokens with consumeAsync
      await limiter.consumeAsync(2);
      
      // Check elapsed time
      const elapsedMs = Date.now() - startTime;
      
      // Should have waited at least 200ms for 2 tokens at 10/sec
      expect(elapsedMs).toBeGreaterThanOrEqual(180); // Allow some margin
    });
    
    it('should return current token count', () => {
      const limiter = new TokenBucketRateLimiter({
        capacity: 5,
        refillRate: 1,
      });
      
      expect(limiter.getTokens()).toBe(5);
      
      limiter.consume(2);
      expect(limiter.getTokens()).toBe(3);
    });
  });
  
  describe('SlidingWindowRateLimiter', () => {
    it('should allow requests up to max requests', () => {
      const limiter = new SlidingWindowRateLimiter({
        maxRequests: 3,
        windowMs: 1000,
      });
      
      // Should be able to make up to max requests
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(true);
      
      // Should not be able to make more requests
      expect(limiter.recordRequest()).toBe(false);
    });
    
    it('should allow new requests after window expires', async () => {
      const limiter = new SlidingWindowRateLimiter({
        maxRequests: 3,
        windowMs: 100, // 100ms window
      });
      
      // Make max requests
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 110));
      
      // Should be able to make new requests
      expect(limiter.recordRequest()).toBe(true);
    });
    
    it('should wait for window with recordRequestAsync', async () => {
      const limiter = new SlidingWindowRateLimiter({
        maxRequests: 3,
        windowMs: 100, // 100ms window
      });
      
      // Make max requests
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(true);
      expect(limiter.recordRequest()).toBe(true);
      
      // Start timer
      const startTime = Date.now();
      
      // Wait for window with recordRequestAsync
      await limiter.recordRequestAsync();
      
      // Check elapsed time
      const elapsedMs = Date.now() - startTime;
      
      // Should have waited at least 100ms for window to expire
      expect(elapsedMs).toBeGreaterThanOrEqual(90); // Allow some margin
    });
    
    it('should return current request count', () => {
      const limiter = new SlidingWindowRateLimiter({
        maxRequests: 3,
        windowMs: 1000,
      });
      
      expect(limiter.getRequestCount()).toBe(0);
      
      limiter.recordRequest();
      limiter.recordRequest();
      
      expect(limiter.getRequestCount()).toBe(2);
    });
    
    it('should return time until next request', () => {
      const limiter = new SlidingWindowRateLimiter({
        maxRequests: 1,
        windowMs: 1000,
      });
      
      // No requests yet, should be 0
      expect(limiter.getTimeUntilNextRequest()).toBe(0);
      
      // Make a request
      limiter.recordRequest();
      
      // Should return time > 0
      expect(limiter.getTimeUntilNextRequest()).toBeGreaterThan(0);
    });
  });
});