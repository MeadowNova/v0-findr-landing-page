import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ApiException, ErrorCode } from '@/lib/api';
import {
  SearchParams,
  SearchResult,
  SearchJobStatus,
  SearchJob,
  Search,
  SavedSearch,
  SavedSearchFrequency
} from '@/lib/types/search';

/**
 * Search service
 */
export const searchService = {
  /**
   * Create a new search
   * @param userId User ID
   * @param params Search parameters
   * @returns Search ID and job ID
   */
  async createSearch(userId: string, params: SearchParams): Promise<{ searchId: string; jobId: string }> {
    // Generate UUIDs for search and job
    const searchId = uuidv4();
    const jobId = uuidv4();

    // Start a transaction
    const { error } = await supabase.rpc('create_search_with_job', {
      p_search_id: searchId,
      p_job_id: jobId,
      p_user_id: userId,
      p_query_text: params.query,
      p_parameters: params
    });

    if (error) {
      console.error('Error creating search:', error);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to create search',
        { message: error.message }
      );
    }

    // Return the search ID and job ID
    return { searchId, jobId };
  },

  /**
   * Get search results
   * @param searchId Search ID
   * @param options Options for pagination and sorting
   * @returns Search results
   */
  async getSearchResults(
    searchId: string,
    options: { limit?: number; offset?: number; sortBy?: string } = {}
  ): Promise<{ results: SearchResult[]; total: number }> {
    const { limit = 10, offset = 0, sortBy = 'relevance_score' } = options;

    // Determine sort order
    let orderBy = 'relevance_score';
    let ascending = false;

    if (sortBy === 'price_asc') {
      orderBy = 'price';
      ascending = true;
    } else if (sortBy === 'price_desc') {
      orderBy = 'price';
      ascending = false;
    } else if (sortBy === 'date') {
      orderBy = 'created_at';
      ascending = false;
    }

    // Get search results
    const { data, error, count } = await supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .eq('search_id', searchId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting search results:', error);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get search results',
        { message: error.message }
      );
    }

    // Map database results to SearchResult interface
    const results = data.map(item => ({
      id: item.id,
      jobId: item.job_id,
      searchId: item.search_id,
      listingId: item.listing_id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      location: item.location,
      distance: item.distance,
      listingUrl: item.listing_url,
      imageUrl: item.image_url,
      description: item.description,
      sellerInfo: item.seller_info,
      relevanceScore: item.relevance_score,
      createdAt: item.created_at
    }));

    return { results, total: count || 0 };
  },

  /**
   * Get search job status
   * @param jobId Job ID
   * @returns Search job
   */
  async getSearchJobStatus(jobId: string): Promise<SearchJob> {
    const { data, error } = await supabase
      .from('search_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error getting search job status:', error);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get search job status',
        { message: error.message }
      );
    }

    return {
      id: data.id,
      searchId: data.search_id,
      status: data.status,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      error: data.error,
      createdAt: data.created_at
    };
  },

  /**
   * Get user's search history
   * @param userId User ID
   * @param options Options for pagination
   * @returns Search history
   */
  async getSearchHistory(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ searches: any[]; total: number }> {
    const { limit = 10, offset = 0 } = options;

    const { data, error, count } = await supabase
      .from('searches')
      .select('*, search_jobs!inner(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting search history:', error);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get search history',
        { message: error.message }
      );
    }

    return { searches: data, total: count || 0 };
  },

  /**
   * Save a search for later use
   * @param userId User ID
   * @param searchId Search ID
   * @param options Options for saved search
   * @returns Saved search ID
   */
  async saveSearch(
    userId: string,
    searchId: string,
    options: { frequency?: 'daily' | 'weekly' } = {}
  ): Promise<{ savedSearchId: string }> {
    const { frequency = 'daily' } = options;

    // Generate UUID for saved search
    const savedSearchId = uuidv4();

    // Calculate next run time (24 hours or 7 days from now)
    const now = new Date();
    const nextRunAt = frequency === 'daily'
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Insert saved search
    const { error } = await supabase
      .from('saved_searches')
      .insert({
        id: savedSearchId,
        search_id: searchId,
        user_id: userId,
        frequency,
        next_run_at: nextRunAt.toISOString()
      });

    if (error) {
      console.error('Error saving search:', error);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to save search',
        { message: error.message }
      );
    }

    return { savedSearchId };
  },

  /**
   * Get user's saved searches
   * @param userId User ID
   * @param options Options for pagination
   * @returns Saved searches
   */
  async getSavedSearches(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ savedSearches: any[]; total: number }> {
    const { limit = 10, offset = 0 } = options;

    const { data, error, count } = await supabase
      .from('saved_searches')
      .select('*, searches(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting saved searches:', error);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get saved searches',
        { message: error.message }
      );
    }

    return { savedSearches: data, total: count || 0 };
  }
};
