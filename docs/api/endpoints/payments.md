# Payments API

This document describes the payment processing endpoints for the Snagr AI API.

## Base URL

`/api/v1/payments`

## Authentication

All endpoints in this section require authentication.

## Endpoints

### Create Payment Intent

```
POST /api/v1/payments/create-intent
```

Creates a payment intent for unlocking a match.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "matchId": "uuid"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "pi_123456",
      "clientSecret": "pi_123456_secret_789012",
      "amount": 499,
      "currency": "usd"
    },
    "match": {
      "id": "uuid",
      "title": "PlayStation 5 Digital Edition"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid request body
- `403 Forbidden`: User doesn't own this match
- `404 Not Found`: Match not found
- `409 Conflict`: Match already unlocked by this user
- `500 Internal Server Error`: Payment processing error

### Confirm Payment

```
POST /api/v1/payments/confirm
```

Confirms a successful payment and unlocks a match.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "paymentIntentId": "pi_123456",
  "matchId": "uuid"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "amount": 499,
      "currency": "usd",
      "status": "completed",
      "createdAt": "2023-07-01T14:30:00Z"
    },
    "unlockedMatch": {
      "id": "uuid",
      "sellerInfo": {
        "name": "John Doe",
        "contactMethod": "Facebook Messenger",
        "contactUrl": "https://m.me/john.doe.123"
      },
      "listingUrl": "https://facebook.com/marketplace/item/123456",
      "suggestedMessage": "Hi John, I'm interested in your PlayStation 5 listing for $380. Is it still available?"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid request body
- `403 Forbidden`: User doesn't own this match
- `404 Not Found`: Match or payment intent not found
- `409 Conflict`: Match already unlocked by this user
- `422 Unprocessable Entity`: Payment verification failed
- `500 Internal Server Error`: Payment processing error

### List Payment History

```
GET /api/v1/payments/history
```

Retrieves the user's payment history.

#### Request Headers

- `Authorization: Bearer [token]`

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: -createdAt)
- `filter[status]`: Filter by payment status (completed, failed, refunded)

#### Response

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "amount": 499,
        "currency": "usd",
        "status": "completed",
        "createdAt": "2023-07-01T14:30:00Z",
        "match": {
          "id": "uuid",
          "title": "PlayStation 5 Digital Edition"
        }
      },
      // More payments...
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid query parameters

### Get Payment Details

```
GET /api/v1/payments/:id
```

Retrieves details for a specific payment.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Payment ID

#### Response

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "stripePaymentId": "pi_123456",
      "amount": 499,
      "currency": "usd",
      "status": "completed",
      "createdAt": "2023-07-01T14:30:00Z",
      "updatedAt": "2023-07-01T14:30:30Z",
      "match": {
        "id": "uuid",
        "title": "PlayStation 5 Digital Edition",
        "price": 380.00,
        "imageUrl": "https://example.com/image.jpg"
      },
      "unlock": {
        "id": "uuid",
        "unlockedAt": "2023-07-01T14:30:30Z"
      }
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this payment
- `404 Not Found`: Payment not found

### Request Refund

```
POST /api/v1/payments/:id/refund
```

Requests a refund for a payment.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Payment ID

#### Request Body

```json
{
  "reason": "Seller not responding"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "status": "refund_pending",
      "refundReason": "Seller not responding",
      "refundRequestedAt": "2023-07-02T10:15:00Z"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this payment
- `404 Not Found`: Payment not found
- `409 Conflict`: Payment not eligible for refund
- `400 Bad Request`: Invalid request body
- `500 Internal Server Error`: Refund processing error

### Stripe Webhook Handler

```
POST /api/v1/payments/webhook
```

Handles Stripe webhook events.

#### Request Headers

- `Stripe-Signature`: Webhook signature from Stripe

#### Request Body

Stripe event object

#### Response

```json
{
  "success": true,
  "data": {
    "received": true
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid webhook payload
- `401 Unauthorized`: Invalid webhook signature
- `500 Internal Server Error`: Webhook processing error