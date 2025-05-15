# Database Schema Definition for Snagr AI

## Overview

This document defines the database schema for the Snagr AI application. It includes table definitions, field specifications, relationships, and constraints. The schema is designed for implementation in Supabase (PostgreSQL).

## Table Definitions

### users

Stores user account information and authentication details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the user |
| email | varchar(255) | NOT NULL, UNIQUE | User's email address |
| password_hash | varchar(255) | NOT NULL | Hashed password (managed by Supabase Auth) |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the user account was created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the user account was last updated |
| is_active | boolean | NOT NULL, DEFAULT true | Whether the user account is active |

Indexes:
- PRIMARY KEY on (id)
- UNIQUE INDEX on (email)

### user_preferences

Stores user settings and notification preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the preference |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reference to the user |
| notification_email | boolean | NOT NULL, DEFAULT true | Whether to send email notifications |
| notification_sms | boolean | NOT NULL, DEFAULT false | Whether to send SMS notifications |
| phone_number | varchar(20) | NULL | User's phone number for SMS notifications |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the preferences were created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the preferences were last updated |

Indexes:
- PRIMARY KEY on (id)
- UNIQUE INDEX on (user_id)
- FOREIGN KEY on user_id referencing users(id)

### searches

Stores search queries and parameters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the search |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reference to the user who created the search |
| query_text | text | NOT NULL | The search query text |
| parameters | jsonb | NOT NULL, DEFAULT '{}' | Search parameters (price range, location, radius, etc.) |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the search was created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the search was last updated |

Indexes:
- PRIMARY KEY on (id)
- INDEX on (user_id)
- FOREIGN KEY on user_id referencing users(id)
- INDEX on (created_at)

### saved_searches

Stores saved searches for recurring execution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the saved search |
| search_id | uuid | NOT NULL, REFERENCES searches(id) ON DELETE CASCADE | Reference to the search |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reference to the user |
| is_active | boolean | NOT NULL, DEFAULT true | Whether the saved search is active |
| frequency | varchar(20) | NOT NULL, DEFAULT 'daily' | How often to run the search (daily, weekly) |
| last_run_at | timestamp | NULL | When the search was last run |
| next_run_at | timestamp | NULL | When the search is scheduled to run next |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the saved search was created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the saved search was last updated |

Indexes:
- PRIMARY KEY on (id)
- UNIQUE INDEX on (search_id)
- INDEX on (user_id)
- INDEX on (next_run_at)
- FOREIGN KEY on search_id referencing searches(id)
- FOREIGN KEY on user_id referencing users(id)

### jobs

Stores background jobs for executing searches.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the job |
| search_id | uuid | NOT NULL, REFERENCES searches(id) ON DELETE CASCADE | Reference to the search |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Job status (pending, running, completed, failed) |
| error | text | NULL | Error message if the job failed |
| started_at | timestamp | NULL | When the job started running |
| completed_at | timestamp | NULL | When the job completed |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the job was created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the job was last updated |
| retry_count | integer | NOT NULL, DEFAULT 0 | Number of times the job has been retried |
| is_rerun | boolean | NOT NULL, DEFAULT false | Whether this is a rerun of a saved search |

Indexes:
- PRIMARY KEY on (id)
- INDEX on (search_id)
- INDEX on (status)
- INDEX on (created_at)
- FOREIGN KEY on search_id referencing searches(id)

### matches

Stores marketplace listings that match searches.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the match |
| job_id | uuid | NOT NULL, REFERENCES jobs(id) ON DELETE CASCADE | Reference to the job that found the match |
| search_id | uuid | NOT NULL, REFERENCES searches(id) ON DELETE CASCADE | Reference to the search |
| external_listing_id | varchar(255) | NOT NULL | ID of the listing on Facebook Marketplace |
| title | varchar(255) | NOT NULL | Title of the listing |
| price | decimal(10,2) | NOT NULL | Price of the item |
| description | text | NULL | Description of the listing |
| image_url | text | NULL | URL of the listing's primary image |
| seller_info | jsonb | NOT NULL, DEFAULT '{}' | Encrypted seller contact information (revealed after payment) |
| listing_url | text | NOT NULL | Encrypted URL to the original listing (revealed after payment) |
| posted_at | timestamp | NULL | When the listing was posted on Facebook Marketplace |
| distance | decimal(10,2) | NULL | Distance from the user's location in miles/kilometers |
| relevance_score | decimal(5,2) | NOT NULL, DEFAULT 0 | AI-generated relevance score (0-100) |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the match was created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the match was last updated |

Indexes:
- PRIMARY KEY on (id)
- INDEX on (job_id)
- INDEX on (search_id)
- UNIQUE INDEX on (search_id, external_listing_id)
- INDEX on (relevance_score)
- INDEX on (created_at)
- FOREIGN KEY on job_id referencing jobs(id)
- FOREIGN KEY on search_id referencing searches(id)

### payments

Stores payment transactions for unlocking listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the payment |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reference to the user who made the payment |
| match_id | uuid | NOT NULL, REFERENCES matches(id) ON DELETE CASCADE | Reference to the match being unlocked |
| stripe_payment_id | varchar(255) | NOT NULL | Stripe payment ID |
| amount | decimal(10,2) | NOT NULL | Payment amount |
| currency | varchar(3) | NOT NULL, DEFAULT 'USD' | Payment currency |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Payment status (pending, completed, failed, refunded) |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the payment was created |
| updated_at | timestamp | NOT NULL, DEFAULT now() | When the payment was last updated |

Indexes:
- PRIMARY KEY on (id)
- INDEX on (user_id)
- INDEX on (match_id)
- INDEX on (status)
- INDEX on (created_at)
- FOREIGN KEY on user_id referencing users(id)
- FOREIGN KEY on match_id referencing matches(id)

### unlocks

Stores records of unlocked listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the unlock |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reference to the user |
| match_id | uuid | NOT NULL, REFERENCES matches(id) ON DELETE CASCADE | Reference to the match |
| payment_id | uuid | NOT NULL, REFERENCES payments(id) ON DELETE CASCADE | Reference to the payment |
| unlocked_at | timestamp | NOT NULL, DEFAULT now() | When the listing was unlocked |
| suggested_message | text | NULL | AI-generated suggested message for contacting the seller |

Indexes:
- PRIMARY KEY on (id)
- UNIQUE INDEX on (user_id, match_id)
- INDEX on (payment_id)
- INDEX on (unlocked_at)
- FOREIGN KEY on user_id referencing users(id)
- FOREIGN KEY on match_id referencing matches(id)
- FOREIGN KEY on payment_id referencing payments(id)

### notifications

Stores notifications sent to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier for the notification |
| user_id | uuid | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Reference to the user |
| search_id | uuid | NOT NULL, REFERENCES searches(id) ON DELETE CASCADE | Reference to the search |
| type | varchar(20) | NOT NULL | Notification type (email, sms) |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' | Notification status (pending, sent, failed) |
| content | text | NOT NULL | Notification content |
| created_at | timestamp | NOT NULL, DEFAULT now() | When the notification was created |
| sent_at | timestamp | NULL | When the notification was sent |

Indexes:
- PRIMARY KEY on (id)
- INDEX on (user_id)
- INDEX on (search_id)
- INDEX on (status)
- INDEX on (created_at)
- FOREIGN KEY on user_id referencing users(id)
- FOREIGN KEY on search_id referencing searches(id)

## SQL Schema Creation

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_email BOOLEAN NOT NULL DEFAULT TRUE,
    notification_sms BOOLEAN NOT NULL DEFAULT FALSE,
    phone_number VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Searches table
CREATE TABLE searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX searches_user_id_idx ON searches(user_id);
CREATE INDEX searches_created_at_idx ON searches(created_at);

-- Saved searches table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT saved_searches_search_id_key UNIQUE (search_id)
);
CREATE INDEX saved_searches_user_id_idx ON saved_searches(user_id);
CREATE INDEX saved_searches_next_run_at_idx ON saved_searches(next_run_at);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    retry_count INTEGER NOT NULL DEFAULT 0,
    is_rerun BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX jobs_search_id_idx ON jobs(search_id);
CREATE INDEX jobs_status_idx ON jobs(status);
CREATE INDEX jobs_created_at_idx ON jobs(created_at);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    external_listing_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    seller_info JSONB NOT NULL DEFAULT '{}',
    listing_url TEXT NOT NULL,
    posted_at TIMESTAMP,
    distance DECIMAL(10,2),
    relevance_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT matches_search_external_listing_key UNIQUE (search_id, external_listing_id)
);
CREATE INDEX matches_job_id_idx ON matches(job_id);
CREATE INDEX matches_search_id_idx ON matches(search_id);
CREATE INDEX matches_relevance_score_idx ON matches(relevance_score);
CREATE INDEX matches_created_at_idx ON matches(created_at);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX payments_match_id_idx ON payments(match_id);
CREATE INDEX payments_status_idx ON payments(status);
CREATE INDEX payments_created_at_idx ON payments(created_at);

-- Unlocks table
CREATE TABLE unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    suggested_message TEXT,
    CONSTRAINT unlocks_user_match_key UNIQUE (user_id, match_id)
);
CREATE INDEX unlocks_payment_id_idx ON unlocks(payment_id);
CREATE INDEX unlocks_unlocked_at_idx ON unlocks(unlocked_at);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMP
);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_search_id_idx ON notifications(search_id);
CREATE INDEX notifications_status_idx ON notifications(status);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
```

## Notes on Schema Design

1. **UUID Primary Keys**: All tables use UUID primary keys for better distribution and security.

2. **Timestamps**: All tables include created_at and updated_at timestamps for tracking record history.

3. **Soft Deletes**: The schema does not implement soft deletes, but this could be added if needed.

4. **JSON/JSONB Fields**: Parameters and seller_info use JSONB for flexible schema evolution.

5. **Indexing Strategy**: Indexes are created on:
   - All primary keys
   - All foreign keys
   - Fields commonly used in WHERE clauses
   - Fields used for sorting
   - Fields used in joins

6. **Constraints**:
   - Foreign key constraints with CASCADE delete to maintain referential integrity
   - Unique constraints to prevent duplicate records
   - NOT NULL constraints on required fields

7. **Encryption**: Sensitive data like seller_info and listing_url should be encrypted at the application level before storage.

8. **Supabase Integration**: This schema is designed to work with Supabase, which provides:
   - Built-in authentication (users table)
   - Row-level security policies
   - Realtime subscriptions
   - Storage for images and files