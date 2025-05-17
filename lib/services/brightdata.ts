import { ApiException, ErrorCode } from '@/lib/api';
import { SearchParams, SellerInfo } from '@/lib/types/search';

// Bright Data MCP API configuration
const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '9ef6d96c-2ecd-4614-a549-354bf25687ab';
const BRIGHTDATA_API_URL = 'https://api.brightdata.com/mcp';
const BRIGHTDATA_MCP_PRESET = 'fb-marketplace-scraper';

// Bright Data proxy configuration
const BRIGHTDATA_PROXY_HOST = process.env.BRIGHTDATA_PROXY_HOST || 'brd.superproxy.io';
const BRIGHTDATA_PROXY_PORT = parseInt(process.env.BRIGHTDATA_PROXY_PORT || '33325', 10);
const BRIGHTDATA_PROXY_USERNAME = process.env.BRIGHTDATA_PROXY_USERNAME || 'brd-customer-hl_fo7ed603-zone-mcp_unlocker';
const BRIGHTDATA_PROXY_PASSWORD = process.env.BRIGHTDATA_PROXY_PASSWORD || 'c9sfk6u49o4w';
const BRIGHTDATA_ZONE_NAME = process.env.BRIGHTDATA_ZONE_NAME || 'mcp_unlocker';

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
   * Search Facebook Marketplace using Bright Data MCP
   * @param params Search parameters
   * @returns Search results
   */
  async searchFacebookMarketplace(params: SearchParams): Promise<BrightDataResult[]> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Prepare request parameters for Bright Data MCP
      const requestParams = {
        preset: BRIGHTDATA_MCP_PRESET,
        query: params.query,
        location: params.location || 'United States',
        radius: params.radius || 25, // miles
        min_price: params.minPrice,
        max_price: params.maxPrice,
        category: params.category,
        limit: params.limit || 50,
        options: {
          wait_for_selectors: facebookMarketplacePresetConfig.extraction_settings.wait_for_selectors,
          extract_fields: facebookMarketplacePresetConfig.extraction_settings.extract_fields,
          geolocation: facebookMarketplacePresetConfig.geolocation,
          proxy_rotation: facebookMarketplacePresetConfig.proxy_rotation
        }
      };

      // Make request to Bright Data MCP API
      const response = await fetch(BRIGHTDATA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify(requestParams),
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data MCP API request failed',
          { message: errorData.message || response.statusText }
        );
      }

      // Parse response
      const data = await response.json();

      // Map Bright Data results to our interface
      return data.results.map((item: any) => ({
        listingId: item.id || `fb-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        title: item.title,
        price: parseFloat(item.price?.replace(/[^0-9.]/g, '')) || null,
        currency: item.price?.match(/[^0-9.]/g)?.[0] || 'USD',
        location: item.location,
        distance: item.distance ? parseFloat(item.distance) : null,
        listingUrl: item.url,
        imageUrl: item.image_url || item.thumbnail,
        description: item.description,
        condition: item.condition,
        category: item.category,
        sellerInfo: {
          name: item.seller_name || item.seller_info?.name,
          rating: item.seller_rating || item.seller_info?.rating,
          joinedDate: item.seller_joined_date || item.seller_info?.joined_date,
          profileUrl: item.seller_profile_url || item.seller_info?.profile_url,
        },
        postedAt: item.posted_at || item.posted_time,
      }));
    } catch (error) {
      console.error('Bright Data MCP API error:', error);

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
   * Create or update the Facebook Marketplace MCP preset in Bright Data
   * @returns Success status and preset ID
   */
  async createOrUpdateMCPPreset(): Promise<{ success: boolean; presetId?: string; error?: string }> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Make request to Bright Data MCP API to create/update preset
      const response = await fetch(`${BRIGHTDATA_API_URL}/presets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify(facebookMarketplacePresetConfig),
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to create/update Bright Data MCP preset',
          { message: errorData.message || response.statusText }
        );
      }

      // Parse response
      const data = await response.json();

      return {
        success: true,
        presetId: data.preset_id || data.id,
      };
    } catch (error) {
      console.error('Error creating/updating Bright Data MCP preset:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Test the Facebook Marketplace MCP preset with a sample URL
   * @param testUrl Sample Facebook Marketplace URL to test
   * @returns Test results
   */
  async testMCPPreset(testUrl: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Make request to Bright Data MCP API to test preset
      const response = await fetch(`${BRIGHTDATA_API_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
        body: JSON.stringify({
          preset: BRIGHTDATA_MCP_PRESET,
          url: testUrl,
        }),
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to test Bright Data MCP preset',
          { message: errorData.message || response.statusText }
        );
      }

      // Parse response
      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error testing Bright Data MCP preset:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Check remaining quota and usage statistics for Bright Data MCP
   * @returns Quota information
   */
  async checkQuota(): Promise<{ success: boolean; quota?: any; error?: string }> {
    try {
      // Validate API key
      if (!BRIGHTDATA_API_KEY) {
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Bright Data API key is not configured',
        );
      }

      // Make request to Bright Data MCP API to check quota
      const response = await fetch(`${BRIGHTDATA_API_URL}/quota`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        },
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiException(
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          'Failed to check Bright Data MCP quota',
          { message: errorData.message || response.statusText }
        );
      }

      // Parse response
      const data = await response.json();

      return {
        success: true,
        quota: data,
      };
    } catch (error) {
      console.error('Error checking Bright Data MCP quota:', error);

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
  }
};
