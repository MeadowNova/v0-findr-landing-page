import { 
  SearchParams, 
  CreateSearchResponse, 
  GetSearchResultsResponse,
  GetSearchJobStatusResponse,
  GetSearchHistoryResponse,
  SaveSearchRequest,
  SaveSearchResponse,
  GetSavedSearchesResponse,
  RunSavedSearchResponse
} from '@/lib/types/search';

/**
 * Client-side search service for interacting with the search API
 */
export const searchClient = {
  /**
   * Create a new search
   * @param params Search parameters
   * @returns Search ID and job ID
   */
  async createSearch(params: SearchParams): Promise<{ searchId: string; jobId: string }> {
    const response = await fetch('/api/v1/searches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create search');
    }

    const data = await response.json();
    return {
      searchId: data.data.searchId,
      jobId: data.data.jobId,
    };
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
  ): Promise<GetSearchResultsResponse> {
    const { limit = 10, offset = 0, sortBy = 'relevance' } = options;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(sortBy && { sortBy }),
    });

    const response = await fetch(`/api/v1/searches/${searchId}/results?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get search results');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get search job status
   * @param jobId Job ID
   * @returns Search job status
   */
  async getSearchJobStatus(jobId: string): Promise<GetSearchJobStatusResponse> {
    const response = await fetch(`/api/v1/searches/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get search job status');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get user's search history
   * @param options Options for pagination
   * @returns Search history
   */
  async getSearchHistory(
    options: { limit?: number; offset?: number } = {}
  ): Promise<GetSearchHistoryResponse> {
    const { limit = 10, offset = 0 } = options;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`/api/v1/searches?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get search history');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Save a search for later use
   * @param request Save search request
   * @returns Saved search ID
   */
  async saveSearch(request: SaveSearchRequest): Promise<SaveSearchResponse> {
    const response = await fetch('/api/v1/searches/saved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to save search');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get user's saved searches
   * @param options Options for pagination
   * @returns Saved searches
   */
  async getSavedSearches(
    options: { limit?: number; offset?: number } = {}
  ): Promise<GetSavedSearchesResponse> {
    const { limit = 10, offset = 0 } = options;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`/api/v1/searches/saved?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get saved searches');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Delete a saved search
   * @param savedSearchId Saved search ID
   * @returns Success message
   */
  async deleteSavedSearch(savedSearchId: string): Promise<{ message: string }> {
    const response = await fetch(`/api/v1/searches/saved/${savedSearchId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete saved search');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Run a saved search
   * @param savedSearchId Saved search ID
   * @returns Job ID and search ID
   */
  async runSavedSearch(savedSearchId: string): Promise<RunSavedSearchResponse> {
    const response = await fetch(`/api/v1/searches/saved/${savedSearchId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to run saved search');
    }

    const data = await response.json();
    return data.data;
  },
};