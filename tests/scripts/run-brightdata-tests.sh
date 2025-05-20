#!/bin/bash
# Make this script executable with: chmod +x run-brightdata-tests.sh

# Run Bright Data Integration Tests
# This script runs all the tests for the Bright Data integration

# Set environment variables for testing
export NODE_ENV=test
export BRIGHTDATA_API_KEY=9ef6d96c-2ecd-4614-a549-354bf25687ab
export BRIGHTDATA_ZONE_NAME=mcp_unlocker
export BRIGHTDATA_MCP_PRESET=fb-marketplace-scraper

# Create a directory for test reports
mkdir -p test-reports

# Run the tests
echo "Running Bright Data API Endpoint Tests..."
npx jest tests/api/brightdata-endpoints.test.ts --json --outputFile=test-reports/brightdata-endpoints.json

echo "Running Bright Data Integration Tests..."
npx jest tests/api/brightdata-integration.test.ts --json --outputFile=test-reports/brightdata-integration.json

echo "Running Bright Data Service Tests..."
npx jest tests/services/brightdata.test.ts --json --outputFile=test-reports/brightdata-service.json

echo "Running Facebook Marketplace Scraper Tests..."
npx jest tests/services/facebook-marketplace-scraper.test.ts --json --outputFile=test-reports/facebook-marketplace-scraper.json

echo "Running Proxy Configuration Tests..."
npx jest tests/services/proxy-configuration.test.ts --json --outputFile=test-reports/proxy-configuration.json

echo "Running Error Handling Tests..."
npx jest tests/services/error-handling.test.ts --json --outputFile=test-reports/error-handling.json

echo "Running Performance Tests..."
npx jest tests/services/performance.test.ts --json --outputFile=test-reports/performance.json

echo "Running HTML Parser Tests..."
npx jest tests/utils/html-parser.test.ts --json --outputFile=test-reports/html-parser.json

echo "Running Cache Tests..."
npx jest tests/utils/cache.test.ts --json --outputFile=test-reports/cache.json

echo "Running Rate Limiter Tests..."
npx jest tests/utils/rate-limiter.test.ts --json --outputFile=test-reports/rate-limiter.json

# Generate HTML report
echo "Generating HTML report..."
npx jest-html-reporter --outputPath test-reports/brightdata-test-report.html

echo "Tests completed. Reports are available in the test-reports directory."