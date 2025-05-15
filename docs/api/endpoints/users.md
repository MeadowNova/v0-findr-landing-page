# Users API

This document describes the user management endpoints for the Snagr AI API.

## Base URL

`/api/v1/users`

## Authentication

All endpoints in this section require authentication.

## Endpoints

### Get User Profile

```
GET /api/v1/users/profile
```

Retrieves the current user's profile information.

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
      "emailVerified": true,
      "preferences": {
        "notificationEmail": true,
        "notificationSms": false,
        "phoneNumber": null
      }
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token

### Update User Profile

```
PATCH /api/v1/users/profile
```

Updates the current user's profile information.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "email": "newemail@example.com"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newemail@example.com",
      "createdAt": "2023-07-01T12:00:00Z",
      "emailVerified": false
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid request body
- `409 Conflict`: Email already in use
- `422 Unprocessable Entity`: Validation errors

### Change Password

```
POST /api/v1/users/change-password
```

Changes the current user's password.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "currentPassword": "currentSecurePassword123",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token, or incorrect current password
- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation errors (e.g., password too weak)

### Get User Preferences

```
GET /api/v1/users/preferences
```

Retrieves the current user's notification preferences.

#### Request Headers

- `Authorization: Bearer [token]`

#### Response

```json
{
  "success": true,
  "data": {
    "preferences": {
      "notificationEmail": true,
      "notificationSms": false,
      "phoneNumber": null
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token

### Update User Preferences

```
PATCH /api/v1/users/preferences
```

Updates the current user's notification preferences.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "notificationEmail": true,
  "notificationSms": true,
  "phoneNumber": "+1234567890"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "preferences": {
      "notificationEmail": true,
      "notificationSms": true,
      "phoneNumber": "+1234567890"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation errors (e.g., invalid phone number)

### Delete Account

```
DELETE /api/v1/users/account
```

Deletes the current user's account.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "password": "currentPassword123"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token, or incorrect password
- `400 Bad Request`: Invalid request body