# Notifications API

This document describes the notification management endpoints for the Snagr AI API.

## Base URL

`/api/v1/notifications`

## Authentication

All endpoints in this section require authentication.

## Endpoints

### List Notifications

```
GET /api/v1/notifications
```

Retrieves a list of notifications for the current user.

#### Request Headers

- `Authorization: Bearer [token]`

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: -createdAt)
- `filter[type]`: Filter by notification type (email, sms)
- `filter[status]`: Filter by notification status (pending, sent, failed)

#### Response

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "email",
        "status": "sent",
        "content": "New matches found for your search 'PS5 under $400'",
        "createdAt": "2023-07-01T12:00:00Z",
        "sentAt": "2023-07-01T12:01:00Z",
        "search": {
          "id": "uuid",
          "queryText": "PS5 under $400"
        }
      },
      // More notifications...
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
- `400 Bad Request`: Invalid query parameters

### Get Notification Details

```
GET /api/v1/notifications/:id
```

Retrieves details for a specific notification.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Notification ID

#### Response

```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "type": "email",
      "status": "sent",
      "content": "New matches found for your search 'PS5 under $400'",
      "createdAt": "2023-07-01T12:00:00Z",
      "sentAt": "2023-07-01T12:01:00Z",
      "search": {
        "id": "uuid",
        "queryText": "PS5 under $400"
      },
      "matches": [
        {
          "id": "uuid",
          "title": "PlayStation 5 Digital Edition",
          "price": 380.00,
          "imageUrl": "https://example.com/image.jpg"
        },
        // More matches...
      ]
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this notification
- `404 Not Found`: Notification not found

### Mark Notification as Read

```
PATCH /api/v1/notifications/:id/read
```

Marks a notification as read.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Notification ID

#### Response

```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "isRead": true,
      "readAt": "2023-07-01T15:30:00Z"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this notification
- `404 Not Found`: Notification not found

### Mark All Notifications as Read

```
POST /api/v1/notifications/read-all
```

Marks all notifications as read.

#### Request Headers

- `Authorization: Bearer [token]`

#### Response

```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read",
    "count": 5
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token

### Delete Notification

```
DELETE /api/v1/notifications/:id
```

Deletes a specific notification.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Notification ID

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this notification
- `404 Not Found`: Notification not found

### Delete All Notifications

```
DELETE /api/v1/notifications
```

Deletes all notifications for the current user.

#### Request Headers

- `Authorization: Bearer [token]`

#### Response

```json
{
  "success": true,
  "data": {
    "message": "All notifications deleted successfully",
    "count": 15
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token

### Update Notification Preferences

```
PATCH /api/v1/notifications/preferences
```

Updates the user's notification preferences.

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