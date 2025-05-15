# Entity-Relationship Diagram for Snagr AI

## Overview

This document outlines the entity-relationship model for the Snagr AI application, which helps users find specific listings on Facebook Marketplace through AI-powered search and filtering.

## Entities and Relationships

### Core Entities

#### User
- Represents a registered user of the Snagr AI platform
- Primary entity that interacts with the system
- Has authentication credentials and profile information
- Can create searches, view matches, and unlock listings

#### Search
- Represents a search query submitted by a user
- Contains search parameters like keywords, price range, location, etc.
- Can be saved for future reference and notifications
- Generates multiple matches through background jobs

#### Match (Listing)
- Represents a listing found from Facebook Marketplace that matches a search
- Contains listing details like title, price, image URL, etc.
- Can be unlocked by a user through payment
- Linked to both a search and potentially to a user (if unlocked)

#### Job
- Represents a background task for executing a search
- Contains status information and execution details
- Linked to a search and generates matches

#### Payment
- Represents a transaction made by a user to unlock a match
- Contains payment details, status, and timestamps
- Links a user to an unlocked match

#### Notification
- Represents alerts sent to users about new matches for saved searches
- Contains notification type, status, and delivery information

#### UserPreference
- Represents user settings and notification preferences
- Contains contact methods and notification settings
- Linked to a user

#### SavedSearch
- Represents a search that a user has saved for recurring execution
- Contains scheduling information and notification preferences
- Linked to a search and a user

### Relationships

1. **User to Search**: One-to-Many
   - A user can create multiple searches
   - Each search belongs to exactly one user

2. **Search to Job**: One-to-Many
   - A search can have multiple jobs (initial and re-runs)
   - Each job is associated with exactly one search

3. **Job to Match**: One-to-Many
   - A job can generate multiple matches
   - Each match is associated with exactly one job

4. **Search to Match**: One-to-Many (indirect through Job)
   - A search can have multiple matches (through jobs)
   - Each match is associated with exactly one search

5. **User to Match (Unlocked)**: Many-to-Many
   - A user can unlock multiple matches
   - A match can be unlocked by multiple users
   - This relationship is facilitated through the Payment entity

6. **User to Payment**: One-to-Many
   - A user can make multiple payments
   - Each payment is made by exactly one user

7. **Payment to Match**: One-to-One
   - Each payment unlocks exactly one match
   - A match can be unlocked multiple times (by different users)

8. **User to Notification**: One-to-Many
   - A user can receive multiple notifications
   - Each notification is sent to exactly one user

9. **Search to Notification**: One-to-Many
   - A saved search can generate multiple notifications (over time)
   - Each notification is associated with exactly one search

10. **User to UserPreference**: One-to-One
    - A user has exactly one set of preferences
    - Each preference set belongs to exactly one user

11. **User to SavedSearch**: One-to-Many
    - A user can have multiple saved searches
    - Each saved search belongs to exactly one user

12. **Search to SavedSearch**: One-to-One
    - A search can be saved once
    - Each saved search is associated with exactly one search

## Entity-Relationship Diagram

```
                                  +----------------+
                                  | UserPreference |
                                  +----------------+
                                          ▲
                                          |
                                          | 1:1
                                          |
+-------------+       +--------+       +-------+       +--------------+
| Notification |◄----->| Search |◄----->| User  |◄----->| SavedSearch  |
+-------------+       +--------+       +-------+       +--------------+
       ▲                  ▲                ▲
       |                  |                |
       | 1:M              | 1:M            | 1:M
       |                  |                |
       |                  |                |
       |                  v                |
       |               +------+            |
       |               | Job  |            |
       |               +------+            |
       |                  ▲                |
       |                  |                |
       |                  | 1:M            |
       |                  |                |
       |                  v                |
       |               +-------+           |
       +---------------| Match |◄----------+
                       +-------+
                           ▲
                           |
                           | 1:1
                           |
                       +--------+
                       | Payment |
                       +--------+
```

## Attributes

### User
- id (PK): UUID
- email: String
- password_hash: String
- created_at: Timestamp
- updated_at: Timestamp
- is_active: Boolean

### UserPreference
- id (PK): UUID
- user_id (FK): UUID
- notification_email: Boolean
- notification_sms: Boolean
- phone_number: String (optional)
- created_at: Timestamp
- updated_at: Timestamp

### Search
- id (PK): UUID
- user_id (FK): UUID
- query_text: String
- parameters: JSON (price_range, location, radius, etc.)
- created_at: Timestamp
- updated_at: Timestamp

### SavedSearch
- id (PK): UUID
- search_id (FK): UUID
- user_id (FK): UUID
- is_active: Boolean
- frequency: String (daily, weekly)
- last_run_at: Timestamp
- next_run_at: Timestamp
- created_at: Timestamp
- updated_at: Timestamp

### Job
- id (PK): UUID
- search_id (FK): UUID
- status: String (pending, running, completed, failed)
- error: Text (optional)
- started_at: Timestamp
- completed_at: Timestamp
- created_at: Timestamp
- updated_at: Timestamp
- retry_count: Integer
- is_rerun: Boolean

### Match
- id (PK): UUID
- job_id (FK): UUID
- search_id (FK): UUID
- external_listing_id: String
- title: String
- price: Decimal
- description: Text
- image_url: String
- seller_info: JSON (encrypted, revealed after payment)
- listing_url: String (encrypted, revealed after payment)
- posted_at: Timestamp
- distance: Decimal
- relevance_score: Decimal
- created_at: Timestamp
- updated_at: Timestamp

### Payment
- id (PK): UUID
- user_id (FK): UUID
- match_id (FK): UUID
- stripe_payment_id: String
- amount: Decimal
- currency: String
- status: String (completed, failed, refunded)
- created_at: Timestamp
- updated_at: Timestamp

### Unlock (Join table for User-Match)
- id (PK): UUID
- user_id (FK): UUID
- match_id (FK): UUID
- payment_id (FK): UUID
- unlocked_at: Timestamp
- suggested_message: Text

### Notification
- id (PK): UUID
- user_id (FK): UUID
- search_id (FK): UUID
- type: String (email, sms)
- status: String (pending, sent, failed)
- content: Text
- created_at: Timestamp
- sent_at: Timestamp