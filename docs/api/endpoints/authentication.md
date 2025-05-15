# Authentication API

This document describes the authentication endpoints for the Snagr AI API.

## Base URL

`/api/v1/auth`

## Endpoints

### Register a new user

```
POST /api/v1/auth/register
```

Creates a new user account.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2023-07-01T12:00:00Z"
    },
    "token": "jwt-token"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation errors (e.g., password too weak)
- `409 Conflict`: Email already in use

### Login

```
POST /api/v1/auth/login
```

Authenticates a user and returns a JWT token.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2023-07-01T12:00:00Z"
    },
    "token": "jwt-token"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid credentials

### Refresh Token

```
POST /api/v1/auth/refresh
```

Refreshes an expired JWT token.

#### Request Headers

- `Authorization: Bearer [refresh-token]`

#### Response

```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired refresh token

### Logout

```
POST /api/v1/auth/logout
```

Invalidates the current JWT token.

#### Request Headers

- `Authorization: Bearer [token]`

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token

### Request Password Reset

```
POST /api/v1/auth/forgot-password
```

Sends a password reset email to the user.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid request body
- `404 Not Found`: Email not found (for security, the API returns success even if the email doesn't exist)

### Reset Password

```
POST /api/v1/auth/reset-password
```

Resets a user's password using a reset token.

#### Request Body

```json
{
  "token": "reset-token",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Password reset successful"
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or expired reset token
- `422 Unprocessable Entity`: Validation errors (e.g., password too weak)

### Verify Email

```
GET /api/v1/auth/verify-email/:token
```

Verifies a user's email address using a verification token.

#### Parameters

- `token`: Email verification token

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired verification token

### Get Current User

```
GET /api/v1/auth/me
```

Returns the currently authenticated user's information.

#### Request Headers

- `Authorization: Bearer [token]`

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2023-07-01T12:00:00Z",
      "emailVerified": true
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token