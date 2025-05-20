import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/brightdata/route';
import { GET as GET_quota } from '@/app/api/v1/brightdata/quota/route';
import { GET as GET_proxy } from '@/app/api/v1/brightdata/proxy/route';
import { POST_test } from '@/app/api/v1/brightdata/route';
import { brightDataService } from '@/lib/services/brightdata';

// Mock the brightDataService
jest.mock('@/lib/services/brightdata', () => ({
  brightDataService: {
    getAccountInfo: jest.fn(),
    checkZoneConfiguration: jest.fn(),
    getProxyDetails: jest.fn(),
    checkQuota: jest.fn(),
    testUrl: jest.fn()
  }
}));

// Mock the NextRequest
class MockNextRequest extends NextRequest {
  constructor(url: string, options: any = {}) {
    super(new URL(url, 'https://example.com'), options);
  }
}

// Mock the API context
const mockApiContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin'
  }
};

describe('Bright Data API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/brightdata', () => {
    it('should return configuration and account information', async () => {
      // Mock the brightDataService methods
      (brightDataService.getAccountInfo as jest.Mock).mockResolvedValueOnce({
        success: true,
        accountInfo: {
          zone: 'mcp_unlocker',
          status: 'active',
          quota: {
            total: 1000,
            used: 250,
            remaining: 750
          }
        }
      });

      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: true,
        zoneInfo: {
          zone: 'mcp_unlocker',
          status: 'active'
        }
      });

      (brightDataService.getProxyDetails as jest.Mock).mockReturnValueOnce({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'test-username',
        password: 'test-password',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
        curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer test-api-key" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\''
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata');

      // Call the handler
      const response = await GET(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          accountInfo: {
            zone: 'mcp_unlocker',
            status: 'active',
            quota: {
              total: 1000,
              used: 250,
              remaining: 750
            }
          },
          accountError: null,
          zoneInfo: {
            zone: 'mcp_unlocker',
            status: 'active'
          },
          zoneError: null,
          proxyDetails: {
            host: 'brd.superproxy.io',
            port: 33325,
            username: 'test-username',
            password: 'test-password',
            zoneName: 'mcp_unlocker',
            proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
            curlCommand: expect.any(String)
          }
        }
      });

      // Verify the service methods were called
      expect(brightDataService.getAccountInfo).toHaveBeenCalledTimes(1);
      expect(brightDataService.checkZoneConfiguration).toHaveBeenCalledTimes(1);
      expect(brightDataService.getProxyDetails).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.getAccountInfo as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to get account info'
      });

      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to check zone configuration'
      });

      (brightDataService.getProxyDetails as jest.Mock).mockReturnValueOnce({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'test-username',
        password: 'test-password',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
        curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer test-api-key" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\''
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata');

      // Call the handler
      const response = await GET(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          accountInfo: null,
          accountError: 'Failed to get account info',
          zoneInfo: null,
          zoneError: 'Failed to check zone configuration',
          proxyDetails: {
            host: 'brd.superproxy.io',
            port: 33325,
            username: 'test-username',
            password: 'test-password',
            zoneName: 'mcp_unlocker',
            proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
            curlCommand: expect.any(String)
          }
        }
      });
    });
  });

  describe('POST /api/v1/brightdata', () => {
    it('should check zone configuration', async () => {
      // Mock the brightDataService methods
      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: true,
        zoneInfo: {
          zone: 'mcp_unlocker',
          status: 'active'
        }
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata', {
        method: 'POST'
      });

      // Call the handler
      const response = await POST(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'Bright Data zone configuration checked successfully',
          zoneInfo: {
            zone: 'mcp_unlocker',
            status: 'active'
          }
        }
      });

      // Verify the service method was called
      expect(brightDataService.checkZoneConfiguration).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.checkZoneConfiguration as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to check zone configuration'
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata', {
        method: 'POST'
      });

      // Call the handler
      const response = await POST(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(502);
      expect(responseData).toEqual({
        success: false,
        error: {
          code: 'EXTERNAL_SERVICE_ERROR',
          message: 'Failed to check Bright Data zone configuration',
          details: {
            message: 'Failed to check zone configuration'
          }
        }
      });
    });
  });

  describe('GET /api/v1/brightdata/quota', () => {
    it('should return quota information', async () => {
      // Mock the brightDataService methods
      (brightDataService.checkQuota as jest.Mock).mockResolvedValueOnce({
        success: true,
        quota: {
          total: 1000,
          used: 250,
          remaining: 750,
          reset_date: '2023-12-31T23:59:59Z'
        }
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/quota');

      // Call the handler
      const response = await GET_quota(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          quota: {
            total: 1000,
            used: 250,
            remaining: 750,
            reset_date: '2023-12-31T23:59:59Z'
          }
        }
      });

      // Verify the service method was called
      expect(brightDataService.checkQuota).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/v1/brightdata/proxy', () => {
    it('should return proxy configuration details', async () => {
      // Mock the brightDataService methods
      (brightDataService.getProxyDetails as jest.Mock).mockReturnValueOnce({
        host: 'brd.superproxy.io',
        port: 33325,
        username: 'test-username',
        password: 'test-password',
        zoneName: 'mcp_unlocker',
        proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
        curlCommand: 'curl "https://api.brightdata.com/request" -H "Content-Type: application/json" -H "Authorization: Bearer test-api-key" -d \'{"zone":"mcp_unlocker","url":"https://www.facebook.com/marketplace/","format":{"json":true}}\''
      });

      // Create a mock request
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/proxy');

      // Call the handler
      const response = await GET_proxy(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          proxyDetails: {
            host: 'brd.superproxy.io',
            port: 33325,
            username: 'test-username',
            password: 'test-password',
            zoneName: 'mcp_unlocker',
            proxyUrl: 'http://test-username:test-password@brd.superproxy.io:33325',
            curlCommand: expect.any(String)
          }
        }
      });

      // Verify the service method was called
      expect(brightDataService.getProxyDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/brightdata/test', () => {
    it('should test a URL with Bright Data API', async () => {
      // Mock the brightDataService methods
      (brightDataService.testUrl as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          status_code: 200,
          body: '<html><body>Test HTML</body></html>'
        }
      });

      // Create a mock request with a valid URL
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://facebook.com/marketplace/item/123456789'
        })
      });

      // Add the validatedBody property to the request
      (req as any).validatedBody = {
        url: 'https://facebook.com/marketplace/item/123456789'
      };

      // Call the handler
      const response = await POST_test(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: {
          message: 'URL tested successfully with Bright Data API',
          data: {
            status_code: 200,
            body: '<html><body>Test HTML</body></html>'
          }
        }
      });

      // Verify the service method was called
      expect(brightDataService.testUrl).toHaveBeenCalledTimes(1);
      expect(brightDataService.testUrl).toHaveBeenCalledWith('https://facebook.com/marketplace/item/123456789');
    });

    it('should handle errors from the brightDataService', async () => {
      // Mock the brightDataService methods to return errors
      (brightDataService.testUrl as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to test URL with Bright Data API'
      });

      // Create a mock request with a valid URL
      const req = new MockNextRequest('https://example.com/api/v1/brightdata/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://facebook.com/marketplace/item/123456789'
        })
      });

      // Add the validatedBody property to the request
      (req as any).validatedBody = {
        url: 'https://facebook.com/marketplace/item/123456789'
      };

      // Call the handler
      const response = await POST_test(req, mockApiContext as any);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(502);
      expect(responseData).toEqual({
        success: false,
        error: {
          code: 'EXTERNAL_SERVICE_ERROR',
          message: 'Failed to test URL with Bright Data API',
          details: {
            message: 'Failed to test URL with Bright Data API'
          }
        }
      });
    });
  });
});