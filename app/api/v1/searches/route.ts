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
import { searchProcessorService } from '@/lib/services/search-processor';

// Create search request schema
const createSearchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query cannot exceed 100 characters'),
  location: z.string().optional(),
  radius: z.number().min(1).max(100).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date']).optional(),
});

// Get searches query schema
const getSearchesQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

// Create search request type
type CreateSearchRequest = z.infer<typeof createSearchSchema>;

/**
 * POST /api/v1/searches
 * 
 * Create a new search
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(createSearchSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const searchParams = (req as any).validatedBody as CreateSearchRequest;
    
    // Create search
    const { searchId, jobId } = await searchService.createSearch(
      context.user!.id,
      searchParams
    );
    
    // Process search job asynchronously
    // In a production environment, this would be handled by a background job processor
    // For simplicity, we'll process it directly here
    setTimeout(() => {
      searchProcessorService.processJob(jobId).catch(error => {
        console.error('Error processing search job:', error);
      });
    }, 0);
    
    // Return search ID and job ID
    return successResponse({
      searchId,
      jobId,
      message: 'Search created successfully',
    }, null, 201);
  },
  { requireAuth: true }
);

/**
 * GET /api/v1/searches
 * 
 * Get user's search history
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate query parameters
    const validationResult = withQueryValidation(getSearchesQuerySchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { limit, offset } = (req as any).validatedQuery;
    
    // Get search history
    const { searches, total } = await searchService.getSearchHistory(
      context.user!.id,
      { limit, offset }
    );
    
    // Return search history
    return successResponse({
      searches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + searches.length < total,
      },
    });
  },
  { requireAuth: true }
);
