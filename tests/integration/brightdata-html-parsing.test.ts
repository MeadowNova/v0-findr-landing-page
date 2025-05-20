import fs from 'fs';
import path from 'path';
import { brightDataService } from '@/lib/services/brightdata';
import { SearchParams } from '@/lib/types/search';

// Mock fetch globally
global.fetch = jest.fn();

describe('Bright Data HTML Parsing Integration', () => {
  // Load test fixtures
  const searchHtml = fs.readFileSync(
    path.join(process.cwd(), 'tests/fixtures/facebook-marketplace-search.html'),
    'utf-8'
  );
  
  const mockSearchParams: SearchParams = {
    query: 'vintage chair',
    location: 'New York, NY',
    minPrice: 50,
    maxPrice: 500,
    category: 'Furniture',
    limit: 10
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should parse Facebook Marketplace search results HTML', async () => {
    // Mock successful API response with our test HTML
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        status_code: 200,
        body: searchHtml
      })
    });
    
    // Call the service method
    const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
    
    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        }),
        body: expect.stringContaining(mockSearchParams.query)
      })
    );
    
    // Verify results
    expect(results).toHaveLength(5);
    
    // Check the first result
    expect(results[0]).toEqual(expect.objectContaining({
      listingId: '123456789',
      title: 'Vintage Mid-Century Chair',
      price: 150,
      currency: 'USD',
      location: 'Brooklyn, NY',
      listingUrl: 'https://www.facebook.com/marketplace/item/123456789/'
    }));
  });
  
  it('should use cache for repeated searches', async () => {
    // Mock successful API response with our test HTML for first call
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        status_code: 200,
        body: searchHtml
      })
    });
    
    // First call should hit the API
    const results1 = await brightDataService.searchFacebookMarketplace(mockSearchParams);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(results1).toHaveLength(5);
    
    // Second call with same parameters should use cache
    const results2 = await brightDataService.searchFacebookMarketplace(mockSearchParams);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still just one call
    expect(results2).toHaveLength(5);
    
    // Results should be the same
    expect(results2).toEqual(results1);
  });
  
  it('should retry on API failure', async () => {
    // Mock first call to fail
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    // Mock second call to succeed
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        status_code: 200,
        body: searchHtml
      })
    });
    
    // Call the service method
    const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
    
    // Verify fetch was called twice (original + retry)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify results
    expect(results).toHaveLength(5);
  });
  
  it('should fall back to mock data when no results are found', async () => {
    // Mock API response with empty HTML
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        status_code: 200,
        body: '<div>No results found</div>'
      })
    });
    
    // Call the service method
    const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
    
    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Verify we got mock results
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain(mockSearchParams.query);
  });
  
  it('should handle rate limiting errors', async () => {
    // Mock first call to return rate limit error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: jest.fn().mockResolvedValueOnce(JSON.stringify({
        error: 'rate limit exceeded'
      }))
    });
    
    // Mock second call to succeed
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        status_code: 200,
        body: searchHtml
      })
    });
    
    // Call the service method
    const results = await brightDataService.searchFacebookMarketplace(mockSearchParams);
    
    // Verify fetch was called twice (original + retry)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify results
    expect(results).toHaveLength(5);
  });
});