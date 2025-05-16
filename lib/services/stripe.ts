import { ApiException, ErrorCode } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import Stripe from 'stripe';

// Initialize Stripe with API key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const UNLOCK_PRICE_CENTS = 499; // $4.99 per unlock
const STRIPE_SUCCESS_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}` : 'http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}';
const STRIPE_CANCEL_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel` : 'http://localhost:3000/payment/cancel';

// Create Stripe instance
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest stable API version
});

/**
 * Stripe service for payment processing
 */
export const stripeService = {
  /**
   * Create a checkout session for unlocking a match
   * @param userId User ID
   * @param matchId Match ID
   * @returns Checkout session details
   */
  async createCheckoutSession(userId: string, matchId: string) {
    try {
      // Validate Stripe API key
      if (!STRIPE_SECRET_KEY) {
        throw new ApiException(
          ErrorCode.CONFIGURATION_ERROR,
          'Stripe API key is not configured',
        );
      }

      // Check if match exists and belongs to the user
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*, searches!inner(*)')
        .eq('id', matchId)
        .eq('searches.user_id', userId)
        .single();

      if (matchError || !match) {
        throw new ApiException(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Match not found or does not belong to the user',
        );
      }

      // Check if match is already unlocked by the user
      const { data: existingUnlock, error: unlockError } = await supabase
        .from('unlocks')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .maybeSingle();

      if (existingUnlock) {
        throw new ApiException(
          ErrorCode.CONFLICT,
          'Match is already unlocked by the user',
        );
      }

      // Create a checkout session with Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Unlock: ${match.title || 'Listing'}`,
                description: 'Access to seller contact information',
                images: match.image_url ? [match.image_url] : undefined,
              },
              unit_amount: UNLOCK_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: STRIPE_SUCCESS_URL,
        cancel_url: STRIPE_CANCEL_URL,
        client_reference_id: matchId,
        customer_email: match.searches?.user_email,
        metadata: {
          userId,
          matchId,
          type: 'unlock',
        },
      });

      // Create a pending payment record in the database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          match_id: matchId,
          stripe_payment_id: session.id,
          amount: UNLOCK_PRICE_CENTS / 100, // Convert cents to dollars
          currency: 'usd',
          status: 'pending',
        })
        .select()
        .single();

      if (paymentError) {
        // Attempt to expire the checkout session if the database insert fails
        await stripe.checkout.sessions.expire(session.id);

        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to create payment record',
          { details: paymentError.message }
        );
      }

      return {
        session: {
          id: session.id,
          url: session.url,
        },
        payment: payment,
        match: {
          id: match.id,
          title: match.title,
        },
      };
    } catch (error) {
      console.error('Stripe checkout session creation error:', error);

      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        ErrorCode.PAYMENT_PROCESSING_ERROR,
        'Failed to create checkout session',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },

  /**
   * Create a payment intent for unlocking a match (legacy method)
   * @param userId User ID
   * @param matchId Match ID
   * @returns Payment intent details
   * @deprecated Use createCheckoutSession instead
   */
  async createPaymentIntent(userId: string, matchId: string) {
    try {
      // Validate Stripe API key
      if (!STRIPE_SECRET_KEY) {
        throw new ApiException(
          ErrorCode.CONFIGURATION_ERROR,
          'Stripe API key is not configured',
        );
      }

      // Check if match exists and belongs to the user
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*, searches!inner(*)')
        .eq('id', matchId)
        .eq('searches.user_id', userId)
        .single();

      if (matchError || !match) {
        throw new ApiException(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Match not found or does not belong to the user',
        );
      }

      // Check if match is already unlocked by the user
      const { data: existingUnlock, error: unlockError } = await supabase
        .from('unlocks')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .maybeSingle();

      if (existingUnlock) {
        throw new ApiException(
          ErrorCode.CONFLICT,
          'Match is already unlocked by the user',
        );
      }

      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: UNLOCK_PRICE_CENTS,
        currency: 'usd',
        metadata: {
          userId,
          matchId,
          type: 'unlock',
        },
      });

      // Create a pending payment record in the database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          match_id: matchId,
          stripe_payment_id: paymentIntent.id,
          amount: UNLOCK_PRICE_CENTS / 100, // Convert cents to dollars
          currency: 'usd',
          status: 'pending',
        })
        .select()
        .single();

      if (paymentError) {
        // Attempt to cancel the payment intent if the database insert fails
        await stripe.paymentIntents.cancel(paymentIntent.id);

        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to create payment record',
          { details: paymentError.message }
        );
      }

      return {
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        payment: payment,
        match: {
          id: match.id,
          title: match.title,
        },
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);

      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        ErrorCode.PAYMENT_PROCESSING_ERROR,
        'Failed to create payment intent',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },

  /**
   * Confirm a payment and unlock a match using checkout session
   * @param userId User ID
   * @param sessionId Stripe checkout session ID
   * @returns Unlock details
   */
  async confirmCheckoutSession(userId: string, sessionId: string) {
    try {
      // Validate Stripe API key
      if (!STRIPE_SECRET_KEY) {
        throw new ApiException(
          ErrorCode.CONFIGURATION_ERROR,
          'Stripe API key is not configured',
        );
      }

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      // Verify session status
      if (session.payment_status !== 'paid') {
        throw new ApiException(
          ErrorCode.PAYMENT_VERIFICATION_FAILED,
          'Payment has not been completed',
          { status: session.payment_status }
        );
      }

      // Get match ID from session
      const matchId = session.client_reference_id || session.metadata?.matchId;

      if (!matchId) {
        throw new ApiException(
          ErrorCode.PAYMENT_VERIFICATION_FAILED,
          'Session does not contain match ID',
        );
      }

      // Verify session metadata
      if (session.metadata?.userId && session.metadata.userId !== userId) {
        throw new ApiException(
          ErrorCode.PAYMENT_VERIFICATION_FAILED,
          'Session metadata mismatch',
        );
      }

      // Update payment status in the database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('stripe_payment_id', sessionId)
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .select()
        .single();

      if (paymentError || !payment) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to update payment record',
          { details: paymentError?.message }
        );
      }

      // Create unlock record
      const { data: unlock, error: unlockError } = await supabase
        .from('unlocks')
        .insert({
          user_id: userId,
          match_id: matchId,
          payment_id: payment.id,
          unlocked_at: new Date().toISOString(),
          // Generate a suggested message based on the match details
          suggested_message: await this.generateSuggestedMessage(matchId),
        })
        .select()
        .single();

      if (unlockError) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to create unlock record',
          { details: unlockError.message }
        );
      }

      return { payment, unlock, session };
    } catch (error) {
      console.error('Checkout session confirmation error:', error);

      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        ErrorCode.PAYMENT_PROCESSING_ERROR,
        'Failed to confirm checkout session',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },

  /**
   * Confirm a payment and unlock a match using payment intent (legacy method)
   * @param userId User ID
   * @param paymentIntentId Stripe payment intent ID
   * @param matchId Match ID
   * @returns Unlock details
   * @deprecated Use confirmCheckoutSession instead
   */
  async confirmPayment(userId: string, paymentIntentId: string, matchId: string) {
    try {
      // Validate Stripe API key
      if (!STRIPE_SECRET_KEY) {
        throw new ApiException(
          ErrorCode.CONFIGURATION_ERROR,
          'Stripe API key is not configured',
        );
      }

      // Retrieve the payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Verify payment intent status
      if (paymentIntent.status !== 'succeeded') {
        throw new ApiException(
          ErrorCode.PAYMENT_VERIFICATION_FAILED,
          'Payment has not been completed',
          { status: paymentIntent.status }
        );
      }

      // Verify payment intent metadata
      if (
        paymentIntent.metadata.userId !== userId ||
        paymentIntent.metadata.matchId !== matchId
      ) {
        throw new ApiException(
          ErrorCode.PAYMENT_VERIFICATION_FAILED,
          'Payment intent metadata mismatch',
        );
      }

      // Update payment status in the database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('stripe_payment_id', paymentIntentId)
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .select()
        .single();

      if (paymentError || !payment) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to update payment record',
          { details: paymentError?.message }
        );
      }

      // Create unlock record
      const { data: unlock, error: unlockError } = await supabase
        .from('unlocks')
        .insert({
          user_id: userId,
          match_id: matchId,
          payment_id: payment.id,
          unlocked_at: new Date().toISOString(),
          // Generate a suggested message based on the match details
          suggested_message: await this.generateSuggestedMessage(matchId),
        })
        .select()
        .single();

      if (unlockError) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          'Failed to create unlock record',
          { details: unlockError.message }
        );
      }

      return { payment, unlock };
    } catch (error) {
      console.error('Payment confirmation error:', error);

      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        ErrorCode.PAYMENT_PROCESSING_ERROR,
        'Failed to confirm payment',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },

  /**
   * Generate a suggested message for contacting the seller
   * @param matchId Match ID
   * @returns Suggested message
   */
  async generateSuggestedMessage(matchId: string): Promise<string> {
    try {
      // Get match details
      const { data: match, error } = await supabase
        .from('matches')
        .select('title, price')
        .eq('id', matchId)
        .single();

      if (error || !match) {
        return "Hi! I'm interested in your listing. Is it still available?";
      }

      // Generate a personalized message based on the item
      return `Hi! I'm interested in your "${match.title}" listing${
        match.price ? ` for $${match.price}` : ''
      }. Is it still available?`;
    } catch (error) {
      console.error('Error generating suggested message:', error);
      return "Hi! I'm interested in your listing. Is it still available?";
    }
  },

  /**
   * Process a Stripe webhook event
   * @param signature Stripe signature from headers
   * @param rawBody Raw request body
   * @returns Processed event
   */
  async handleWebhookEvent(signature: string, rawBody: Buffer) {
    try {
      // Validate webhook secret
      if (!STRIPE_WEBHOOK_SECRET) {
        throw new ApiException(
          ErrorCode.CONFIGURATION_ERROR,
          'Stripe webhook secret is not configured',
        );
      }

      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        // Add more event handlers as needed
      }

      return event;
    } catch (error) {
      console.error('Stripe webhook error:', error);

      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        ErrorCode.WEBHOOK_PROCESSING_ERROR,
        'Failed to process Stripe webhook',
        { message: error instanceof Error ? error.message : String(error) }
      );
    }
  },

  /**
   * Handle payment_intent.succeeded webhook event
   * @param paymentIntent Payment intent object
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Update payment status in the database
    const { error } = await supabase
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('stripe_payment_id', paymentIntent.id);

    if (error) {
      console.error('Failed to update payment status:', error);
    }
  },

  /**
   * Handle payment_intent.payment_failed webhook event
   * @param paymentIntent Payment intent object
   */
  async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Update payment status in the database
    const { error } = await supabase
      .from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('stripe_payment_id', paymentIntent.id);

    if (error) {
      console.error('Failed to update payment status:', error);
    }
  },
};
