/**
 * Simple in-memory cache implementation
 * 
 * This utility provides a simple in-memory cache with TTL (Time-To-Live) support.
 * It's used to cache API responses and reduce the number of external API calls.
 */

interface CacheItem<T> {
  value: T;
  expiry: number; // Timestamp when this item expires
}

interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds
  maxSize?: number; // Maximum number of items in the cache
}

export class Cache<T> {
  private cache: Map<string, CacheItem<T>>;
  private ttl: number; // Default TTL in milliseconds
  private maxSize: number;
  
  /**
   * Create a new cache instance
   * @param options Cache options
   */
  constructor(options: CacheOptions = {}) {
    this.cache = new Map<string, CacheItem<T>>();
    this.ttl = options.ttl || 5 * 60 * 1000; // Default: 5 minutes
    this.maxSize = options.maxSize || 100; // Default: 100 items
  }
  
  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional TTL override (in milliseconds)
   */
  set(key: string, value: T, ttl?: number): void {
    // Clean expired items first
    this.cleanExpired();
    
    // If cache is at max size, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // Calculate expiry time
    const expiry = Date.now() + (ttl || this.ttl);
    
    // Store in cache
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // Return undefined if item doesn't exist
    if (!item) {
      return undefined;
    }
    
    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete a key from the cache
   * @param key Cache key
   * @returns True if key was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the number of items in the cache
   * @returns Number of items
   */
  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }
  
  /**
   * Clean expired items from the cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get or set a value in the cache
   * If the key doesn't exist or is expired, the factory function is called to generate a new value
   * @param key Cache key
   * @param factory Function to generate a value if not in cache
   * @param ttl Optional TTL override (in milliseconds)
   * @returns Cached or newly generated value
   */
  async getOrSet(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    // Try to get from cache first
    const cachedValue = this.get(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // Generate new value
    const newValue = await factory();
    
    // Store in cache
    this.set(key, newValue, ttl);
    
    return newValue;
  }
}