import { ApiException, ErrorCode } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import { stripeService } from './stripe';

/**
 * Payment service for managing payments and unlocks
 */
export const paymentService = {
  /**
   * Get user's payment history
   * @param userId User ID
   * @param options Query options
   * @returns Payment history
   */
  async getPaymentHistory(userId: string, options: { 
    limit?: number; 
    offset?: number;
    status?: string;
  } = {}) {
    try {
      const { limit = 20, offset = 0, status } = options;
      
      // Build query
      let query = supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          status,
          created_at,
          updated_at,
          matches (
            id,
            title,
            price,
            image_url
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      // Execute query
      const { data: payments, error, count } = await query;
      
      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to retrieve payment history',
          { details: error.message }
        );
      }
      
      // Format payments for response
      const formattedPayments = payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        match: payment.matches ? {
          id: payment.matches.id,
          title: payment.matches.title,
          price: payment.matches.price,
          imageUrl: payment.matches.image_url,
        } : null,
      }));
      
      return {
        payments: formattedPayments,
        total: count || 0,
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve payment history',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  
  /**
   * Get user's unlocked matches
   * @param userId User ID
   * @param options Query options
   * @returns Unlocked matches
   */
  async getUnlockedMatches(userId: string, options: {
    limit?: number;
    offset?: number;
    searchId?: string;
  } = {}) {
    try {
      const { limit = 20, offset = 0, searchId } = options;
      
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
        `, { count: 'exact' })
        .eq('user_id', userId)
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
      
      return {
        unlocks: formattedUnlocks,
        total: count || 0,
      };
    } catch (error) {
      console.error('Get unlocked matches error:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        'Failed to retrieve unlocked matches',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
};

// Export stripe service
export { stripeService };
