# Bright Data Integration Tests

This directory contains tests for the Bright Data integration in the SnagrAI application. The tests cover various aspects of the integration, including API endpoints, HTML parsing, caching, rate limiting, proxy configuration, error handling, and performance.

## Running the Tests

To run all the Bright Data integration tests, use the following command:

```bash
cd /home/ajk/SnagrAI/v0-findr-landing-page
chmod +x tests/scripts/run-brightdata-tests.sh
./tests/scripts/run-brightdata-tests.sh
```

This will run all the tests and generate reports in the `test-reports` directory.

## Test Categories

### API Endpoint Tests

Tests the API endpoints for the Bright Data integration, including GET and POST requests to various endpoints.

```bash
npx jest tests/api/brightdata-endpoints.test.ts
```

### Bright Data Service Tests

Tests the Bright Data service implementation, including methods for searching Facebook Marketplace, creating and testing MCP presets, and checking quota.

```bash
npx jest tests/services/brightdata.test.ts
```

### Facebook Marketplace Scraper Tests

Tests the Facebook Marketplace scraping functionality, including HTML parsing, caching, and rate limiting.

```bash
npx jest tests/services/facebook-marketplace-scraper.test.ts
```

### Proxy Configuration Tests

Tests the proxy configuration for direct API access.

```bash
npx jest tests/services/proxy-configuration.test.ts
```

### Error Handling Tests

Tests the error handling and fallback mechanisms for the Bright Data integration.

```bash
npx jest tests/services/error-handling.test.ts
```

### Performance Tests

Tests the performance and load handling capabilities of the Bright Data integration.

```bash
npx jest tests/services/performance.test.ts
```

### HTML Parser Tests

Tests the HTML parser utility for extracting data from Facebook Marketplace pages.

```bash
npx jest tests/utils/html-parser.test.ts
```

### Cache Tests

Tests the cache utility for storing and retrieving data.

```bash
npx jest tests/utils/cache.test.ts
```

### Rate Limiter Tests

Tests the rate limiter utilities for controlling request rates.

```bash
npx jest tests/utils/rate-limiter.test.ts
```

### Integration Tests

Tests the integration between the API endpoints and the Bright Data service.

```bash
npx jest tests/api/brightdata-integration.test.ts
```

## Test Reports

After running the tests, reports will be available in the `test-reports` directory. The reports include:

- Individual JSON reports for each test category
- A combined JSON report
- An HTML report

## Troubleshooting

If you encounter any issues running the tests, check the following:

1. Make sure the environment variables are set correctly:
   - `BRIGHTDATA_API_KEY`
   - `BRIGHTDATA_ZONE_NAME`
   - `BRIGHTDATA_MCP_PRESET`

2. Make sure the dependencies are installed:
   ```bash
   npm install --save-dev jest jest-merge jest-html-reporter
   ```

3. Make sure the test fixtures are available:
   - `tests/fixtures/facebook-marketplace-search.html`
   - `tests/fixtures/facebook-marketplace-item.html`

## Adding New Tests

To add new tests for the Bright Data integration, follow these guidelines:

1. Create a new test file in the appropriate directory:
   - API endpoint tests in `tests/api/`
   - Service tests in `tests/services/`
   - Utility tests in `tests/utils/`

2. Follow the existing test patterns and naming conventions.

3. Update the test script to include the new test file.

4. Update the documentation to reflect the new test category.