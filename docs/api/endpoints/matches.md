# Matches API

This document describes the match management endpoints for the Snagr AI API.

## Base URL

`/api/v1/matches`

## Authentication

All endpoints in this section require authentication.

## Endpoints

### List Matches for a Search

```
GET /api/v1/matches
```

Retrieves a list of matches for a specific search.

#### Request Headers

- `Authorization: Bearer [token]`

#### Query Parameters

- `searchId`: Search ID (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: -relevanceScore)
- `filter[priceMin]`: Filter by minimum price
- `filter[priceMax]`: Filter by maximum price
- `filter[distance]`: Filter by maximum distance
- `filter[unlocked]`: Filter by unlock status (true/false)

#### Response

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "searchId": "uuid",
        "externalListingId": "fb-123456",
        "title": "PlayStation 5 Digital Edition",
        "price": 380.00,
        "description": "Brand new PS5 Digital Edition, unopened box...",
        "imageUrl": "https://example.com/image.jpg",
        "postedAt": "2023-06-30T10:15:00Z",
        "distance": 12.5,
        "relevanceScore": 95.2,
        "isUnlocked": false,
        "createdAt": "2023-07-01T12:00:00Z"
      },
      // More matches...
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Missing searchId or invalid query parameters
- `403 Forbidden`: User doesn't own this search
- `404 Not Found`: Search not found

### Get Match Details

```
GET /api/v1/matches/:id
```

Retrieves details for a specific match.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Match ID

#### Response

```json
{
  "success": true,
  "data": {
    "match": {
      "id": "uuid",
      "searchId": "uuid",
      "externalListingId": "fb-123456",
      "title": "PlayStation 5 Digital Edition",
      "price": 380.00,
      "description": "Brand new PS5 Digital Edition, unopened box...",
      "imageUrl": "https://example.com/image.jpg",
      "postedAt": "2023-06-30T10:15:00Z",
      "distance": 12.5,
      "relevanceScore": 95.2,
      "isUnlocked": false,
      "createdAt": "2023-07-01T12:00:00Z",
      "search": {
        "id": "uuid",
        "queryText": "PS5 under $400"
      }
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this match
- `404 Not Found`: Match not found

### Unlock Match

```
POST /api/v1/matches/:id/unlock
```

Initiates the payment process to unlock a match.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Match ID

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
- `403 Forbidden`: User doesn't own this match
- `404 Not Found`: Match not found
- `409 Conflict`: Match already unlocked by this user
- `500 Internal Server Error`: Payment processing error

### Get Unlocked Match Details

```
GET /api/v1/matches/:id/unlocked
```

Retrieves the unlocked details for a match after successful payment.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Match ID

#### Response

```json
{
  "success": true,
  "data": {
    "unlockedMatch": {
      "id": "uuid",
      "match": {
        "id": "uuid",
        "title": "PlayStation 5 Digital Edition",
        "price": 380.00,
        "imageUrl": "https://example.com/image.jpg"
      },
      "sellerInfo": {
        "name": "John Doe",
        "contactMethod": "Facebook Messenger",
        "contactUrl": "https://m.me/john.doe.123"
      },
      "listingUrl": "https://facebook.com/marketplace/item/123456",
      "suggestedMessage": "Hi John, I'm interested in your PlayStation 5 listing for $380. Is it still available?",
      "unlockedAt": "2023-07-01T14:30:00Z"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this match or hasn't unlocked it
- `404 Not Found`: Match not found or not unlocked

### List Unlocked Matches

```
GET /api/v1/matches/unlocked
```

Retrieves a list of all matches unlocked by the user.

#### Request Headers

- `Authorization: Bearer [token]`

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: -unlockedAt)

#### Response

```json
{
  "success": true,
  "data": {
    "unlockedMatches": [
      {
        "id": "uuid",
        "match": {
          "id": "uuid",
          "title": "PlayStation 5 Digital Edition",
          "price": 380.00,
          "imageUrl": "https://example.com/image.jpg",
          "search": {
            "id": "uuid",
            "queryText": "PS5 under $400"
          }
        },
        "sellerInfo": {
          "name": "John Doe",
          "contactMethod": "Facebook Messenger",
          "contactUrl": "https://m.me/john.doe.123"
        },
        "unlockedAt": "2023-07-01T14:30:00Z"
      },
      // More unlocked matches...
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