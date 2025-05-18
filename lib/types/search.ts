/**
 * Search related type definitions
 */

// Base search interface
export interface Search {
  id: string;
  userId: string;
  query: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  radius?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Search history item
export interface SearchHistoryItem {
  id: string;
  query: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  radius?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
  createdAt: string;
  resultsCount?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Search result item
export interface SearchResult {
  id: string;
  searchId: string;
  title: string;
  price: number;
  imageUrl: string;
  description?: string;
  location?: string;
  sellerInfo?: {
    name?: string;
    rating?: string;
    joinedDate?: string;
  };
  listingUrl?: string;
  createdAt: string;
  isUnlocked?: boolean;
}

// Search job
export interface SearchJob {
  id: string;
  searchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  resultsCount?: number;
}

// Search request parameters
export interface SearchParams {
  query: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  radius?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
}

// Saved search
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  radius?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  isActive: boolean;
  notifyOnNew: boolean;
}

// Search client response
export interface SearchClientResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
  };
}