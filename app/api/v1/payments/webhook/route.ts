import { NextRequest, NextResponse } from 'next/server';
import {
  ApiException,
  ErrorCode,
  successResponse,
  errorResponse
} from '@/lib/api';
import { stripeService } from '@/lib/services/stripe';
import { supabase } from '@/lib/supabase/client';
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
    // Get match ID and user ID from session
    const matchId = session.client_reference_id || session.metadata?.matchId;
    const userId = session.metadata?.userId;

    if (!matchId || !userId) {
      console.error('Missing match ID or user ID in session metadata');
      return;
    }

    // Update payment status in the database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('stripe_payment_id', session.id)
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Failed to update payment record:', paymentError);
      return;
    }

    // Check if unlock already exists
    const { data: existingUnlock } = await supabase
      .from('unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .maybeSingle();

    if (existingUnlock) {
      console.log('Unlock already exists for this match and user');
      return;
    }

    // Generate suggested message
    const { data: match } = await supabase
      .from('matches')
      .select('title, price')
      .eq('id', matchId)
      .single();

    let suggestedMessage = "Hi! I'm interested in your listing. Is it still available?";

    if (match) {
      suggestedMessage = `Hi! I'm interested in your "${match.title}" listing${
        match.price ? ` for $${match.price}` : ''
      }. Is it still available?`;
    }

    // Create unlock record
    const { data: unlock, error: unlockError } = await supabase
      .from('unlocks')
      .insert({
        user_id: userId,
        match_id: matchId,
        payment_id: payment.id,
        unlocked_at: new Date().toISOString(),
        suggested_message: suggestedMessage,
      })
      .select()
      .single();

    if (unlockError) {
      console.error('Failed to create unlock record:', unlockError);
      return;
    }

    console.log('Successfully processed checkout.session.completed event');
  } catch (error) {
    console.error('Error handling checkout.session.completed event:', error);
  }
}

/**
 * POST /api/v1/payments/webhook
 *
 * Handle Stripe webhook events
 * This endpoint does not use the middleware to avoid authentication checks
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get Stripe signature from headers
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        'Stripe signature is missing',
      );
    }

    // Get raw body as buffer
    const rawBody = await streamToBuffer(req.body!);

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new ApiException(
        ErrorCode.WEBHOOK_PROCESSING_ERROR,
        'Webhook signature verification failed',
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await stripeService.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await stripeService.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      // Add more event handlers as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    return successResponse({
      received: true,
      type: event.type,
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return errorResponse(error instanceof Error ? error : new Error(String(error)));
  }
}
