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

// Create payment intent schema
const createPaymentIntentSchema = z.object({
  matchId: z.string().uuid({
    message: 'Match ID must be a valid UUID',
  }),
});

// Create payment intent request type
type CreatePaymentIntentRequest = z.infer<typeof createPaymentIntentSchema>;

/**
 * POST /api/v1/payments/create-intent
 * 
 * Create a payment intent for unlocking a match
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(createPaymentIntentSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { matchId } = (req as any).validatedBody as CreatePaymentIntentRequest;
    
    // Create payment intent
    const paymentData = await stripeService.createPaymentIntent(
      context.user!.id,
      matchId
    );
    
    // Return payment intent details
    return successResponse({
      paymentIntent: paymentData.paymentIntent,
      match: paymentData.match,
    }, null, 201);
  },
  { requireAuth: true }
);
