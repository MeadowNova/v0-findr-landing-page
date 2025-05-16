/**
 * Search parameters
 */
export interface SearchParams {
  query: string;
  location?: string;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
  limit?: number;
  offset?: number;
  [key: string]: any;
}

/**
 * Search result
 */
export interface SearchResult {
  id: string;
  jobId: string;
  searchId: string;
  listingId: string;
  title: string;
  price?: number;
  currency?: string;
  location?: string;
  distance?: number;
  listingUrl: string;
  imageUrl?: string;
  description?: string;
  sellerInfo?: SellerInfo;
  relevanceScore?: number;
  createdAt: string;
}

/**
 * Seller information
 */
export interface SellerInfo {
  name?: string;
  rating?: string | number;
  joinedDate?: string;
  profileUrl?: string;
  [key: string]: any;
}

/**
 * Search job status
 */
export type SearchJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Search job
 */
export interface SearchJob {
  id: string;
  searchId: string;
  status: SearchJobStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
  resultCount?: number;
}

/**
 * Search
 */
export interface Search {
  id: string;
  userId: string;
  queryText: string;
  parameters: SearchParams;
  createdAt: string;
  updatedAt: string;
  jobs?: SearchJob[];
}

/**
 * Saved search frequency
 */
export type SavedSearchFrequency = 'daily' | 'weekly';

/**
 * Saved search
 */
export interface SavedSearch {
  id: string;
  searchId: string;
  userId: string;
  isActive: boolean;
  frequency: SavedSearchFrequency;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
  search?: Search;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Create search request
 */
export interface CreateSearchRequest {
  query: string;
  location?: string;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
}

/**
 * Create search response
 */
export interface CreateSearchResponse {
  searchId: string;
  jobId: string;
  message: string;
}

/**
 * Get search results request
 */
export interface GetSearchResultsRequest {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date';
}

/**
 * Get search results response
 */
export interface GetSearchResultsResponse {
  results: SearchResult[];
  jobStatus: SearchJobStatus;
  jobError?: string;
  pagination: PaginationMeta;
}

/**
 * Get search job status response
 */
export interface GetSearchJobStatusResponse {
  job: SearchJob;
}

/**
 * Get search history response
 */
export interface GetSearchHistoryResponse {
  searches: Search[];
  pagination: PaginationMeta;
}

/**
 * Save search request
 */
export interface SaveSearchRequest {
  searchId: string;
  frequency?: SavedSearchFrequency;
}

/**
 * Save search response
 */
export interface SaveSearchResponse {
  savedSearchId: string;
  message: string;
}

/**
 * Get saved searches response
 */
export interface GetSavedSearchesResponse {
  savedSearches: SavedSearch[];
  pagination: PaginationMeta;
}

/**
 * Delete saved search response
 */
export interface DeleteSavedSearchResponse {
  message: string;
}

/**
 * Run saved search response
 */
export interface RunSavedSearchResponse {
  jobId: string;
  searchId: string;
  message: string;
}

/**
 * Process jobs response
 */
export interface ProcessJobsResponse {
  message: string;
  processed: number;
  succeeded: number;
  failed: number;
}
