import { mockBrightDataResults, mockCreatePresetResponse, mockQuotaResponse, mockTestPresetResponse } from './brightdata';

// Mock Bright Data service implementation
export const mockBrightDataService = {
  searchFacebookMarketplace: jest.fn().mockResolvedValue(mockBrightDataResults),
  mockSearch: jest.fn().mockResolvedValue(mockBrightDataResults),
  createOrUpdateMCPPreset: jest.fn().mockResolvedValue({
    success: true,
    presetId: mockCreatePresetResponse.preset_id
  }),
  testMCPPreset: jest.fn().mockResolvedValue({
    success: true,
    data: mockTestPresetResponse
  }),
  checkQuota: jest.fn().mockResolvedValue({
    success: true,
    quota: mockQuotaResponse
  }),
  getProxyDetails: jest.fn().mockReturnValue({
    host: 'brd.superproxy.io',
    port: 33325,
    username: 'brd-customer-hl_fo7ed603-zone-mcp_unlocker',
    password: 'c9sfk6u49o4w',
    zoneName: 'mcp_unlocker',
    proxyUrl: 'http://brd-customer-hl_fo7ed603-zone-mcp_unlocker:c9sfk6u49o4w@brd.superproxy.io:33325',
    curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer 9ef6d96c-2ecd-4614-a549-354bf25687ab" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\''
  })
};

// Mock Facebook Marketplace preset configuration
export const mockFacebookMarketplacePresetConfig = {
  preset_name: 'fb-marketplace-scraper',
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