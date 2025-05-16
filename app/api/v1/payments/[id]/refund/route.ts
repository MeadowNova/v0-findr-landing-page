import { NextRequest } from 'next/server';
import { 
  ApiContext, 
  ApiException, 
  ErrorCode, 
  successResponse, 
  withBodyValidation, 
  withMiddleware,
  z
} from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import Stripe from 'stripe';

// Initialize Stripe with API key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Refund request schema
const refundRequestSchema = z.object({
  reason: z.string().min(1, {
    message: 'Reason is required',
  }).max(500, {
    message: 'Reason must be at most 500 characters',
  }),
});

// Refund request type
type RefundRequest = z.infer<typeof refundRequestSchema>;

/**
 * POST /api/v1/payments/[id]/refund
 * 
 * Request a refund for a payment
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Get payment ID from URL
    const url = new URL(req.url);
    const paymentId = url.pathname.split('/').slice(-2)[0];
    
    if (!paymentId) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Payment ID is required',
      );
    }
    
    // Validate request body
    const validationResult = await withBodyValidation(refundRequestSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { reason } = (req as any).validatedBody as RefundRequest;
    
    // Validate Stripe API key
    if (!STRIPE_SECRET_KEY) {
      throw new ApiException(
        ErrorCode.CONFIGURATION_ERROR,
        'Stripe API key is not configured',
      );
    }
    
    // Get payment details
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', context.user!.id)
      .single();
    
    if (error || !payment) {
      throw new ApiException(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Payment not found',
      );
    }
    
    // Check if payment is eligible for refund
    if (payment.status !== 'completed') {
      throw new ApiException(
        ErrorCode.CONFLICT,
        'Payment is not eligible for refund',
        { status: payment.status }
      );
    }
    
    try {
      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_id,
        reason: 'requested_by_customer',
      });
      
      // Update payment status in the database
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
          refund_reason: reason,
          refund_id: refund.id,
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (updateError) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to update payment status',
          { details: updateError.message }
        );
      }
      
      // Return refund details
      return successResponse({
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          refundReason: updatedPayment.refund_reason,
          refundId: updatedPayment.refund_id,
          updatedAt: updatedPayment.updated_at,
        },
        message: 'Refund processed successfully',
      });
    } catch (error) {
      console.error('Refund processing error:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      throw new ApiException(
        ErrorCode.PAYMENT_PROCESSING_ERROR,
        'Failed to process refund',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },
  { requireAuth: true }
);
