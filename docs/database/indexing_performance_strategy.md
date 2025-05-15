# Indexing and Performance Strategy for Snagr AI

## Overview

This document outlines the indexing strategy and performance optimization plan for the Snagr AI database. It identifies fields requiring indexes based on query patterns and performance requirements, and provides strategies for query optimization, caching, and performance monitoring.

## Indexing Strategy

### Primary Indexes

Primary indexes are automatically created on primary key fields:

| Table | Primary Key Field | Index Type |
|-------|-------------------|------------|
| users | id | B-tree |
| user_preferences | id | B-tree |
| searches | id | B-tree |
| saved_searches | id | B-tree |
| jobs | id | B-tree |
| matches | id | B-tree |
| payments | id | B-tree |
| unlocks | id | B-tree |
| notifications | id | B-tree |

### Foreign Key Indexes

Indexes on foreign key fields to optimize join operations:

| Table | Foreign Key Field | Referenced Table | Index Type |
|-------|-------------------|------------------|------------|
| user_preferences | user_id | users | B-tree |
| searches | user_id | users | B-tree |
| saved_searches | search_id | searches | B-tree |
| saved_searches | user_id | users | B-tree |
| jobs | search_id | searches | B-tree |
| matches | job_id | jobs | B-tree |
| matches | search_id | searches | B-tree |
| payments | user_id | users | B-tree |
| payments | match_id | matches | B-tree |
| unlocks | user_id | users | B-tree |
| unlocks | match_id | matches | B-tree |
| unlocks | payment_id | payments | B-tree |
| notifications | user_id | users | B-tree |
| notifications | search_id | searches | B-tree |

### Secondary Indexes

Indexes on fields frequently used in WHERE clauses, ORDER BY clauses, or for filtering:

| Table | Field | Index Type | Purpose |
|-------|-------|------------|---------|
| users | email | B-tree | User lookup by email |
| users | is_active | B-tree | Filter active/inactive users |
| searches | created_at | B-tree | Sort searches by creation date |
| saved_searches | is_active | B-tree | Filter active/inactive saved searches |
| saved_searches | next_run_at | B-tree | Find searches due for execution |
| jobs | status | B-tree | Filter jobs by status |
| jobs | created_at | B-tree | Sort jobs by creation date |
| matches | relevance_score | B-tree | Sort matches by relevance |
| matches | price | B-tree | Filter matches by price |
| matches | created_at | B-tree | Sort matches by creation date |
| payments | status | B-tree | Filter payments by status |
| payments | created_at | B-tree | Sort payments by creation date |
| unlocks | unlocked_at | B-tree | Sort unlocks by unlock date |
| notifications | status | B-tree | Filter notifications by status |
| notifications | created_at | B-tree | Sort notifications by creation date |

### Composite Indexes

Indexes on multiple fields that are frequently queried together:

| Table | Fields | Index Type | Purpose |
|-------|--------|------------|---------|
| matches | (search_id, external_listing_id) | B-tree | Ensure uniqueness and optimize lookups |
| matches | (search_id, relevance_score) | B-tree | Optimize sorting matches by relevance within a search |
| unlocks | (user_id, match_id) | B-tree | Ensure uniqueness and optimize lookups |
| saved_searches | (user_id, is_active) | B-tree | Find active saved searches for a user |
| notifications | (user_id, status) | B-tree | Find pending notifications for a user |
| jobs | (search_id, status) | B-tree | Find jobs with specific status for a search |

### Text Search Indexes

For fields that require text search capabilities:

| Table | Field | Index Type | Purpose |
|-------|-------|------------|---------|
| searches | query_text | GIN | Enable full-text search on search queries |
| matches | title | GIN | Enable full-text search on match titles |
| matches | description | GIN | Enable full-text search on match descriptions |

## Query Optimization

### Common Query Patterns and Optimizations

1. **Retrieving User's Searches**
   ```sql
   SELECT * FROM searches WHERE user_id = ? ORDER BY created_at DESC LIMIT 20;
   ```
   - Optimization: Index on (user_id, created_at)
   - Pagination: Always use LIMIT and OFFSET

2. **Finding Matches for a Search**
   ```sql
   SELECT * FROM matches WHERE search_id = ? ORDER BY relevance_score DESC LIMIT 20;
   ```
   - Optimization: Index on (search_id, relevance_score)
   - Pagination: Always use LIMIT and OFFSET

3. **Checking if a User has Unlocked a Match**
   ```sql
   SELECT * FROM unlocks WHERE user_id = ? AND match_id = ?;
   ```
   - Optimization: Unique index on (user_id, match_id)

4. **Finding Saved Searches Due for Execution**
   ```sql
   SELECT * FROM saved_searches WHERE is_active = TRUE AND next_run_at <= NOW();
   ```
   - Optimization: Index on (is_active, next_run_at)

5. **Finding Pending Notifications**
   ```sql
   SELECT * FROM notifications WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100;
   ```
   - Optimization: Index on (status, created_at)

### Query Optimization Techniques

1. **Use Prepared Statements**
   - Prepare statements once and execute multiple times
   - Allows PostgreSQL to optimize execution plans

2. **Limit Result Sets**
   - Always use LIMIT and OFFSET for pagination
   - Avoid retrieving unnecessary columns (SELECT specific columns)

3. **Use Appropriate Joins**
   - Use INNER JOIN when both tables must have matching records
   - Use LEFT JOIN when the right table may not have matching records
   - Avoid unnecessary joins

4. **Optimize WHERE Clauses**
   - Place most restrictive conditions first
   - Use indexed fields in WHERE clauses
   - Avoid functions on indexed columns

5. **Use EXPLAIN ANALYZE**
   - Regularly analyze query execution plans
   - Identify and optimize slow queries

## Denormalization Strategy

In specific cases, denormalization can improve read performance:

1. **Denormalized Fields**
   - Add `search_id` to `matches` table (in addition to `job_id`)
   - Store `relevance_score` directly in `matches` table

2. **Materialized Views**
   - Create materialized view for user's unlocked matches:
     ```sql
     CREATE MATERIALIZED VIEW user_unlocked_matches AS
     SELECT u.id AS user_id, m.id AS match_id, m.title, m.price, m.image_url, 
            m.seller_info, m.listing_url, ul.unlocked_at
     FROM users u
     JOIN unlocks ul ON u.id = ul.user_id
     JOIN matches m ON ul.match_id = m.id;
     ```
   - Refresh materialized views on a schedule or after relevant updates

3. **Redundant Data**
   - Store `user_id` in `saved_searches` (in addition to `search_id` which references `searches` with `user_id`)
   - Store count of unlocks per match in `matches` table

## Caching Strategy

### Application-Level Caching

1. **Redis Cache**
   - Cache frequently accessed data:
     - User profiles and preferences
     - Active saved searches
     - Recent search results
     - Unlocked match details
   - Set appropriate TTL (Time To Live) for each cache type:
     - User profiles: 1 hour
     - Search results: 5 minutes
     - Unlocked match details: 1 day

2. **Cache Invalidation**
   - Invalidate cache on relevant data changes:
     - User profile cache on profile update
     - Search results cache on new matches
     - Saved search cache on saved search update

### Database-Level Caching

1. **PostgreSQL Query Cache**
   - Configure PostgreSQL's shared_buffers appropriately
   - Monitor cache hit ratio and adjust as needed

2. **Connection Pooling**
   - Use PgBouncer for connection pooling
   - Configure appropriate pool sizes based on workload

## Partitioning Strategy

For tables expected to grow very large:

1. **Time-Based Partitioning for Matches**
   ```sql
   CREATE TABLE matches_partition (
     -- same schema as matches
   ) PARTITION BY RANGE (created_at);
   
   CREATE TABLE matches_y2023m01 PARTITION OF matches_partition
     FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');
   
   CREATE TABLE matches_y2023m02 PARTITION OF matches_partition
     FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');
   ```

2. **User-Based Partitioning for Large Tables**
   - Consider hash partitioning on user_id for very large deployments

## Performance Monitoring

### Key Metrics to Monitor

1. **Query Performance**
   - Average query execution time
   - Slow query count and details
   - Index usage statistics

2. **Database Resource Utilization**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Connection count

3. **Cache Performance**
   - Cache hit ratio
   - Cache size
   - Cache eviction rate

### Monitoring Tools

1. **PostgreSQL Built-in Tools**
   - pg_stat_statements for query statistics
   - pg_stat_activity for active connections
   - pg_stat_user_tables for table statistics
   - pg_stat_user_indexes for index statistics

2. **External Monitoring**
   - Supabase monitoring dashboard
   - Custom monitoring using Prometheus and Grafana
   - Application performance monitoring (APM) tools

### Performance Tuning Process

1. **Regular Review**
   - Weekly review of slow queries
   - Monthly review of index usage
   - Quarterly review of overall database performance

2. **Optimization Cycle**
   - Identify performance bottlenecks
   - Implement targeted optimizations
   - Measure impact
   - Document changes and results

## Potential Bottlenecks and Mitigation

### Write Contention

1. **Issue**: High volume of concurrent writes to the same table
2. **Mitigation**:
   - Use optimistic concurrency control
   - Implement write batching where appropriate
   - Consider table partitioning for high-write tables

### Large Result Sets

1. **Issue**: Queries returning large result sets
2. **Mitigation**:
   - Implement pagination for all list views
   - Use cursor-based pagination for large datasets
   - Limit maximum page size

### Complex Joins

1. **Issue**: Queries with multiple joins becoming slow
2. **Mitigation**:
   - Denormalize where appropriate
   - Create materialized views for complex join queries
   - Optimize join order and conditions

### Index Bloat

1. **Issue**: Indexes becoming bloated over time
2. **Mitigation**:
   - Regular index maintenance (REINDEX)
   - Monitor index size and bloat
   - Consider partial indexes for large tables

## Benchmarking Strategy

### Benchmark Scenarios

1. **Search Creation**
   - Measure time to create a new search
   - Test with various search parameters

2. **Match Retrieval**
   - Measure time to retrieve matches for a search
   - Test with different result set sizes and filter combinations

3. **Unlock Operation**
   - Measure time to process a payment and unlock a match
   - Test with concurrent unlock operations

### Benchmark Methodology

1. **Load Testing**
   - Simulate expected user load
   - Measure response times under various load conditions
   - Identify breaking points

2. **Performance Metrics**
   - Average response time
   - 95th percentile response time
   - Throughput (requests per second)
   - Error rate

3. **Documentation**
   - Document benchmark results
   - Compare against performance targets
   - Track performance changes over time

## Conclusion

This indexing and performance strategy provides a comprehensive approach to ensuring the Snagr AI database performs efficiently under expected loads. By implementing appropriate indexes, query optimizations, caching strategies, and monitoring tools, the system will be able to handle growing data volumes while maintaining responsive performance.

Key recommendations:
1. Implement all specified indexes from the start
2. Use prepared statements and pagination for all queries
3. Implement Redis caching for frequently accessed data
4. Set up comprehensive monitoring
5. Regularly review and optimize slow queries
6. Consider partitioning for tables expected to grow very large

This strategy should be reviewed and updated as the application evolves and as actual usage patterns emerge.