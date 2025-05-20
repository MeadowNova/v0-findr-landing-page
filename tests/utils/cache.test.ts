import { Cache } from '@/lib/utils/cache';

describe('Cache Utility', () => {
  let cache: Cache<string>;
  
  beforeEach(() => {
    // Create a new cache instance before each test
    cache = new Cache<string>({ ttl: 100, maxSize: 3 });
  });
  
  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });
  
  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });
  
  it('should respect TTL for cached items', async () => {
    cache.set('key1', 'value1', 50); // 50ms TTL
    
    // Value should be available immediately
    expect(cache.get('key1')).toBe('value1');
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 60));
    
    // Value should be expired
    expect(cache.get('key1')).toBeUndefined();
  });
  
  it('should respect max size limit', () => {
    // Add max size + 1 items
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4');
    
    // First item should be evicted
    expect(cache.get('key1')).toBeUndefined();
    
    // Other items should still be available
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });
  
  it('should check if key exists with has()', () => {
    cache.set('key1', 'value1');
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });
  
  it('should delete keys with delete()', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    
    cache.delete('key1');
    expect(cache.get('key1')).toBeUndefined();
  });
  
  it('should clear all keys with clear()', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.size()).toBe(0);
  });
  
  it('should return correct size', () => {
    expect(cache.size()).toBe(0);
    
    cache.set('key1', 'value1');
    expect(cache.size()).toBe(1);
    
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
    
    cache.delete('key1');
    expect(cache.size()).toBe(1);
  });
  
  it('should get or set values with getOrSet()', async () => {
    // First call should call factory function
    const factoryFn = jest.fn().mockResolvedValue('generated value');
    const value1 = await cache.getOrSet('key1', factoryFn);
    
    expect(value1).toBe('generated value');
    expect(factoryFn).toHaveBeenCalledTimes(1);
    
    // Second call should use cached value
    const value2 = await cache.getOrSet('key1', factoryFn);
    
    expect(value2).toBe('generated value');
    expect(factoryFn).toHaveBeenCalledTimes(1); // Still just one call
  });
});