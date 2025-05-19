# Stripe Webhook Testing Guide

This guide explains how to test Stripe webhooks locally during development and how to set up webhooks for production.

## Prerequisites

- [Stripe CLI](https://stripe.com/docs/stripe-cli) installed
- Stripe account with API keys configured in `.env`
- Next.js development server running

## Environment Variables

Ensure these environment variables are set in your `.env` file:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing Webhooks Locally

### Method 1: Using Stripe CLI (Recommended)

The Stripe CLI is the recommended way to test webhooks locally. It creates a secure connection between Stripe and your local server.

1. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

2. **Start webhook forwarding**:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/v1/payments/webhook
   ```
   This command will output a webhook signing secret. Copy this secret and update your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Trigger test events**:
   In a new terminal, run:
   ```bash
   stripe trigger checkout.session.completed
   ```
   
   You can also trigger other events:
   ```bash
   stripe trigger payment_intent.succeeded
   stripe trigger payment_intent.payment_failed
   ```

4. **Check the logs**:
   - The Stripe CLI will show the events being sent and the response from your server
   - Your Next.js server logs will show how the webhook is being processed

### Method 2: Using the Test Script

We've created a script that simulates Stripe webhook events without requiring the Stripe CLI.

1. **Run the test script**:
   ```bash
   node scripts/test-stripe-webhook.js
   ```

2. **Check the logs**:
   The script will output the response from your webhook endpoint.

## Automated Setup

We've created a setup script to automate the Stripe CLI setup process:

```bash
./scripts/setup-stripe-webhook.sh
```

This script will:
1. Check if Stripe CLI is installed
2. Login to Stripe (if needed)
3. Start forwarding webhook events to your local server
4. Provide instructions for triggering test events

## Webhook Handler Implementation

Our webhook handler is implemented in `/app/api/v1/payments/webhook/route.ts`. It handles the following events:

- `checkout.session.completed`: When a customer completes a checkout session
- `payment_intent.succeeded`: When a payment is successfully processed
- `payment_intent.payment_failed`: When a payment fails

## Production Setup

For production, you need to create a webhook endpoint in the Stripe Dashboard:

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production webhook URL (e.g., `https://yourdomain.com/api/v1/payments/webhook`)
4. Select the events you want to receive:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the signing secret and update your production environment variables

## Troubleshooting

### 500 Internal Server Error

If your webhook endpoint returns a 500 error:

1. Check the server logs for detailed error messages
2. Verify that your database is properly configured
3. Ensure the webhook signature is being correctly verified
4. Check that all required environment variables are set

### Event Not Being Processed

If events are being received but not processed:

1. Check that the event type is being handled in the webhook handler
2. Verify that the database operations are working correctly
3. Check for any errors in the event handling logic

### Webhook Signature Verification Failed

If signature verification fails:

1. Ensure the `STRIPE_WEBHOOK_SECRET` in your `.env` file matches the one from the Stripe CLI
2. Check that the raw request body is being correctly passed to the verification function
3. Verify that the `stripe-signature` header is being correctly extracted

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks with Stripe](https://stripe.com/docs/webhooks/test)