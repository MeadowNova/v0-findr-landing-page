/**
 * Rate limiter implementation
 * 
 * This utility provides rate limiting functionality to prevent excessive API calls.
 * It supports both token bucket and sliding window algorithms.
 */

interface TokenBucketOptions {
  capacity: number; // Maximum number of tokens
  refillRate: number; // Tokens per second
  initialTokens?: number; // Initial number of tokens (default: capacity)
}

interface SlidingWindowOptions {
  maxRequests: number; // Maximum number of requests in the window
  windowMs: number; // Window size in milliseconds
}

/**
 * Token bucket rate limiter
 * 
 * This implementation uses the token bucket algorithm:
 * - The bucket has a maximum capacity of tokens
 * - Tokens are refilled at a constant rate
 * - Each operation consumes one or more tokens
 * - If there are not enough tokens, the operation is delayed
 */
export class TokenBucketRateLimiter {
  private capacity: number;
  private tokens: number;
  private refillRate: number; // tokens per second
  private lastRefillTimestamp: number;
  
  /**
   * Create a new token bucket rate limiter
   * @param options Rate limiter options
   */
  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.tokens = options.initialTokens !== undefined ? options.initialTokens : options.capacity;
    this.refillRate = options.refillRate;
    this.lastRefillTimestamp = Date.now();
  }
  
  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTimestamp;
    
    if (elapsedMs <= 0) {
      return;
    }
    
    // Calculate tokens to add
    const tokensToAdd = (elapsedMs / 1000) * this.refillRate;
    
    // Update tokens and timestamp
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }
  
  /**
   * Check if an operation can be performed
   * @param tokens Number of tokens to consume (default: 1)
   * @returns True if operation can be performed
   */
  canConsume(tokens: number = 1): boolean {
    this.refill();
    return this.tokens >= tokens;
  }
  
  /**
   * Consume tokens for an operation
   * @param tokens Number of tokens to consume (default: 1)
   * @returns True if tokens were consumed
   */
  consume(tokens: number = 1): boolean {
    if (!this.canConsume(tokens)) {
      return false;
    }
    
    this.tokens -= tokens;
    return true;
  }
  
  /**
   * Wait until tokens are available and consume them
   * @param tokens Number of tokens to consume (default: 1)
   * @returns Promise that resolves when tokens are consumed
   */
  async consumeAsync(tokens: number = 1): Promise<void> {
    // If we can consume immediately, do so
    if (this.consume(tokens)) {
      return;
    }
    
    // Calculate how long to wait
    this.refill();
    const tokensNeeded = tokens - this.tokens;
    const waitTimeMs = (tokensNeeded / this.refillRate) * 1000;
    
    // Wait and then consume
    await new Promise(resolve => setTimeout(resolve, waitTimeMs));
    this.tokens -= tokens;
  }
  
  /**
   * Get the current number of tokens
   * @returns Current token count
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }
}

/**
 * Sliding window rate limiter
 * 
 * This implementation uses the sliding window algorithm:
 * - Keeps track of timestamps of recent requests
 * - Limits the number of requests in a sliding time window
 * - Older requests outside the window are discarded
 */
export class SlidingWindowRateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requestTimestamps: number[] = [];
  
  /**
   * Create a new sliding window rate limiter
   * @param options Rate limiter options
   */
  constructor(options: SlidingWindowOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }
  
  /**
   * Remove timestamps outside the current window
   */
  private removeOldTimestamps(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Remove timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp >= windowStart
    );
  }
  
  /**
   * Check if a request can be made
   * @returns True if request can be made
   */
  canMakeRequest(): boolean {
    this.removeOldTimestamps();
    return this.requestTimestamps.length < this.maxRequests;
  }
  
  /**
   * Record a request
   * @returns True if request was recorded
   */
  recordRequest(): boolean {
    if (!this.canMakeRequest()) {
      return false;
    }
    
    this.requestTimestamps.push(Date.now());
    return true;
  }
  
  /**
   * Wait until a request can be made and record it
   * @returns Promise that resolves when request is recorded
   */
  async recordRequestAsync(): Promise<void> {
    // If we can make a request immediately, do so
    if (this.recordRequest()) {
      return;
    }
    
    // Calculate how long to wait
    this.removeOldTimestamps();
    const oldestTimestamp = this.requestTimestamps[0];
    const waitTimeMs = oldestTimestamp + this.windowMs - Date.now() + 10; // Add 10ms buffer
    
    // Wait and then record
    await new Promise(resolve => setTimeout(resolve, waitTimeMs));
    this.requestTimestamps.push(Date.now());
  }
  
  /**
   * Get the number of requests in the current window
   * @returns Current request count
   */
  getRequestCount(): number {
    this.removeOldTimestamps();
    return this.requestTimestamps.length;
  }
  
  /**
   * Get the time until the next request can be made
   * @returns Time in milliseconds until next request, or 0 if can make request now
   */
  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) {
      return 0;
    }
    
    this.removeOldTimestamps();
    const oldestTimestamp = this.requestTimestamps[0];
    return Math.max(0, oldestTimestamp + this.windowMs - Date.now());
  }
}