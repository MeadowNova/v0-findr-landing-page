# Bright Data MCP Integration Tests

This directory contains comprehensive tests for the Bright Data Mobile Carrier Proxy (MCP) integration.

## Test Structure

The tests are organized into the following directories:

- `services/`: Unit tests for the Bright Data service
- `api/`: Tests for the Bright Data API endpoints
- `integration/`: End-to-end integration tests
- `mocks/`: Mock data used in tests
- `utils/`: Test utilities and helpers

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```

To run tests in watch mode (useful during development):

```bash
npm run test:watch
```

To run a specific test file:

```bash
npm test -- tests/services/brightdata.test.ts
```

## Test Coverage

The tests cover the following aspects of the Bright Data MCP integration:

1. **Configuration Validation**
   - Environment variables validation
   - Default values handling
   - Configuration formatting

2. **API Integration**
   - Search functionality
   - Preset creation/update
   - Preset testing
   - Quota checking

3. **Error Handling**
   - API errors
   - Network errors
   - Missing configuration errors

4. **Mock Data Fallback**
   - Testing the mock search functionality
   - Verifying mock data structure

## Adding New Tests

When adding new tests, follow these guidelines:

1. Place unit tests in the appropriate directory
2. Use the mock data from `mocks/brightdata.ts` or add new mock data as needed
3. Use the test utilities from `utils/test-utils.ts` for common operations
4. Ensure all tests are independent and don't rely on external services

## Environment Variables

The tests use the following environment variables, which are mocked in `jest.setup.js`:

- `BRIGHTDATA_API_KEY`: API key for Bright Data
- `BRIGHTDATA_PROXY_HOST`: Proxy host for direct API access
- `BRIGHTDATA_PROXY_PORT`: Proxy port for direct API access
- `BRIGHTDATA_PROXY_USERNAME`: Proxy username for direct API access
- `BRIGHTDATA_PROXY_PASSWORD`: Proxy password for direct API access
- `BRIGHTDATA_ZONE_NAME`: Zone name for direct API access