import { BrightDataResult } from './brightdata';
import { SearchParams, SellerInfo } from '@/lib/types/search';

/**
 * Match scoring and relevance algorithm service
 */
export const matchingService = {
  /**
   * Calculate relevance score for a listing
   * @param listing Listing data from Bright Data
   * @param searchParams Original search parameters
   * @returns Relevance score between 0 and 100
   */
  calculateRelevanceScore(listing: BrightDataResult, searchParams: SearchParams): number {
    // Initialize base score
    let score = 50;

    // Title relevance (0-30 points)
    score += this.calculateTitleRelevance(listing.title, searchParams.query);

    // Price relevance (0-20 points)
    score += this.calculatePriceRelevance(
      listing.price,
      searchParams.minPrice,
      searchParams.maxPrice
    );

    // Location/distance relevance (0-15 points)
    score += this.calculateDistanceRelevance(listing.distance, searchParams.radius);

    // Recency relevance (0-15 points)
    score += this.calculateRecencyRelevance(listing.postedAt);

    // Description relevance (0-10 points)
    score += this.calculateDescriptionRelevance(listing.description, searchParams.query);

    // Seller rating relevance (0-10 points)
    score += this.calculateSellerRelevance(listing.sellerInfo);

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  },

  /**
   * Calculate title relevance score
   * @param title Listing title
   * @param query Search query
   * @returns Score between 0 and 30
   */
  calculateTitleRelevance(title: string, query: string): number {
    if (!title || !query) return 0;

    // Normalize strings for comparison
    const normalizedTitle = title.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    // Split query into keywords
    const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 2);

    // Calculate exact match bonus
    const exactMatchBonus = normalizedTitle.includes(normalizedQuery) ? 15 : 0;

    // Calculate keyword match score
    let keywordScore = 0;
    const maxKeywordScore = 15;

    if (keywords.length > 0) {
      const matchedKeywords = keywords.filter(k => normalizedTitle.includes(k));
      keywordScore = (matchedKeywords.length / keywords.length) * maxKeywordScore;
    }

    return exactMatchBonus + keywordScore;
  },

  /**
   * Calculate price relevance score
   * @param price Listing price
   * @param minPrice Minimum price from search params
   * @param maxPrice Maximum price from search params
   * @returns Score between 0 and 20
   */
  calculatePriceRelevance(
    price: number | undefined,
    minPrice: number | undefined,
    maxPrice: number | undefined
  ): number {
    if (price === undefined) return 10; // Neutral score if no price

    // If no price range specified, give neutral score
    if (minPrice === undefined && maxPrice === undefined) return 10;

    // If only min price specified
    if (minPrice !== undefined && maxPrice === undefined) {
      if (price < minPrice) return 0; // Below minimum
      if (price <= minPrice * 1.2) return 20; // Just above minimum (good deal)
      return 15; // Above minimum
    }

    // If only max price specified
    if (minPrice === undefined && maxPrice !== undefined) {
      if (price > maxPrice) return 0; // Above maximum
      if (price >= maxPrice * 0.8) return 15; // Just below maximum
      return 20; // Well below maximum (good deal)
    }

    // Both min and max specified
    if (minPrice !== undefined && maxPrice !== undefined) {
      if (price < minPrice || price > maxPrice) return 0; // Outside range

      // Calculate where in the range the price falls (0 to 1)
      const range = maxPrice - minPrice;
      const position = (price - minPrice) / range;

      // Lower in the range is better (better deal)
      return 20 - (position * 10); // 20 points at min, 10 points at max
    }

    return 10; // Default neutral score
  },

  /**
   * Calculate distance relevance score
   * @param distance Distance in miles
   * @param radius Search radius in miles
   * @returns Score between 0 and 15
   */
  calculateDistanceRelevance(
    distance: number | undefined,
    radius: number | undefined
  ): number {
    if (distance === undefined) return 7.5; // Neutral score if no distance
    if (radius === undefined) radius = 25; // Default radius

    // Calculate score based on distance relative to radius
    // Closer is better
    if (distance <= radius * 0.2) return 15; // Very close
    if (distance <= radius * 0.5) return 12; // Close
    if (distance <= radius * 0.8) return 9; // Moderate distance
    if (distance <= radius) return 6; // Within radius but far
    return 0; // Outside radius
  },

  /**
   * Calculate recency relevance score
   * @param postedAt Posted date string
   * @returns Score between 0 and 15
   */
  calculateRecencyRelevance(postedAt: string | undefined): number {
    if (!postedAt) return 7.5; // Neutral score if no date

    const postedDate = new Date(postedAt);
    const now = new Date();
    const ageInHours = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);

    // Newer listings get higher scores
    if (ageInHours < 6) return 15; // Less than 6 hours old
    if (ageInHours < 24) return 12; // Less than 1 day old
    if (ageInHours < 72) return 9; // Less than 3 days old
    if (ageInHours < 168) return 6; // Less than 1 week old
    return 3; // More than 1 week old
  },

  /**
   * Calculate description relevance score
   * @param description Listing description
   * @param query Search query
   * @returns Score between 0 and 10
   */
  calculateDescriptionRelevance(description: string | undefined, query: string): number {
    if (!description || !query) return 5; // Neutral score if no description or query

    // Normalize strings for comparison
    const normalizedDesc = description.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    // Split query into keywords
    const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 2);

    // Calculate keyword match score
    let keywordScore = 5; // Start with neutral score

    if (keywords.length > 0) {
      const matchedKeywords = keywords.filter(k => normalizedDesc.includes(k));
      const matchRatio = matchedKeywords.length / keywords.length;

      // Adjust score based on match ratio
      if (matchRatio > 0.8) return 10; // Excellent match
      if (matchRatio > 0.6) return 8; // Good match
      if (matchRatio > 0.4) return 7; // Moderate match
      if (matchRatio > 0.2) return 6; // Some match
    }

    return keywordScore;
  },

  /**
   * Calculate seller relevance score
   * @param sellerInfo Seller information
   * @returns Score between 0 and 10
   */
  calculateSellerRelevance(sellerInfo: SellerInfo | undefined): number {
    if (!sellerInfo) return 5; // Neutral score if no seller info

    let score = 5; // Start with neutral score

    // Adjust score based on seller rating
    if (sellerInfo.rating) {
      const rating = parseFloat(sellerInfo.rating);
      if (rating >= 4.5) score += 5;
      else if (rating >= 4.0) score += 4;
      else if (rating >= 3.5) score += 3;
      else if (rating >= 3.0) score += 2;
      else if (rating >= 2.5) score += 1;
      else score -= 1; // Penalty for low rating
    }

    // Adjust score based on seller account age
    if (sellerInfo.joinedDate) {
      const joinedDate = new Date(sellerInfo.joinedDate);
      const now = new Date();
      const ageInYears = (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      if (ageInYears >= 5) score += 2;
      else if (ageInYears >= 2) score += 1;
      else if (ageInYears < 0.25) score -= 1; // Penalty for very new accounts
    }

    // Ensure score is between 0 and 10
    return Math.max(0, Math.min(10, score));
  }
};
