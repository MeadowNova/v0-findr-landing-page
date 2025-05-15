# Searches API

This document describes the search management endpoints for the Snagr AI API.

## Base URL

`/api/v1/searches`

## Authentication

All endpoints in this section require authentication.

## Endpoints

### Create Search

```
POST /api/v1/searches
```

Creates a new search query.

#### Request Headers

- `Authorization: Bearer [token]`

#### Request Body

```json
{
  "queryText": "PS5 under $400",
  "parameters": {
    "priceMin": 0,
    "priceMax": 400,
    "location": "San Francisco, CA",
    "radius": 50
  },
  "isSaved": false
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "search": {
      "id": "uuid",
      "queryText": "PS5 under $400",
      "parameters": {
        "priceMin": 0,
        "priceMax": 400,
        "location": "San Francisco, CA",
        "radius": 50
      },
      "isSaved": false,
      "createdAt": "2023-07-01T12:00:00Z",
      "jobId": "uuid",
      "jobStatus": "pending"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation errors

### Get Search

```
GET /api/v1/searches/:id
```

Retrieves a specific search by ID.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Search ID

#### Response

```json
{
  "success": true,
  "data": {
    "search": {
      "id": "uuid",
      "queryText": "PS5 under $400",
      "parameters": {
        "priceMin": 0,
        "priceMax": 400,
        "location": "San Francisco, CA",
        "radius": 50
      },
      "isSaved": false,
      "createdAt": "2023-07-01T12:00:00Z",
      "jobStatus": "completed",
      "matchCount": 15
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this search
- `404 Not Found`: Search not found

### List Searches

```
GET /api/v1/searches
```

Retrieves a list of the user's searches.

#### Request Headers

- `Authorization: Bearer [token]`

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: -createdAt)
- `filter[isSaved]`: Filter by saved status (true/false)

#### Response

```json
{
  "success": true,
  "data": {
    "searches": [
      {
        "id": "uuid",
        "queryText": "PS5 under $400",
        "parameters": {
          "priceMin": 0,
          "priceMax": 400,
          "location": "San Francisco, CA",
          "radius": 50
        },
        "isSaved": false,
        "createdAt": "2023-07-01T12:00:00Z",
        "jobStatus": "completed",
        "matchCount": 15
      },
      // More searches...
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `400 Bad Request`: Invalid query parameters

### Save Search

```
PATCH /api/v1/searches/:id/save
```

Saves a search for future reference and notifications.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Search ID

#### Request Body

```json
{
  "isSaved": true,
  "frequency": "daily"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "search": {
      "id": "uuid",
      "queryText": "PS5 under $400",
      "parameters": {
        "priceMin": 0,
        "priceMax": 400,
        "location": "San Francisco, CA",
        "radius": 50
      },
      "isSaved": true,
      "savedSearch": {
        "frequency": "daily",
        "lastRunAt": null,
        "nextRunAt": "2023-07-02T12:00:00Z"
      },
      "createdAt": "2023-07-01T12:00:00Z"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this search
- `404 Not Found`: Search not found
- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation errors

### Re-run Search

```
POST /api/v1/searches/:id/rerun
```

Re-runs a previous search to get updated results.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Search ID

#### Response

```json
{
  "success": true,
  "data": {
    "search": {
      "id": "uuid",
      "jobId": "uuid",
      "jobStatus": "pending"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this search
- `404 Not Found`: Search not found
- `429 Too Many Requests`: Search was re-run too recently

### Delete Search

```
DELETE /api/v1/searches/:id
```

Deletes a search and its associated data.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Search ID

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Search deleted successfully"
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this search
- `404 Not Found`: Search not found

### Get Search Job Status

```
GET /api/v1/searches/:id/job
```

Retrieves the status of a search job.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Search ID

#### Response

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "searchId": "uuid",
      "status": "completed",
      "startedAt": "2023-07-01T12:00:00Z",
      "completedAt": "2023-07-01T12:01:30Z",
      "matchCount": 15
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this search
- `404 Not Found`: Search or job not found

### List Saved Searches

```
GET /api/v1/searches/saved
```

Retrieves a list of the user's saved searches.

#### Request Headers

- `Authorization: Bearer [token]`

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: -createdAt)

#### Response

```json
{
  "success": true,
  "data": {
    "savedSearches": [
      {
        "id": "uuid",
        "search": {
          "id": "uuid",
          "queryText": "PS5 under $400",
          "parameters": {
            "priceMin": 0,
            "priceMax": 400,
            "location": "San Francisco, CA",
            "radius": 50
          }
        },
        "frequency": "daily",
        "isActive": true,
        "lastRunAt": "2023-07-01T12:00:00Z",
        "nextRunAt": "2023-07-02T12:00:00Z",
        "createdAt": "2023-07-01T12:00:00Z"
      },
      // More saved searches...
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

### Update Saved Search

```
PATCH /api/v1/searches/saved/:id
```

Updates a saved search's settings.

#### Request Headers

- `Authorization: Bearer [token]`

#### Parameters

- `id`: Saved search ID

#### Request Body

```json
{
  "frequency": "weekly",
  "isActive": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "savedSearch": {
      "id": "uuid",
      "frequency": "weekly",
      "isActive": true,
      "lastRunAt": "2023-07-01T12:00:00Z",
      "nextRunAt": "2023-07-08T12:00:00Z"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User doesn't own this saved search
- `404 Not Found`: Saved search not found
- `400 Bad Request`: Invalid request body
- `422 Unprocessable Entity`: Validation errors