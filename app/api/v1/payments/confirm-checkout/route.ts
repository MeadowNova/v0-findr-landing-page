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

// Confirm checkout session schema
const confirmCheckoutSessionSchema = z.object({
  sessionId: z.string().min(1, {
    message: 'Session ID is required',
  }),
});

// Confirm checkout session request type
type ConfirmCheckoutSessionRequest = z.infer<typeof confirmCheckoutSessionSchema>;

/**
 * POST /api/v1/payments/confirm-checkout
 * 
 * Confirm a Stripe checkout session and unlock a match
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(confirmCheckoutSessionSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { sessionId } = (req as any).validatedBody as ConfirmCheckoutSessionRequest;
    
    // Confirm checkout session and unlock match
    const { payment, unlock, session } = await stripeService.confirmCheckoutSession(
      context.user!.id,
      sessionId
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
