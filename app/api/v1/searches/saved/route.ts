import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withBodyValidation, 
  withMiddleware,
  withQueryValidation,
  z
} from '@/lib/api';
import { searchService } from '@/lib/services/search';
import { supabase } from '@/lib/supabase/client';

// Save search request schema
const saveSearchSchema = z.object({
  searchId: z.string().uuid('Invalid search ID'),
  frequency: z.enum(['daily', 'weekly']).optional(),
});

// Get saved searches query schema
const getSavedSearchesQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

// Save search request type
type SaveSearchRequest = z.infer<typeof saveSearchSchema>;

/**
 * POST /api/v1/searches/saved
 * 
 * Save a search for later use
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(saveSearchSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { searchId, frequency } = (req as any).validatedBody as SaveSearchRequest;
    
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
    
    // Check if search is already saved
    const { data: existingSavedSearch, error: existingError } = await supabase
      .from('saved_searches')
      .select('id')
      .eq('search_id', searchId)
      .eq('user_id', context.user!.id)
      .single();
    
    if (existingSavedSearch) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Search is already saved',
      );
    }
    
    // Save search
    const { savedSearchId } = await searchService.saveSearch(
      context.user!.id,
      searchId,
      { frequency }
    );
    
    // Return saved search ID
    return successResponse({
      savedSearchId,
      message: 'Search saved successfully',
    }, null, 201);
  },
  { requireAuth: true }
);

/**
 * GET /api/v1/searches/saved
 * 
 * Get user's saved searches
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate query parameters
    const validationResult = withQueryValidation(getSavedSearchesQuerySchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { limit, offset } = (req as any).validatedQuery;
    
    // Get saved searches
    const { savedSearches, total } = await searchService.getSavedSearches(
      context.user!.id,
      { limit, offset }
    );
    
    // Return saved searches
    return successResponse({
      savedSearches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + savedSearches.length < total,
      },
    });
  },
  { requireAuth: true }
);
