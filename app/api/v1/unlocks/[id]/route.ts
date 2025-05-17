import { NextRequest } from 'next/server';
import {
  ApiContext,
  ApiException,
  ErrorCode,
  successResponse,
  withMiddleware,
} from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/v1/unlocks/[id]
 *
 * Get unlock details
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext, { params }: { params: { id: string } }) => {
    // Get unlock ID from dynamic route params
    const unlockId = params.id;

    if (!unlockId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Unlock ID is required',
      );
    }

    // Get unlock details
    const { data: unlock, error } = await supabase
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
          status,
          created_at
        )
      `)
      .eq('id', unlockId)
      .eq('user_id', context.user!.id)
      .single();

    if (error || !unlock) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Unlock not found',
      );
    }

    // Format unlock for response
    const formattedUnlock = {
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
        createdAt: unlock.payments.created_at,
      } : null,
    };

    // Return unlock details
    return successResponse({
      unlock: formattedUnlock,
    });
  },
  { requireAuth: true }
);
