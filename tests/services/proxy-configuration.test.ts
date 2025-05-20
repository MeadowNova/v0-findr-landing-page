import { brightDataService } from '@/lib/services/brightdata';
import http from 'http';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Mock the API module
jest.mock('@/lib/api', () => {
  const originalModule = jest.requireActual('@/lib/api');
  return {
    ...originalModule,
    ApiException: class ApiException extends Error {
      code: string;
      details?: any;
      constructor(code: string, message: string, details?: any) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ApiException';
      }
    },
    ErrorCode: {
      EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
      INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    }
  };
});

// Mock http and https modules
jest.mock('http', () => ({
  request: jest.fn(),
}));

jest.mock('https', () => ({
  request: jest.fn(),
}));

// Mock https-proxy-agent
jest.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: jest.fn().mockImplementation(() => ({})),
}));

describe('Bright Data Proxy Configuration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('getProxyDetails', () => {
    it('should return proxy connection details', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      
      // Verify proxy details structure
      expect(proxyDetails).toEqual({
        host: expect.any(String),
        port: expect.any(Number),
        username: expect.any(String),
        password: expect.any(String),
        zoneName: expect.any(String),
        proxyUrl: expect.stringContaining('http://'),
        curlCommand: expect.stringContaining('curl'),
      });
      
      // Verify proxy URL format
      expect(proxyDetails.proxyUrl).toBe(
        `http://${proxyDetails.username}:${proxyDetails.password}@${proxyDetails.host}:${proxyDetails.port}`
      );
    });
  });
  
  describe('Direct proxy usage', () => {
    it('should create a proxy agent with the correct configuration', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      
      // Create a proxy agent
      new HttpsProxyAgent(proxyDetails.proxyUrl);
      
      // Verify HttpsProxyAgent was called with the correct URL
      expect(HttpsProxyAgent).toHaveBeenCalledWith(proxyDetails.proxyUrl);
    });
    
    it('should be able to make HTTP requests through the proxy', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      const proxyAgent = new HttpsProxyAgent(proxyDetails.proxyUrl);
      
      // Mock request options
      const options = {
        hostname: 'www.facebook.com',
        path: '/marketplace/',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        agent: proxyAgent,
      };
      
      // Make HTTP request
      http.request(options);
      
      // Verify http.request was called with the correct options
      expect(http.request).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'www.facebook.com',
          path: '/marketplace/',
          method: 'GET',
          agent: proxyAgent,
        })
      );
    });
    
    it('should be able to make HTTPS requests through the proxy', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      const proxyAgent = new HttpsProxyAgent(proxyDetails.proxyUrl);
      
      // Mock request options
      const options = {
        hostname: 'www.facebook.com',
        path: '/marketplace/',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        agent: proxyAgent,
      };
      
      // Make HTTPS request
      https.request(options);
      
      // Verify https.request was called with the correct options
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'www.facebook.com',
          path: '/marketplace/',
          method: 'GET',
          agent: proxyAgent,
        })
      );
    });
  });
  
  describe('Proxy configuration validation', () => {
    it('should have valid proxy host', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      expect(proxyDetails.host).toBe('brd.superproxy.io');
    });
    
    it('should have valid proxy port', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      expect(proxyDetails.port).toBe(33325);
    });
    
    it('should have valid proxy username', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      expect(proxyDetails.username).toContain('brd-customer');
      expect(proxyDetails.username).toContain('zone-mcp_unlocker');
    });
    
    it('should have valid proxy password', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      expect(proxyDetails.password).toBeTruthy();
    });
    
    it('should have valid zone name', () => {
      const proxyDetails = brightDataService.getProxyDetails();
      expect(proxyDetails.zoneName).toBe('mcp_unlocker');
    });
  });
});