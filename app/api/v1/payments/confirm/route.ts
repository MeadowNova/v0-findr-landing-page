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
import { stripeService } from '@/lib/services/stripe';

// Confirm payment schema
const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, {
    message: 'Payment intent ID is required',
  }),
  matchId: z.string().uuid({
    message: 'Match ID must be a valid UUID',
  }),
});

// Confirm payment request type
type ConfirmPaymentRequest = z.infer<typeof confirmPaymentSchema>;

/**
 * POST /api/v1/payments/confirm
 * 
 * Confirm a payment and unlock a match
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(confirmPaymentSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { paymentIntentId, matchId } = (req as any).validatedBody as ConfirmPaymentRequest;
    
    // Confirm payment and unlock match
    const { payment, unlock } = await stripeService.confirmPayment(
      context.user!.id,
      paymentIntentId,
      matchId
    );
    
    // Return confirmation details
    return successResponse({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      },
      unlock: {
        id: unlock.id,
        unlockedAt: unlock.unlocked_at,
        suggestedMessage: unlock.suggested_message,
      },
      message: 'Payment confirmed and match unlocked successfully',
    });
  },
  { requireAuth: true }
);
