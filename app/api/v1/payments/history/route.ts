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

// Get payment history query schema
const getPaymentHistoryQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
});

/**
 * GET /api/v1/payments/history
 * 
 * Get user's payment history
 */
export const GET = withMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // Validate query parameters
    const validationResult = withQueryValidation(getPaymentHistoryQuerySchema)(req);
    if (validationResult) return validationResult;
    
    // Get validated data
    const { limit, offset, status } = (req as any).validatedQuery;
    
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
      `)
      .eq('user_id', context.user!.id)
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
    
    // Get total count
    const { count: total, error: countError } = await supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', context.user!.id)
      .eq('status', status || '');
    
    if (countError) {
      console.error('Error getting payment count:', countError);
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
    
    // Return payment history
    return successResponse({
      payments: formattedPayments,
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: offset + payments.length < (total || 0),
      },
    });
  },
  { requireAuth: true }
);
