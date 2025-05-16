import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withMiddleware,
  withQueryValidation,
  z
} from '@/lib/api';
import { searchService } from '@/lib/services/search';
import { supabase } from '@/lib/supabase/client';

// Get results query schema
const getResultsQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date']).optional(),
});

/**
 * GET /api/v1/searches/[searchId]/results
 * 
 * Get search results
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Get search ID from URL
    const url = new URL(req.url);
    const searchId = url.pathname.split('/').pop()?.replace('/results', '');
    
    if (!searchId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Search ID is required',
      );
    }
    
    // Validate query parameters
    const validationResult = withQueryValidation(getResultsQuerySchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { limit, offset, sortBy } = (req as any).validatedQuery;
    
    // Verify that the search belongs to the user
    const { data: search, error: searchError } = await supabase
      .from('searches')
      .select('id')
      .eq('id', searchId)
      .eq('user_id', context.user!.id)
      .single();
    
    if (searchError || !search) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Search not found',
      );
    }
    
    // Get search job status
    const { data: job, error: jobError } = await supabase
      .from('search_jobs')
      .select('status, error')
      .eq('search_id', searchId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (jobError) {
      console.error('Error getting search job status:', jobError);
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Failed to get search job status',
      );
    }
    
    // Get search results
    const { results, total } = await searchService.getSearchResults(
      searchId,
      { limit, offset, sortBy }
    );
    
    // Return search results
    return successResponse({
      results,
      jobStatus: job.status,
      jobError: job.error,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + results.length < total,
      },
    });
  },
  { requireAuth: true }
);
