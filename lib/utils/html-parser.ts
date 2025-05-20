import * as cheerio from 'cheerio';
import { BrightDataResult } from '@/lib/services/brightdata';
import { SellerInfo } from '@/lib/types/search';

/**
 * Facebook Marketplace HTML Parser
 * 
 * This utility parses HTML from Facebook Marketplace pages to extract listing information.
 * It handles both search results pages and individual listing pages.
 */

/**
 * Parse Facebook Marketplace search results HTML
 * @param html HTML content from Facebook Marketplace search page
 * @returns Array of parsed listing results
 */
export function parseMarketplaceSearchResults(html: string): BrightDataResult[] {
  try {
    const $ = cheerio.load(html);
    const results: BrightDataResult[] = [];
    
    // Facebook Marketplace search results are typically in a grid layout
    // Each listing is usually in a div with a link to the item
    const listingElements = $('div[data-pagelet="MarketplaceSearch"] div[data-testid="marketplace_feed_item"]');
    
    if (listingElements.length === 0) {
      console.warn('No listing elements found in Facebook Marketplace HTML');
      return [];
    }
    
    listingElements.each((_, element) => {
      try {
        const listingElement = $(element);
        
        // Extract listing ID from the URL
        const linkElement = listingElement.find('a[href*="/marketplace/item/"]');
        const listingUrl = linkElement.attr('href');
        const listingId = extractListingIdFromUrl(listingUrl || '');
        
        if (!listingId || !listingUrl) {
          return; // Skip this listing if we can't get an ID or URL
        }
        
        // Extract title
        const titleElement = listingElement.find('span[dir="auto"]').first();
        const title = titleElement.text().trim();
        
        // Extract price
        const priceElement = listingElement.find('span:contains("$")');
        const priceText = priceElement.text().trim();
        const { price, currency } = extractPriceAndCurrency(priceText);
        
        // Extract location
        const locationElement = listingElement.find('span:contains(",")').last();
        const location = locationElement.text().trim();
        
        // Extract image URL
        const imageElement = listingElement.find('img');
        const imageUrl = imageElement.attr('src') || undefined;
        
        // Create result object
        const result: BrightDataResult = {
          listingId,
          title: title || `Facebook Marketplace Item ${listingId}`,
          price,
          currency,
          location,
          listingUrl: listingUrl.startsWith('http') ? listingUrl : `https://www.facebook.com${listingUrl}`,
          imageUrl,
        };
        
        results.push(result);
      } catch (error) {
        console.error('Error parsing individual listing:', error);
        // Continue with next listing
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error parsing Facebook Marketplace search results:', error);
    return [];
  }
}

/**
 * Parse Facebook Marketplace individual listing HTML
 * @param html HTML content from Facebook Marketplace listing page
 * @param listingId ID of the listing
 * @returns Parsed listing details or null if parsing fails
 */
export function parseMarketplaceListingDetails(html: string, listingId: string): BrightDataResult | null {
  try {
    const $ = cheerio.load(html);
    
    // Extract title
    const titleElement = $('h1[dir="auto"]').first();
    const title = titleElement.text().trim();
    
    // Extract price
    const priceElement = $('span:contains("$")').first();
    const priceText = priceElement.text().trim();
    const { price, currency } = extractPriceAndCurrency(priceText);
    
    // Extract location
    const locationElement = $('span:contains(",")').filter((_, el) => {
      const text = $(el).text();
      return text.includes(',') && !text.includes('$');
    }).first();
    const location = locationElement.text().trim();
    
    // Extract description
    const descriptionElement = $('div[dir="auto"]').filter((_, el) => {
      return $(el).text().length > 50; // Descriptions are usually longer
    }).first();
    const description = descriptionElement.text().trim();
    
    // Extract category
    const categoryElement = $('a[href*="/marketplace/category/"]');
    const category = categoryElement.text().trim();
    
    // Extract condition
    const conditionElement = $('span:contains("Condition:")').next();
    const condition = conditionElement.text().trim();
    
    // Extract image URLs
    const imageElements = $('img[src*="scontent"]');
    const imageUrl = imageElements.first().attr('src');
    
    // Extract seller info
    const sellerInfo = extractSellerInfo($);
    
    // Extract posted time
    const timeElement = $('span:contains("ago")');
    const postedAt = timeElement.text().trim();
    
    return {
      listingId,
      title: title || `Facebook Marketplace Item ${listingId}`,
      price,
      currency,
      location,
      listingUrl: `https://www.facebook.com/marketplace/item/${listingId}`,
      imageUrl,
      description,
      category,
      condition,
      sellerInfo,
      postedAt,
    };
  } catch (error) {
    console.error('Error parsing Facebook Marketplace listing details:', error);
    return null;
  }
}

/**
 * Extract seller information from the listing page
 * @param $ Cheerio instance
 * @returns Seller information
 */
function extractSellerInfo($: cheerio.CheerioAPI): SellerInfo {
  try {
    // Find seller name
    const sellerNameElement = $('a[href*="/user/"]').first();
    const name = sellerNameElement.text().trim();
    const profileUrl = sellerNameElement.attr('href');
    
    // Find seller rating
    const ratingElement = $('span:contains("★")');
    const rating = ratingElement.text().trim();
    
    // Find joined date
    const joinedElement = $('span:contains("Joined")');
    const joinedText = joinedElement.text().trim();
    const joinedDate = joinedText.replace('Joined ', '');
    
    return {
      name,
      rating,
      joinedDate,
      profileUrl: profileUrl?.startsWith('http') ? profileUrl : `https://www.facebook.com${profileUrl || ''}`,
    };
  } catch (error) {
    console.error('Error extracting seller info:', error);
    return {};
  }
}

/**
 * Extract listing ID from Facebook Marketplace URL
 * @param url Facebook Marketplace listing URL
 * @returns Listing ID or empty string if not found
 */
export function extractListingIdFromUrl(url: string): string {
  try {
    // Handle different URL formats
    // Format 1: https://www.facebook.com/marketplace/item/123456789/
    // Format 2: /marketplace/item/123456789/
    const regex = /\/marketplace\/item\/(\d+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting listing ID from URL:', error);
    return '';
  }
}

/**
 * Extract price and currency from price text
 * @param priceText Price text (e.g., "$100" or "€50")
 * @returns Object with price and currency
 */
export function extractPriceAndCurrency(priceText: string): { price?: number; currency?: string } {
  try {
    if (!priceText) {
      return {};
    }
    
    // Extract currency symbol
    const currencySymbol = priceText.match(/[^\d.,]/)?.[0];
    const currency = currencySymbolToCode(currencySymbol || '$');
    
    // Extract numeric price
    const numericPrice = priceText.replace(/[^\d.]/g, '');
    const price = parseFloat(numericPrice);
    
    if (isNaN(price)) {
      return { currency };
    }
    
    return { price, currency };
  } catch (error) {
    console.error('Error extracting price and currency:', error);
    return {};
  }
}

/**
 * Convert currency symbol to ISO currency code
 * @param symbol Currency symbol
 * @returns ISO currency code
 */
function currencySymbolToCode(symbol: string): string {
  const symbolMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    '₽': 'RUB',
    '₩': 'KRW',
    'C$': 'CAD',
    'A$': 'AUD',
  };
  
  return symbolMap[symbol] || 'USD';
}