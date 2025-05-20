/**
 * Test script for Bright Data integration
 * 
 * This script tests the Bright Data integration with various Facebook Marketplace search queries
 * and verifies data quality and completeness.
 * 
 * Usage:
 * node tests/scripts/test-brightdata-integration.js
 */

// Load environment variables
require('dotenv').config();

// Import the Bright Data service
const { brightDataService } = require('../../lib/services/brightdata');

// Test parameters
const TEST_QUERIES = [
  { query: 'vintage chair', location: 'New York, NY', category: 'Furniture' },
  { query: 'macbook pro', location: 'San Francisco, CA', category: 'Electronics' },
  { query: 'nike shoes', location: 'Los Angeles, CA', category: 'Clothing' },
  { query: 'toyota camry', location: 'Chicago, IL', category: 'Vehicles' }
];

// Test function
async function testBrightDataIntegration() {
  console.log('Starting Bright Data integration test...');
  
  // Test zone configuration
  console.log('\nTesting zone configuration...');
  const zoneResult = await brightDataService.checkZoneConfiguration();
  console.log('Zone configuration test result:', zoneResult.success ? 'SUCCESS' : 'FAILED');
  if (!zoneResult.success) {
    console.error('Zone configuration error:', zoneResult.error);
    return;
  }
  
  // Test account info
  console.log('\nTesting account info...');
  const accountResult = await brightDataService.getAccountInfo();
  console.log('Account info test result:', accountResult.success ? 'SUCCESS' : 'FAILED');
  if (!accountResult.success) {
    console.error('Account info error:', accountResult.error);
  }
  
  // Test proxy details
  console.log('\nTesting proxy details...');
  const proxyDetails = brightDataService.getProxyDetails();
  console.log('Proxy URL:', proxyDetails.proxyUrl);
  
  // Test search queries
  console.log('\nTesting search queries...');
  for (const params of TEST_QUERIES) {
    console.log(`\nTesting search query: ${params.query} in ${params.location}`);
    try {
      const startTime = Date.now();
      const results = await brightDataService.searchFacebookMarketplace(params);
      const duration = Date.now() - startTime;
      
      console.log(`Search completed in ${duration}ms`);
      console.log(`Found ${results.length} results`);
      
      if (results.length > 0) {
        console.log('Sample result:');
        console.log(`- Title: ${results[0].title}`);
        console.log(`- Price: ${results[0].price} ${results[0].currency}`);
        console.log(`- Location: ${results[0].location}`);
        console.log(`- URL: ${results[0].listingUrl}`);
        
        // Verify data quality
        const dataQuality = verifyDataQuality(results);
        console.log('Data quality score:', `${dataQuality.score}%`);
        if (dataQuality.issues.length > 0) {
          console.log('Data quality issues:');
          dataQuality.issues.forEach(issue => console.log(`- ${issue}`));
        }
      } else {
        console.log('No results found');
      }
    } catch (error) {
      console.error(`Error searching for ${params.query}:`, error.message);
    }
  }
  
  // Test caching
  console.log('\nTesting caching...');
  const cacheParams = TEST_QUERIES[0];
  
  console.log(`First request for ${cacheParams.query}...`);
  const startTime1 = Date.now();
  await brightDataService.searchFacebookMarketplace(cacheParams);
  const duration1 = Date.now() - startTime1;
  console.log(`First request completed in ${duration1}ms`);
  
  console.log(`Second request for ${cacheParams.query} (should use cache)...`);
  const startTime2 = Date.now();
  await brightDataService.searchFacebookMarketplace(cacheParams);
  const duration2 = Date.now() - startTime2;
  console.log(`Second request completed in ${duration2}ms`);
  console.log(`Cache performance improvement: ${Math.round((duration1 - duration2) / duration1 * 100)}%`);
  
  console.log('\nBright Data integration test completed');
}

// Verify data quality
function verifyDataQuality(results) {
  const issues = [];
  let score = 100;
  
  // Check for missing titles
  const missingTitles = results.filter(r => !r.title).length;
  if (missingTitles > 0) {
    issues.push(`${missingTitles} results missing title`);
    score -= 10;
  }
  
  // Check for missing prices
  const missingPrices = results.filter(r => !r.price).length;
  if (missingPrices > 0) {
    issues.push(`${missingPrices} results missing price`);
    score -= 5;
  }
  
  // Check for missing locations
  const missingLocations = results.filter(r => !r.location).length;
  if (missingLocations > 0) {
    issues.push(`${missingLocations} results missing location`);
    score -= 5;
  }
  
  // Check for missing listing URLs
  const missingUrls = results.filter(r => !r.listingUrl).length;
  if (missingUrls > 0) {
    issues.push(`${missingUrls} results missing listing URL`);
    score -= 15;
  }
  
  // Check for missing image URLs
  const missingImages = results.filter(r => !r.imageUrl).length;
  if (missingImages > 0) {
    issues.push(`${missingImages} results missing image URL`);
    score -= 5;
  }
  
  return {
    score: Math.max(0, score),
    issues
  };
}

// Run the test
testBrightDataIntegration().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});