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

// Create checkout session schema
const createCheckoutSessionSchema = z.object({
  matchId: z.string().uuid({
    message: 'Match ID must be a valid UUID',
  }),
});

// Create checkout session request type
type CreateCheckoutSessionRequest = z.infer<typeof createCheckoutSessionSchema>;

/**
 * POST /api/v1/payments/create-checkout
 * 
 * Create a Stripe checkout session for unlocking a match
 */
export const POST = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate request body
    const validationResult = await withBodyValidation(createCheckoutSessionSchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { matchId } = (req as any).validatedBody as CreateCheckoutSessionRequest;
    
    // Create checkout session
    const sessionData = await stripeService.createCheckoutSession(
      context.user!.id,
      matchId
    );
    
    // Return checkout session details
    return successResponse({
      session: sessionData.session,
      match: sessionData.match,
    }, null, 201);
  },
  { requireAuth: true }
);
