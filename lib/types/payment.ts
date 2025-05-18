/**
 * Payment related type definitions
 */

// Base payment interface
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  matchId?: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Payment with match details
export interface PaymentWithMatch extends Payment {
  match?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

// Unlock interface (represents a purchased match)
export interface Unlock {
  id: string;
  userId: string;
  matchId: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

// Unlock with details
export interface UnlockWithDetails {
  id: string;
  match: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    description?: string;
    location?: string;
    sellerInfo?: {
      name?: string;
      rating?: string;
      joinedDate?: string;
    };
    listingUrl?: string;
    search?: {
      id: string;
      queryText: string;
    };
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: string;
  };
  createdAt: string;
}

// Payment intent creation request
export interface CreatePaymentIntentRequest {
  matchId: string;
  returnUrl?: string;
}

// Payment intent response
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

// Checkout session creation request
export interface CreateCheckoutSessionRequest {
  matchId: string;
  successUrl: string;
  cancelUrl: string;
}

// Checkout session response
export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  paymentId: string;
}

// Refund request
export interface RefundRequest {
  reason?: string;
}

// Refund response
export interface RefundResponse {
  success: boolean;
  refundId?: string;
  status: string;
}