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
 * GET /api/v1/payments/[id]
 * 
 * Get payment details
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Get payment ID from URL
    const url = new URL(req.url);
    const paymentId = url.pathname.split('/').pop();
    
    if (!paymentId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Payment ID is required',
      );
    }
    
    // Get payment details
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        id,
        stripe_payment_id,
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
        ),
        unlocks (
          id,
          unlocked_at,
          suggested_message
        )
      `)
      .eq('id', paymentId)
      .eq('user_id', context.user!.id)
      .single();
    
    if (error || !payment) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Payment not found',
      );
    }
    
    // Format payment for response
    const formattedPayment = {
      id: payment.id,
      stripePaymentId: payment.stripe_payment_id,
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
      unlock: payment.unlocks && payment.unlocks.length > 0 ? {
        id: payment.unlocks[0].id,
        unlockedAt: payment.unlocks[0].unlocked_at,
        suggestedMessage: payment.unlocks[0].suggested_message,
      } : null,
    };
    
    // Return payment details
    return successResponse({
      payment: formattedPayment,
    });
  },
  { requireAuth: true }
);
