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
import { supabase } from '@/lib/supabase/client';

// Get unlocks query schema
const getUnlocksQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  searchId: z.string().uuid().optional(),
});

/**
 * GET /api/v1/unlocks
 * 
 * Get user's unlocked matches
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate query parameters
    const validationResult = withQueryValidation(getUnlocksQuerySchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { limit, offset, searchId } = (req as any).validatedQuery;
    
    // Build query
    let query = supabase
      .from('unlocks')
      .select(`
        id,
        unlocked_at,
        suggested_message,
        matches (
          id,
          title,
          price,
          image_url,
          description,
          location,
          seller_info,
          listing_url,
          search_id,
          searches (
            id,
            query_text
          )
        ),
        payments (
          id,
          amount,
          currency,
          status
        )
      `)
      .eq('user_id', context.user!.id)
      .order('unlocked_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add search filter if provided
    if (searchId) {
      query = query.eq('matches.search_id', searchId);
    }
    
    // Execute query
    const { data: unlocks, error, count } = await query;
    
    if (error) {
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve unlocked matches',
        { details: error.message }
      );
    }
    
    // Get total count
    const { count: total, error: countError } = await supabase
      .from('unlocks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', context.user!.id);
    
    if (countError) {
      console.error('Error getting unlocks count:', countError);
    }
    
    // Format unlocks for response
    const formattedUnlocks = unlocks.map(unlock => ({
      id: unlock.id,
      unlockedAt: unlock.unlocked_at,
      suggestedMessage: unlock.suggested_message,
      match: unlock.matches ? {
        id: unlock.matches.id,
        title: unlock.matches.title,
        price: unlock.matches.price,
        imageUrl: unlock.matches.image_url,
        description: unlock.matches.description,
        location: unlock.matches.location,
        sellerInfo: unlock.matches.seller_info,
        listingUrl: unlock.matches.listing_url,
        search: unlock.matches.searches ? {
          id: unlock.matches.searches.id,
          queryText: unlock.matches.searches.query_text,
        } : null,
      } : null,
      payment: unlock.payments ? {
        id: unlock.payments.id,
        amount: unlock.payments.amount,
        currency: unlock.payments.currency,
        status: unlock.payments.status,
      } : null,
    }));
    
    // Return unlocked matches
    return successResponse({
      unlocks: formattedUnlocks,
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: offset + unlocks.length < (total || 0),
      },
    });
  },
  { requireAuth: true }
);
