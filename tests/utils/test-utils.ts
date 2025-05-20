/**
 * Test utilities for Bright Data MCP integration tests
 */

import { SearchParams } from '@/lib/types/search';

/**
 * Generate random search parameters for testing
 * @returns Random search parameters
 */
export function generateRandomSearchParams(): SearchParams {
  const queries = ['vintage chair', 'antique table', 'mid-century sofa', 'modern desk', 'rustic cabinet'];
  const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
  const categories = ['Furniture', 'Electronics', 'Clothing', 'Vehicles', 'Home Goods'];
  
  return {
    query: queries[Math.floor(Math.random() * queries.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    radius: Math.floor(Math.random() * 50) + 5, // 5-55 miles
    minPrice: Math.floor(Math.random() * 100), // 0-99
    maxPrice: Math.floor(Math.random() * 900) + 100, // 100-999
    category: categories[Math.floor(Math.random() * categories.length)],
    limit: Math.floor(Math.random() * 20) + 1 // 1-20
  };
}

/**
 * Mock environment variables for testing
 * @param overrides Optional overrides for specific environment variables
 */
export function mockEnvironmentVariables(overrides: Record<string, string> = {}): void {
  const defaultEnv = {
    BRIGHTDATA_API_KEY: '9ef6d96c-2ecd-4614-a549-354bf25687ab',
    BRIGHTDATA_PROXY_HOST: 'brd.superproxy.io',
    BRIGHTDATA_PROXY_PORT: '33325',
    BRIGHTDATA_PROXY_USERNAME: 'brd-customer-hl_fo7ed603-zone-mcp_unlocker',
    BRIGHTDATA_PROXY_PASSWORD: 'c9sfk6u49o4w',
    BRIGHTDATA_ZONE_NAME: 'mcp_unlocker',
  };
  
  process.env = {
    ...process.env,
    ...defaultEnv,
    ...overrides
  };
}

/**
 * Reset mocked environment variables
 * @param originalEnv Original environment variables to restore
 */
export function resetEnvironmentVariables(originalEnv: NodeJS.ProcessEnv): void {
  process.env = originalEnv;
}

/**
 * Mock fetch response for testing
 * @param status HTTP status code
 * @param data Response data
 * @returns Mocked fetch response
 */
export function mockFetchResponse(status: number, data: any): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
    clone: jest.fn().mockReturnThis(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    redirected: false,
    type: 'basic',
    url: ''
  } as unknown as Response;
}

/**
 * Wait for a specified time
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock NextRequest for testing API routes
 * @param url Request URL
 * @param method HTTP method
 * @param body Request body
 * @returns Mocked NextRequest
 */
export function createMockNextRequest(url: string, method = 'GET', body?: any): Request {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return new Request(url, options);
}

/**
 * Create a mock API context for testing API routes
 * @param role User role
 * @param userId User ID
 * @returns Mocked API context
 */
export function createMockApiContext(role = 'admin', userId = 'user-123'): any {
  return {
    auth: {
      userId,
      role
    }
  };
}