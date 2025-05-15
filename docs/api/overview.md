# Snagr AI API Specifications

## Overview

This document provides an overview of the Snagr AI API, which powers the backend functionality for the Snagr AI application. The API follows RESTful principles and is implemented using Next.js API routes.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://[production-domain]/api`

## API Versioning

All API endpoints are versioned to ensure backward compatibility as the API evolves. The current version is `v1`.

Example: `https://[domain]/api/v1/searches`

## Authentication

Most API endpoints require authentication. The API uses JWT (JSON Web Tokens) for authentication.

- **Authentication Header**: `Authorization: Bearer [token]`
- **Token Expiration**: 24 hours
- **Token Refresh**: `/api/v1/auth/refresh`

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Metadata (pagination, etc.)
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

## HTTP Status Codes

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: The request was successful
- `201 Created`: A resource was successfully created
- `400 Bad Request`: The request was invalid or cannot be served
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource doesn't exist
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: An error occurred on the server

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:

- **Authenticated Users**: 100 requests per minute
- **Unauthenticated Users**: 20 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`: The maximum number of requests allowed per time window
- `X-RateLimit-Remaining`: The number of requests remaining in the current time window
- `X-RateLimit-Reset`: The time when the current rate limit window resets (Unix timestamp)

## API Endpoints

The API is organized into the following resource groups:

1. **Authentication**: User registration, login, and token management
2. **Users**: User profile and preference management
3. **Searches**: Search creation, management, and history
4. **Matches**: Listing matches from searches
5. **Payments**: Payment processing and history
6. **Notifications**: User notification preferences and delivery

Detailed documentation for each endpoint is available in separate files:

- [Authentication API](./endpoints/authentication.md)
- [Users API](./endpoints/users.md)
- [Searches API](./endpoints/searches.md)
- [Matches API](./endpoints/matches.md)
- [Payments API](./endpoints/payments.md)
- [Notifications API](./endpoints/notifications.md)

## Error Codes

The API uses standardized error codes to provide more specific information about errors:

- `AUTH_REQUIRED`: Authentication is required
- `INVALID_CREDENTIALS`: Invalid username or password
- `TOKEN_EXPIRED`: Authentication token has expired
- `PERMISSION_DENIED`: User doesn't have permission
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Request data failed validation
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `PAYMENT_REQUIRED`: Payment is required to access this resource
- `PAYMENT_FAILED`: Payment processing failed
- `EXTERNAL_SERVICE_ERROR`: Error from an external service
- `INTERNAL_ERROR`: Internal server error

## Pagination

List endpoints support pagination using the following query parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page (default: 20, max: 100)

Pagination metadata is included in the response:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## Filtering and Sorting

List endpoints support filtering and sorting using the following query parameters:

- `filter[field]`: Filter by field value (e.g., `filter[status]=active`)
- `sort`: Sort by field (prefix with `-` for descending order, e.g., `sort=-createdAt`)

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for specified origins:

- Development: `http://localhost:3000`
- Production: `https://[production-domain]`

## API Documentation

Interactive API documentation is available using Swagger/OpenAPI:

- Development: `http://localhost:3000/api-docs`
- Production: `https://[production-domain]/api-docs`