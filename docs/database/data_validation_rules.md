# Data Validation Rules for Snagr AI

## Overview

This document defines the data validation rules for the Snagr AI application. These rules ensure data integrity and quality throughout the system. The validation rules are implemented at both the database level (through constraints) and the application level (through form validation and API request validation).

## Validation Rules by Entity

### User

#### Email
- **Required**: Yes
- **Format**: Must be a valid email address format (RFC 5322)
- **Uniqueness**: Must be unique across all users
- **Length**: Maximum 255 characters
- **Error Message**: "Please enter a valid email address"

#### Password
- **Required**: Yes
- **Length**: Minimum 8 characters
- **Complexity**: Must contain at least one uppercase letter, one lowercase letter, one number, and one special character
- **Error Message**: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"

#### Phone Number (in UserPreference)
- **Required**: Only if SMS notifications are enabled
- **Format**: Must be a valid phone number format (E.164 recommended)
- **Length**: Maximum 20 characters
- **Error Message**: "Please enter a valid phone number"

### Search

#### Query Text
- **Required**: Yes
- **Length**: Minimum 3 characters, maximum 200 characters
- **Error Message**: "Search query must be between 3 and 200 characters"

#### Parameters
- **Required**: Yes
- **Format**: Must be valid JSON
- **Schema Validation**:
  - `price_min`: Number, >= 0 if provided
  - `price_max`: Number, > price_min if both provided
  - `location`: String, maximum 100 characters
  - `radius`: Number, > 0 if provided
  - `category`: String, must be one of predefined categories if provided
  - `condition`: String, must be one of predefined conditions if provided
- **Error Messages**:
  - "Price minimum must be a positive number"
  - "Price maximum must be greater than price minimum"
  - "Location must be a valid location name"
  - "Radius must be a positive number"
  - "Category must be a valid category"
  - "Condition must be a valid condition"

### SavedSearch

#### Frequency
- **Required**: Yes
- **Allowed Values**: 'daily', 'weekly'
- **Error Message**: "Frequency must be either 'daily' or 'weekly'"

#### Next Run At
- **Required**: Yes for active saved searches
- **Format**: Must be a valid future timestamp
- **Error Message**: "Next run time must be in the future"

### Job

#### Status
- **Required**: Yes
- **Allowed Values**: 'pending', 'running', 'completed', 'failed'
- **Error Message**: "Status must be one of: pending, running, completed, failed"

#### Retry Count
- **Required**: Yes
- **Range**: 0-10 (maximum retry attempts)
- **Error Message**: "Retry count must be between 0 and 10"

### Match

#### External Listing ID
- **Required**: Yes
- **Uniqueness**: Must be unique for a given search
- **Length**: Maximum 255 characters
- **Error Message**: "External listing ID must be unique for this search"

#### Title
- **Required**: Yes
- **Length**: Maximum 255 characters
- **Error Message**: "Title must not exceed 255 characters"

#### Price
- **Required**: Yes
- **Range**: >= 0
- **Precision**: 2 decimal places
- **Error Message**: "Price must be a positive number"

#### Image URL
- **Required**: No
- **Format**: Must be a valid URL if provided
- **Error Message**: "Image URL must be a valid URL"

#### Listing URL
- **Required**: Yes
- **Format**: Must be a valid URL
- **Error Message**: "Listing URL must be a valid URL"

#### Relevance Score
- **Required**: Yes
- **Range**: 0-100
- **Precision**: 2 decimal places
- **Error Message**: "Relevance score must be between 0 and 100"

### Payment

#### Stripe Payment ID
- **Required**: Yes
- **Format**: Must match Stripe payment ID format
- **Error Message**: "Invalid Stripe payment ID"

#### Amount
- **Required**: Yes
- **Range**: > 0
- **Precision**: 2 decimal places
- **Error Message**: "Payment amount must be greater than zero"

#### Currency
- **Required**: Yes
- **Format**: 3-letter ISO currency code
- **Default**: 'USD'
- **Error Message**: "Currency must be a valid 3-letter ISO currency code"

#### Status
- **Required**: Yes
- **Allowed Values**: 'pending', 'completed', 'failed', 'refunded'
- **Error Message**: "Status must be one of: pending, completed, failed, refunded"

### Notification

#### Type
- **Required**: Yes
- **Allowed Values**: 'email', 'sms'
- **Error Message**: "Notification type must be either 'email' or 'sms'"

#### Status
- **Required**: Yes
- **Allowed Values**: 'pending', 'sent', 'failed'
- **Error Message**: "Status must be one of: pending, sent, failed"

#### Content
- **Required**: Yes
- **Length**: Maximum 2000 characters
- **Error Message**: "Notification content must not exceed 2000 characters"

## Cross-Field Validations

### User Preferences
- If `notification_sms` is true, `phone_number` must be provided
- Error Message: "Phone number is required for SMS notifications"

### Price Range in Search Parameters
- If both `price_min` and `price_max` are provided, `price_max` must be greater than `price_min`
- Error Message: "Maximum price must be greater than minimum price"

### Saved Search Scheduling
- If `is_active` is true, `next_run_at` must be a future timestamp
- Error Message: "Next run time must be in the future for active saved searches"

### Payment and Unlock
- A match can only be unlocked if there is a completed payment for it
- Error Message: "Payment must be completed before unlocking a match"

## Business Rule Validations

### Search Query Limits
- A user can have a maximum of 50 active searches at any time
- Error Message: "You have reached the maximum number of active searches (50)"

### Saved Search Limits
- A user can have a maximum of 10 saved searches at any time
- Error Message: "You have reached the maximum number of saved searches (10)"

### Payment Processing
- A payment must be verified with Stripe before unlocking a match
- Error Message: "Payment verification failed"

### Duplicate Unlocks
- A user should not be charged again for a match they have already unlocked
- Error Message: "You have already unlocked this match"

## Implementation Strategy

### Database-Level Validation
- Implement constraints directly in the database schema:
  - NOT NULL constraints
  - UNIQUE constraints
  - CHECK constraints for simple validations
  - Foreign key constraints

### Application-Level Validation
- Implement validation in the API layer using Zod schemas
- Validate all user inputs before processing
- Return clear error messages for validation failures

### Form Validation
- Implement client-side validation using React Hook Form with Zod
- Provide immediate feedback to users on validation errors
- Ensure consistent validation between client and server

## Handling Legacy or Imported Data

For data imported from external sources or legacy systems:

1. **Validation Exceptions**: Define specific exceptions for imported data
2. **Data Cleaning**: Implement data cleaning processes before import
3. **Flagging**: Flag imported data that doesn't meet validation criteria
4. **Gradual Compliance**: Plan for gradual updating of non-compliant data

## Validation Testing Strategy

1. **Unit Tests**: Test individual validation rules
2. **Integration Tests**: Test validation in the context of API endpoints
3. **Edge Cases**: Test boundary conditions and edge cases
4. **Invalid Data**: Test with deliberately invalid data
5. **Performance**: Test validation performance with large datasets