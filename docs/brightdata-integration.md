# Bright Data Integration Documentation

This document provides comprehensive information about the Bright Data integration for Facebook Marketplace scraping in the SnagrAI application.

## Overview

The Bright Data integration allows SnagrAI to scrape Facebook Marketplace listings using Bright Data's Managed Collection Platform (MCP). This integration provides reliable access to Facebook Marketplace data while handling rate limiting, proxy rotation, and other challenges associated with web scraping.

## Configuration

### Environment Variables

The following environment variables are used for the Bright Data integration:

```
BRIGHTDATA_API_KEY=your-api-key
BRIGHTDATA_PROXY_HOST=brd.superproxy.io
BRIGHTDATA_PROXY_PORT=33325
BRIGHTDATA_PROXY_USERNAME=your-proxy-username
BRIGHTDATA_PROXY_PASSWORD=your-proxy-password
BRIGHTDATA_ZONE_NAME=your-zone-name
BRIGHTDATA_MCP_PRESET=fb-marketplace-scraper
```

### MCP Preset Configuration

The Facebook Marketplace MCP preset is configured with the following settings:

- **Target URLs**: Facebook Marketplace URLs (marketplace/*, marketplace/item/*, etc.)
- **Request Headers**: Appropriate user-agent and accept headers
- **Cookies Handling**: Enabled with session persistence
- **Rate Limiting**: 10 requests per minute, 5 concurrent requests max
- **Proxy Rotation**: Rotate after 5 requests, US-based proxies
- **Geolocation**: US-based (California)
- **JavaScript Rendering**: Enabled with 30-second timeout
- **Extraction Settings**: Configured to extract listing details (title, price, etc.)

## Usage

### Basic Usage

```javascript
import { brightDataService } from '@/lib/services/brightdata';

// Search Facebook Marketplace
const results = await brightDataService.searchFacebookMarketplace({
  query: 'vintage chair',
  location: 'New York, NY',
  minPrice: 50,
  maxPrice: 500,
  category: 'Furniture',
  limit: 10
});

// Test a specific URL
const testResult = await brightDataService.testUrl('https://www.facebook.com/marketplace/item/123456789/');

// Check zone configuration
const zoneResult = await brightDataService.checkZoneConfiguration();

// Get account information
const accountInfo = await brightDataService.getAccountInfo();

// Get proxy details
const proxyDetails = brightDataService.getProxyDetails();
```

### API Endpoints

The following API endpoints are available for the Bright Data integration:

- `GET /api/v1/brightdata`: Get Bright Data configuration and account information
- `POST /api/v1/brightdata`: Check Bright Data zone configuration
- `POST /api/v1/brightdata/test`: Test Bright Data API with a sample URL
- `GET /api/v1/brightdata/quota`: Check Bright Data MCP quota
- `GET /api/v1/brightdata/proxy`: Get Bright Data proxy configuration details

## Features

### HTML Parsing

The integration includes a robust HTML parser for Facebook Marketplace listings using Cheerio. The parser extracts the following information:

- Listing ID
- Title
- Price and currency
- Location
- Description
- Seller information
- Posted date
- Image URLs
- Category
- Condition

### Caching

A caching mechanism is implemented to reduce API calls and improve performance:

- In-memory cache with TTL (Time-To-Live) support
- Default TTL: 5 minutes
- Maximum cache size: 100 items
- Cache invalidation based on TTL
- Cache key generation based on search parameters

### Rate Limiting

Two rate limiting strategies are implemented:

1. **Token Bucket Rate Limiter**:
   - Capacity: 10 tokens
   - Refill rate: 10 tokens per minute

2. **Sliding Window Rate Limiter**:
   - Maximum requests: 10 per minute
   - Window size: 60 seconds

### Error Handling

Comprehensive error handling is implemented:

- Retry logic with exponential backoff
- Specific error types for different failure scenarios
- Fallback to mock data when parsing fails
- Detailed error logging

## Troubleshooting

### Common Issues

1. **API Key Invalid or Expired**:
   - Check that the `BRIGHTDATA_API_KEY` environment variable is set correctly
   - Verify the API key is valid in the Bright Data dashboard
   - Generate a new API key if necessary

2. **Rate Limiting Errors**:
   - Reduce the number of concurrent requests
   - Implement additional delay between requests
   - Check the rate limiting settings in the MCP preset

3. **Parsing Errors**:
   - Check if Facebook Marketplace has changed its HTML structure
   - Update the HTML parser selectors
   - Test with sample HTML from Facebook Marketplace

4. **Proxy Connection Issues**:
   - Verify the proxy credentials are correct
   - Check if the proxy is accessible from your network
   - Test the proxy connection using the curl command provided by `getProxyDetails()`

### Monitoring

Monitor the following metrics to ensure the integration is working correctly:

- API usage and quota
- Cache hit rate
- Error rate
- Response time
- Data quality (completeness of parsed results)

## Cost Optimization

To optimize costs when using Bright Data:

1. **Maximize Cache Usage**:
   - Increase cache TTL for less time-sensitive data
   - Implement browser-side caching for repeated user queries

2. **Optimize API Calls**:
   - Batch requests when possible
   - Implement pagination to retrieve only necessary results
   - Use the mock search for development and testing

3. **Monitor Usage**:
   - Track API usage against quota limits
   - Set up alerts for approaching quota limits
   - Analyze usage patterns to identify optimization opportunities

## Security Considerations

1. **API Key Protection**:
   - Store the API key securely in environment variables
   - Never expose the API key in client-side code
   - Rotate the API key periodically

2. **Proxy Credentials**:
   - Protect proxy credentials in environment variables
   - Use secure connections when accessing the proxy
   - Limit proxy access to authorized services

3. **Data Handling**:
   - Handle scraped data according to privacy regulations
   - Do not store personally identifiable information (PII)
   - Implement appropriate data retention policies