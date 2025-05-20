import fs from 'fs';
import path from 'path';
import { 
  parseMarketplaceSearchResults, 
  parseMarketplaceListingDetails,
  extractListingIdFromUrl,
  extractPriceAndCurrency
} from '@/lib/utils/html-parser';

describe('HTML Parser Utilities', () => {
  // Load test fixtures
  const searchHtml = fs.readFileSync(
    path.join(process.cwd(), 'tests/fixtures/facebook-marketplace-search.html'),
    'utf-8'
  );
  
  const itemHtml = fs.readFileSync(
    path.join(process.cwd(), 'tests/fixtures/facebook-marketplace-item.html'),
    'utf-8'
  );
  
  describe('parseMarketplaceSearchResults', () => {
    it('should parse Facebook Marketplace search results HTML', () => {
      const results = parseMarketplaceSearchResults(searchHtml);
      
      // Check that we got the expected number of results
      expect(results).toHaveLength(5);
      
      // Check the first result
      expect(results[0]).toEqual(expect.objectContaining({
        listingId: '123456789',
        title: 'Vintage Mid-Century Chair',
        price: 150,
        currency: 'USD',
        location: 'Brooklyn, NY',
        listingUrl: 'https://www.facebook.com/marketplace/item/123456789/',
        imageUrl: 'https://example.com/image1.jpg'
      }));
      
      // Check the last result
      expect(results[4]).toEqual(expect.objectContaining({
        listingId: '321654987',
        title: 'Tall Bookshelf',
        price: 120,
        currency: 'USD',
        location: 'Staten Island, NY',
        listingUrl: 'https://www.facebook.com/marketplace/item/321654987/',
        imageUrl: 'https://example.com/image5.jpg'
      }));
    });
    
    it('should handle empty HTML', () => {
      const results = parseMarketplaceSearchResults('');
      expect(results).toHaveLength(0);
    });
    
    it('should handle HTML with no listings', () => {
      const results = parseMarketplaceSearchResults('<div>No results found</div>');
      expect(results).toHaveLength(0);
    });
  });
  
  describe('parseMarketplaceListingDetails', () => {
    it('should parse Facebook Marketplace listing details HTML', () => {
      const result = parseMarketplaceListingDetails(itemHtml, '123456789');
      
      expect(result).toEqual(expect.objectContaining({
        listingId: '123456789',
        title: 'Vintage Mid-Century Chair',
        price: 150,
        currency: 'USD',
        location: 'Brooklyn, NY',
        listingUrl: 'https://www.facebook.com/marketplace/item/123456789',
        imageUrl: 'https://example.com/image1.jpg',
        description: expect.stringContaining('Beautiful vintage mid-century chair'),
        category: 'Furniture',
        condition: 'Good',
        postedAt: '2 days ago',
        sellerInfo: expect.objectContaining({
          name: 'John Doe',
          rating: '★★★★☆ 4.8',
          joinedDate: 'January 2019',
          profileUrl: 'https://www.facebook.com/user/johndoe'
        })
      }));
    });
    
    it('should handle empty HTML', () => {
      const result = parseMarketplaceListingDetails('', '123456789');
      expect(result).toBeNull();
    });
  });
  
  describe('extractListingIdFromUrl', () => {
    it('should extract listing ID from full URL', () => {
      const id = extractListingIdFromUrl('https://www.facebook.com/marketplace/item/123456789/');
      expect(id).toBe('123456789');
    });
    
    it('should extract listing ID from relative URL', () => {
      const id = extractListingIdFromUrl('/marketplace/item/123456789/');
      expect(id).toBe('123456789');
    });
    
    it('should handle invalid URLs', () => {
      const id = extractListingIdFromUrl('https://www.facebook.com/profile/123');
      expect(id).toBe('');
    });
    
    it('should handle empty URLs', () => {
      const id = extractListingIdFromUrl('');
      expect(id).toBe('');
    });
  });
  
  describe('extractPriceAndCurrency', () => {
    it('should extract price and currency from USD price', () => {
      const { price, currency } = extractPriceAndCurrency('$150');
      expect(price).toBe(150);
      expect(currency).toBe('USD');
    });
    
    it('should extract price and currency from EUR price', () => {
      const { price, currency } = extractPriceAndCurrency('€120');
      expect(price).toBe(120);
      expect(currency).toBe('EUR');
    });
    
    it('should extract price and currency from GBP price', () => {
      const { price, currency } = extractPriceAndCurrency('£99.99');
      expect(price).toBe(99.99);
      expect(currency).toBe('GBP');
    });
    
    it('should handle empty price text', () => {
      const { price, currency } = extractPriceAndCurrency('');
      expect(price).toBeUndefined();
      expect(currency).toBeUndefined();
    });
    
    it('should handle price text with no numeric value', () => {
      const { price, currency } = extractPriceAndCurrency('$');
      expect(price).toBeUndefined();
      expect(currency).toBe('USD');
    });
  });
});