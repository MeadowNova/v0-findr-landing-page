import { ApiException, ErrorCode } from '@/lib/api';
import { SearchParams, SellerInfo } from '@/lib/types/search';

// Bright Data MCP API configuration
const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const BRIGHTDATA_API_URL = 'https://api.brightdata.com/mcp';

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
}

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
        preset: 'web_data_facebook_marketplace',
        query: params.query,
        location: params.location || 'United States',
        radius: params.radius || 25, // miles
        min_price: params.minPrice,
        max_price: params.maxPrice,
        category: params.category,
        limit: params.limit || 50,
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
        sellerInfo: {
          name: item.seller_name,
          rating: item.seller_rating,
          joinedDate: item.seller_joined_date,
          profileUrl: item.seller_profile_url,
        },
        postedAt: item.posted_at,
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
  }
};
