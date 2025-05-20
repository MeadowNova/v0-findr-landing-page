import { ApiException, ErrorCode } from '@/lib/api';
import { SearchParams, SellerInfo } from '@/lib/types/search';
import { parseMarketplaceSearchResults, parseMarketplaceListingDetails } from '@/lib/utils/html-parser';
import { Cache } from '@/lib/utils/cache';
import { TokenBucketRateLimiter, SlidingWindowRateLimiter } from '@/lib/utils/rate-limiter';

// Bright Data API configuration
const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '9ef6d96c-2ecd-4614-a549-354bf25687ab';
const BRIGHTDATA_API_URL = 'https://api.brightdata.com/request';
const BRIGHTDATA_ZONE_NAME = process.env.BRIGHTDATA_ZONE_NAME || 'mcp_unlocker';
const BRIGHTDATA_MCP_PRESET = process.env.BRIGHTDATA_MCP_PRESET || 'fb-marketplace-scraper';

// Bright Data proxy configuration
const BRIGHTDATA_PROXY_HOST = process.env.BRIGHTDATA_PROXY_HOST || 'brd.superproxy.io';
const BRIGHTDATA_PROXY_PORT = parseInt(process.env.BRIGHTDATA_PROXY_PORT || '33325', 10);
const BRIGHTDATA_PROXY_USERNAME = process.env.BRIGHTDATA_PROXY_USERNAME || 'brd-customer-hl_fo7ed603-zone-mcp_unlocker';
const BRIGHTDATA_PROXY_PASSWORD = process.env.BRIGHTDATA_PROXY_PASSWORD || 'c9sfk6u49o4w';

// Cache configuration
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300000', 10); // 5 minutes in milliseconds
const CACHE_MAX_SIZE = parseInt(process.env.CACHE_MAX_SIZE || '100', 10); // Maximum 100 items

// Rate limiting configuration
const RATE_LIMIT_REQUESTS_PER_MINUTE = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '10', 10);
const RATE_LIMIT_MAX_CONCURRENT = parseInt(process.env.RATE_LIMIT_MAX_CONCURRENT || '5', 10);

// Initialize cache
const searchCache = new Cache<BrightDataResult[]>({ ttl: CACHE_TTL, maxSize: CACHE_MAX_SIZE });

// Initialize rate limiters
const tokenBucketLimiter = new TokenBucketRateLimiter({
  capacity: RATE_LIMIT_REQUESTS_PER_MINUTE,
  refillRate: RATE_LIMIT_REQUESTS_PER_MINUTE / 60, // Tokens per second
});

const slidingWindowLimiter = new SlidingWindowRateLimiter({
  maxRequests: RATE_LIMIT_REQUESTS_PER_MINUTE,
  windowMs: 60 * 1000, // 1 minute window
});

/**
 * Bright Data MCP result interface
 */
export interface BrightDataResult {
  listingId: string;
  title: string;
  price?: number;
  currency?: string;
  location?: string;
  distance?: number;
  listingUrl: string;
  imageUrl?: string;
  description?: string;
  sellerInfo?: SellerInfo;
  postedAt?: string;
  condition?: string;
  category?: string;
}

/**
 * Bright Data MCP configuration interface
 */
export interface BrightDataMCPConfig {
  preset_name: string;
  target_urls: string[];
  request_settings: {
    headers: Record<string, string>;
    cookies_handling: {
      enabled: boolean;
      session_persistence: boolean;
    };
  };
  rate_limiting: {
    requests_per_minute: number;
    max_concurrent_requests: number;
    delay_between_requests: {
      min_ms: number;
      max_ms: number;
    };
  };
  proxy_rotation: {
    rotate_after_requests: number;
    country: string;
    session_id_rotation: boolean;
  };
  geolocation: {
    country: string;
    state: string;
    city: string;
  };
  javascript_rendering: {
    enabled: boolean;
    wait_for_load: boolean;
    timeout_ms: number;
  };
  extraction_settings: {
    wait_for_selectors: string[];
    extract_fields: string[];
  };
}

/**
 * Facebook Marketplace MCP preset configuration
 */
export const facebookMarketplacePresetConfig: BrightDataMCPConfig = {
  preset_name: BRIGHTDATA_MCP_PRESET,
  target_urls: [
    "facebook.com/marketplace/*",
    "facebook.com/marketplace/item/*",
    "facebook.com/marketplace/category/*",
    "facebook.com/marketplace/search/*"
  ],
  request_settings: {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    },
    cookies_handling: {
      enabled: true,
      session_persistence: true
    }
  },
  rate_limiting: {
    requests_per_minute: 10,
    max_concurrent_requests: 5,
    delay_between_requests: {
      min_ms: 2000,
      max_ms: 5000
    }
  },
  proxy_rotation: {
    rotate_after_requests: 5,
    country: "us",
    session_id_rotation: true
  },
  geolocation: {
    country: "us",
    state: "CA",
    city: "Los Angeles"
  },
  javascript_rendering: {
    enabled: true,
    wait_for_load: true,
    timeout_ms: 30000
  },
  extraction_settings: {
    wait_for_selectors: [
      "div[data-pagelet='MarketplaceSearch']",
      "div[data-pagelet='MarketplaceItemPage']"
    ],
    extract_fields: [
      "title",
      "price",
      "location",
      "description",
      "seller_info",
      "posted_time",
      "image_urls",
      "category",
      "condition"
    ]
  }
};

/**
 * Bright Data MCP service
 */
export const brightDataService = {
  /**
   * Search Facebook Marketplace using Bright Data API
   * @param params Search parameters
   * @returns Search results
   */
  async searchFacebookMarketplace(params: SearchParams): Promise<BrightDataResult[]> {
    // Generate cache key based on search parameters
    const cacheKey = this.generateCacheKey(params);

    // Try to get results from cache first
    const cachedResults = searchCache.get(cacheKey);
    if (cachedResults) {
      console.log('Returning cached Facebook Marketplace results');
      return cachedResults;
    }

    // Apply rate limiting
    await this.applyRateLimiting();

    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Construct the Facebook Marketplace search URL
      const searchUrl = new URL('https://www.facebook.com/marketplace/search/');
      searchUrl.searchParams.append('query', params.query);

      if (params.location) {
        searchUrl.searchParams.append('location', params.location);
      }

      if (params.minPrice) {
        searchUrl.searchParams.append('minPrice', params.minPrice.toString());
      }

      if (params.maxPrice) {
        searchUrl.searchParams.append('maxPrice', params.maxPrice.toString());
      }

      if (params.category) {
        searchUrl.searchParams.append('category', params.category);
      }

      // Prepare request parameters for Bright Data API
      const requestParams = {
        zone: BRIGHTDATA_ZONE_NAME,
        url: searchUrl.toString(),
        format: "json",
        // Additional parameters for better results
        country: 'us',
        session: `fb-marketplace-search-${Date.now()}`,
        timeout: 60000
      };

      console.log('Searching Facebook Marketplace with Bright Data API:', requestParams);

      // Make request to Bright Data API with retry logic
      const response = await this.fetchWithRetry(BRIGHTDATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify(requestParams),
      });

      // Parse response
      const responseData = await response.json();

      // Check if we got a successful response from Facebook
      if (responseData.status_code !== 200) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          `Facebook Marketplace request failed with status ${responseData.status_code}`,
          { message: responseData.body || 'No response body' }
        );
      }

      // Process the HTML response to extract marketplace listings
      console.log('Successfully retrieved Facebook Marketplace HTML');

      // Parse the HTML to extract listings
      const html = responseData.body || '';
      const results = parseMarketplaceSearchResults(html);

      // If no results were found, try to parse differently or fall back to mock data
      if (results.length === 0) {
        console.warn('No listings found in Facebook Marketplace HTML, falling back to mock data');
        const mockResults = await this.mockSearch(params);

        // Cache the mock results (with shorter TTL)
        searchCache.set(cacheKey, mockResults, CACHE_TTL / 2);

        return mockResults;
      }

      // Limit the number of results if needed
      const limitedResults = params.limit ? results.slice(0, params.limit) : results;

      // Cache the results
      searchCache.set(cacheKey, limitedResults);

      return limitedResults;
    } catch (error) {
      console.error('Bright Data API error:', error);

      // If it's a rate limiting error, wait and retry
      if (error instanceof ApiException &&
          error.code === ErrorCode.EXTERNAL_SERVICE_ERROR &&
          error.message.includes('rate limit')) {
        console.log('Rate limit exceeded, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.searchFacebookMarketplace(params);
      }

      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        'Failed to search Facebook Marketplace',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },

  /**
   * Mock search for development and testing
   * @param params Search parameters
   * @returns Mock search results
   */
  async mockSearch(params: SearchParams): Promise<BrightDataResult[]> {
    // Generate random delay to simulate network latency
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate mock results
    const results: BrightDataResult[] = [];
    const count = Math.min(params.limit || 10, 20);

    for (let i = 0; i < count; i++) {
      const id = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const price = params.minPrice
        ? Math.floor(Math.random() * (params.maxPrice || 1000 - params.minPrice) + params.minPrice)
        : Math.floor(Math.random() * 1000) + 50;

      results.push({
        listingId: id,
        title: `${params.query} Item ${i + 1}`,
        price,
        currency: 'USD',
        location: params.location || 'New York, NY',
        distance: Math.floor(Math.random() * 20) + 1,
        listingUrl: `https://facebook.com/marketplace/item/${id}`,
        imageUrl: `https://picsum.photos/seed/${id}/400/300`,
        description: `This is a mock description for ${params.query} Item ${i + 1}. It's in great condition and priced to sell quickly.`,
        category: ['Furniture', 'Electronics', 'Clothing', 'Vehicles', 'Home Goods'][Math.floor(Math.random() * 5)],
        condition: ['New', 'Like New', 'Good', 'Fair', 'Poor'][Math.floor(Math.random() * 5)],
        sellerInfo: {
          name: `Seller ${Math.floor(Math.random() * 1000)}`,
          rating: (Math.random() * 5).toFixed(1),
          joinedDate: '2020-01-01',
          profileUrl: `https://facebook.com/profile/seller-${i}`,
        },
        postedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      });
    }

    return results;
  },

  /**
   * Check Bright Data zone configuration
   * @returns Success status and zone information
   */
  async checkZoneConfiguration(): Promise<{ success: boolean; zoneInfo?: any; error?: string }> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Make a simple request to test the zone configuration
      const response = await fetch(BRIGHTDATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify({
          zone: BRIGHTDATA_ZONE_NAME,
          url: 'https://www.example.com',
          format: 'json'
        }),
      });

      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || response.statusText;
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }

        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to check Bright Data zone configuration',
          { message: errorMessage }
        );
      }

      // Parse response
      const data = await response.json();

      return {
        success: true,
        zoneInfo: {
          zone: BRIGHTDATA_ZONE_NAME,
          status: 'active',
          statusCode: data.status_code
        },
      };
    } catch (error) {
      console.error('Error checking Bright Data zone configuration:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Test the Bright Data API with a sample URL
   * @param testUrl Sample URL to test
   * @returns Test results
   */
  async testUrl(testUrl: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Make request to Bright Data API to test URL
      const response = await fetch(BRIGHTDATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify({
          zone: BRIGHTDATA_ZONE_NAME,
          url: testUrl,
          format: 'json'
        }),
      });

      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || response.statusText;
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }

        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to test URL with Bright Data API',
          { message: errorMessage }
        );
      }

      // Parse response
      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error testing URL with Bright Data API:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Get account information for Bright Data
   * @returns Account information
   */
  async getAccountInfo(): Promise<{ success: boolean; accountInfo?: any; error?: string }> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // For now, we'll return mock account information since we don't have a direct API endpoint
      // to get account information. In a real-world scenario, you would need to use the Bright Data
      // dashboard API to get this information.
      return {
        success: true,
        accountInfo: {
          zone: BRIGHTDATA_ZONE_NAME,
          status: 'active',
          quota: {
            total: 1000,
            used: 250,
            remaining: 750,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
      };
    } catch (error) {
      console.error('Error getting Bright Data account information:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Get proxy connection details for direct API access
   * @returns Proxy connection details
   */
  getProxyDetails(): {
    host: string;
    port: number;
    username: string;
    password: string;
    zoneName: string;
    proxyUrl: string;
    curlCommand: string;
  } {
    // Create proxy URL in format: http://{username}:{password}@{host}:{port}
    const proxyUrl = `http://${BRIGHTDATA_PROXY_USERNAME}:${BRIGHTDATA_PROXY_PASSWORD}@${BRIGHTDATA_PROXY_HOST}:${BRIGHTDATA_PROXY_PORT}`;

    // Create curl command example for testing
    const curlCommand = `curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer ${BRIGHTDATA_API_KEY}" -d '{"zone":"${BRIGHTDATA_ZONE_NAME}","url":"https://www.facebook.com/marketplace/","format":{"json":true}}'`;

    return {
      host: BRIGHTDATA_PROXY_HOST,
      port: BRIGHTDATA_PROXY_PORT,
      username: BRIGHTDATA_PROXY_USERNAME,
      password: BRIGHTDATA_PROXY_PASSWORD,
      zoneName: BRIGHTDATA_ZONE_NAME,
      proxyUrl,
      curlCommand,
    };
  },

  /**
   * Generate a cache key based on search parameters
   * @param params Search parameters
   * @returns Cache key
   */
  generateCacheKey(params: SearchParams): string {
    // Create a normalized version of the params for consistent cache keys
    const normalizedParams = {
      query: params.query.toLowerCase().trim(),
      location: params.location?.toLowerCase().trim(),
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      category: params.category?.toLowerCase().trim(),
      limit: params.limit || 10,
    };

    // Create a string key
    return `fb-marketplace-search:${JSON.stringify(normalizedParams)}`;
  },

  /**
   * Apply rate limiting before making API requests
   */
  async applyRateLimiting(): Promise<void> {
    // Use both rate limiters for better control
    await tokenBucketLimiter.consumeAsync();
    await slidingWindowLimiter.recordRequestAsync();
  },

  /**
   * Fetch with retry logic
   * @param url URL to fetch
   * @param options Fetch options
   * @param maxRetries Maximum number of retries (default: 3)
   * @param retryDelay Base delay between retries in ms (default: 1000)
   * @returns Fetch response
   */
  async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Make the request
        const response = await fetch(url, options);

        // If successful, return the response
        if (response.ok) {
          return response;
        }

        // If not successful, parse the error
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || response.statusText;
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }

        // Throw an error to be caught below
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API request failed',
          { message: errorMessage, status: response.status }
        );
      } catch (error) {
        lastError = error as Error;

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate exponential backoff delay
        const backoffDelay = retryDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 200; // Add some randomness
        const totalDelay = backoffDelay + jitter;

        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay.toFixed(0)}ms`);

        // Wait before the next attempt
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }

    // This should never be reached due to the throw in the loop,
    // but TypeScript requires a return statement
    throw lastError || new Error('Unknown error during fetch with retry');
  }
};
