// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the fetch API
global.fetch = jest.fn();

// Mock environment variables
process.env = {
  ...process.env,
  BRIGHTDATA_API_KEY: '9ef6d96c-2ecd-4614-a549-354bf25687ab',
  BRIGHTDATA_PROXY_HOST: 'brd.superproxy.io',
  BRIGHTDATA_PROXY_PORT: '33325',
  BRIGHTDATA_PROXY_USERNAME: 'brd-customer-hl_fo7ed603-zone-mcp_unlocker',
  BRIGHTDATA_PROXY_PASSWORD: 'c9sfk6u49o4w',
  BRIGHTDATA_ZONE_NAME: 'mcp_unlocker',
};

// Mock Next.js modules
jest.mock('next/server', () => {
  class MockNextRequest {
    url;
    method;
    headers;
    validatedBody;

    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = new Headers(options.headers || {});
      if (options.body) {
        try {
          this.validatedBody = JSON.parse(options.body);
        } catch (e) {
          this.validatedBody = options.body;
        }
      }
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data, init) => new Response(JSON.stringify(data), init),
    },
  };
});

// Mock the ApiException class
jest.mock('@/lib/api', () => {
  class MockApiException extends Error {
    code;
    details;

    constructor(code, message, details) {
      super(message);
      this.code = code;
      this.details = details;
    }
  }

  return {
    ApiException: MockApiException,
    ErrorCode: {
      EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
      INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    },
    successResponse: (data) => new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }),
    withMiddleware: (handler) => handler,
    withBodyValidation: () => null,
  };
});

// Mock Headers, Request, and Response if not available in test environment
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor() {
      return {};
    }
  };
}

if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor() {
      return {};
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
  };
}