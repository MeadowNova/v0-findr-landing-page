import { NextRequest, NextResponse } from 'next/server';
import {
  ApiException,
  ErrorCode,
  successResponse,
  errorResponse
} from '@/lib/api';
import { stripeService } from '@/lib/services/stripe';
import { supabaseServer } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { Readable } from 'stream';

// Initialize Stripe with API key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Create Stripe instance
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Convert ReadableStream to Buffer
 * @param readableStream ReadableStream
 * @returns Buffer
 */
async function streamToBuffer(readableStream: ReadableStream): Promise<Buffer> {
  const reader = readableStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/**
 * Handle checkout.session.completed event
 * @param session Checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Processing checkout.session.completed event for session ${session.id}`);
    
    // Get match ID and user ID from session
    const matchId = session.client_reference_id || session.metadata?.matchId;
    const userId = session.metadata?.userId;

    // For test events, use test values if real ones are not provided
    const isTestEvent = session.id.startsWith('cs_test_');
    const testUserId = '00000000-0000-4000-a000-000000000000';
    const testMatchId = '00000000-0000-4000-b000-000000000000';
    
    const effectiveUserId = userId || (isTestEvent ? testUserId : null);
    const effectiveMatchId = matchId || (isTestEvent ? testMatchId : null);

    if (!effectiveMatchId || !effectiveUserId) {
      console.error('Missing match ID or user ID in session metadata', {
        sessionId: session.id,
        clientReferenceId: session.client_reference_id,
        metadata: session.metadata,
        isTestEvent,
      });
      return { success: false, error: 'Missing match ID or user ID in session metadata' };
    }
    
    console.log(`Processing payment for user ${effectiveUserId} and match ${effectiveMatchId}`, {
      isTestEvent,
      originalUserId: userId,
      originalMatchId: matchId,
    });

    // Update payment status in the database
    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('stripe_payment_id', session.id)
      .eq('user_id', effectiveUserId)
      .eq('match_id', effectiveMatchId)
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to update payment record:', {
        error: paymentError,
        sessionId: session.id,
        userId: effectiveUserId,
        matchId: effectiveMatchId,
      });
      return { success: false, error: 'Failed to update payment record', details: paymentError };
    }

    let paymentRecord = payment;
    if (!paymentRecord) {
      console.error('Payment record not found:', {
        sessionId: session.id,
        userId: effectiveUserId,
        matchId: effectiveMatchId,
      });
      
      // Try to find the payment record without user_id and match_id constraints
      const { data: paymentBySessionId } = await supabaseServer
        .from('payments')
        .select('*')
        .eq('stripe_payment_id', session.id)
        .maybeSingle();
      
      if (paymentBySessionId) {
        console.log('Found payment record by session ID only:', paymentBySessionId);
        // Update the payment record with the correct user_id and match_id
        const { data: updatedPayment, error: updateError } = await supabaseServer
          .from('payments')
          .update({
            user_id: effectiveUserId,
            match_id: effectiveMatchId,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentBySessionId.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('Failed to update existing payment record:', updateError);
          return { success: false, error: 'Failed to update existing payment record', details: updateError };
        }
        
        // Use the updated payment for the rest of the process
        paymentRecord = updatedPayment;
      } else {
        // Create a new payment record if none exists
        console.log('Creating new payment record for session:', session.id);
        
        // For test events, we need to ensure the match exists
        if (isTestEvent) {
          console.log('Test event detected, ensuring match exists...');
          
          // Check if the match exists
          const { data: existingMatch } = await supabaseServer
            .from('matches')
            .select('id')
            .eq('id', effectiveMatchId)
            .maybeSingle();
          
          if (!existingMatch) {
            console.log('Creating test match for test event...');
            
            // Create a test search first
            const { data: search, error: searchError } = await supabaseServer
              .from('searches')
              .insert({
                user_id: effectiveUserId,
                query: 'Test search query',
                location: 'Test location',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();
            
            if (searchError) {
              console.error('Failed to create test search:', searchError);
              // Continue anyway - we'll try to create the payment
            } else {
              // Create a test match
              const { error: matchError } = await supabaseServer
                .from('matches')
                .insert({
                  id: effectiveMatchId,
                  search_id: search.id,
                  title: 'Test match title',
                  price: 99.99,
                  url: 'https://example.com/test-match',
                  image_url: 'https://example.com/test-match.jpg',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select();
              
              if (matchError) {
                console.error('Failed to create test match:', matchError);
                // Continue anyway - we'll try to create the payment
              }
            }
          }
        }
        
        const { data: newPayment, error: insertError } = await supabaseServer
          .from('payments')
          .insert({
            user_id: effectiveUserId,
            match_id: effectiveMatchId,
            stripe_payment_id: session.id,
            amount: (session.amount_total || 0) / 100, // Convert cents to dollars
            currency: session.currency || 'usd',
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (insertError || !newPayment) {
          console.error('Failed to create new payment record:', insertError);
          return { success: false, error: 'Failed to create new payment record', details: insertError };
        }
        
        // Use the new payment for the rest of the process
        paymentRecord = newPayment;
      }
    }

    console.log(`Payment record updated successfully:`, { paymentId: paymentRecord.id });

    // Check if unlock already exists
    const { data: existingUnlock, error: unlockCheckError } = await supabaseServer
      .from('unlocks')
      .select('id')
      .eq('user_id', effectiveUserId)
      .eq('match_id', effectiveMatchId)
      .maybeSingle();

    if (unlockCheckError) {
      console.error('Error checking for existing unlock:', unlockCheckError);
      // Continue with the process, as this is not a critical error
    }

    if (existingUnlock) {
      console.log('Unlock already exists for this match and user', {
        unlockId: existingUnlock.id,
        userId: effectiveUserId,
        matchId: effectiveMatchId,
      });
      return { success: true, message: 'Unlock already exists', unlockId: existingUnlock.id };
    }

    // Generate suggested message
    let suggestedMessage = "Hi! I'm interested in your listing. Is it still available?";
    try {
      const { data: match, error: matchError } = await supabaseServer
        .from('matches')
        .select('title, price')
        .eq('id', effectiveMatchId)
        .single();

      if (matchError) {
        console.error('Error fetching match details:', matchError);
        // Continue with default message
      } else if (match) {
        suggestedMessage = `Hi! I'm interested in your "${match.title}" listing${
          match.price ? ` for ${match.price}` : ''
        }. Is it still available?`;
        console.log('Generated suggested message for match', { matchId: effectiveMatchId, title: match.title });
      }
    } catch (matchError) {
      console.error('Exception fetching match details:', matchError);
      // Continue with default message
    }

    // Create unlock record
    const { data: unlock, error: unlockError } = await supabaseServer
      .from('unlocks')
      .insert({
        user_id: effectiveUserId,
        match_id: effectiveMatchId,
        payment_id: paymentRecord.id,
        unlocked_at: new Date().toISOString(),
        suggested_message: suggestedMessage,
      })
      .select()
      .single();

    if (unlockError) {
      console.error('Failed to create unlock record:', {
        error: unlockError,
        userId: effectiveUserId,
        matchId: effectiveMatchId,
        paymentId: paymentRecord.id,
      });
      return { success: false, error: 'Failed to create unlock record', details: unlockError };
    }

    console.log('Successfully processed checkout.session.completed event', {
      sessionId: session.id,
      paymentId: paymentRecord.id,
      unlockId: unlock.id,
    });
    
    return { success: true, paymentId: paymentRecord.id, unlockId: unlock.id };
  } catch (error) {
    console.error('Error handling checkout.session.completed event:', error);
    return { success: false, error: 'Unexpected error processing checkout session', details: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * POST /api/v1/payments/webhook
 *
 * Handle Stripe webhook events
 * This endpoint does not use the middleware to avoid authentication checks
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('Received Stripe webhook request');
  
  try {
    // Get Stripe signature from headers
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Stripe signature is missing in request headers');
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Stripe signature is missing',
      );
    }

    // Log webhook secret (first few characters for debugging)
    if (STRIPE_WEBHOOK_SECRET) {
      console.log(`Using webhook secret: ${STRIPE_WEBHOOK_SECRET.substring(0, 5)}...`);
    } else {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      throw new ApiException(
        ErrorCode.CONFIGURATION_ERROR,
        'Stripe webhook secret is not configured',
      );
    }

    // Get raw body as buffer
    const rawBody = await streamToBuffer(req.body!);
    console.log(`Request body size: ${rawBody.length} bytes`);

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      console.log(`Successfully verified webhook signature for event: ${event.id}`);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new ApiException(
        ErrorCode.WEBHOOK_PROCESSING_ERROR,
        'Webhook signature verification failed',
        { details: err instanceof Error ? err.message : String(err) }
      );
    }

    console.log(`Processing Stripe event: ${event.type} (${event.id})`);

    // Handle different event types
    let result;
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event');
        result = await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        console.log('Checkout session completed result:', result);
        break;
      case 'payment_intent.succeeded':
        console.log('Processing payment_intent.succeeded event');
        await stripeService.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        console.log('Processing payment_intent.payment_failed event');
        await stripeService.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    console.log(`Successfully processed Stripe event: ${event.type} (${event.id})`);
    return successResponse({
      received: true,
      type: event.type,
      id: event.id,
      result
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    // Log detailed error information
    if (error instanceof ApiException) {
      console.error('API Exception:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
    } else if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return errorResponse(error instanceof Error ? error : new Error(String(error)));
  }
}
