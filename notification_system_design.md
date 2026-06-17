# Notification System Design

## Stage 1: REST API Design

### API Endpoints

1. `GET /notifications?limit={n}`
   - Description: Return top N notifications in priority order.
   - Query Parameters:
     - `limit` (optional, integer): number of notifications to return. Default = 10.
   - Response:
     ```json
     {
       "notifications": [
         {
           "ID": "...",
           "Type": "Placement|Result|Event",
           "Message": "...",
           "Timestamp": "YYYY-MM-DD HH:mm:ss"
         }
       ]
     }
     ```

2. `GET /notifications/all`
   - Description: Return all notifications without trimming.
   - Response:
     ```json
     {
       "notifications": [ ... ]
     }
     ```

3. `POST /notifications` (optional enhancement)
   - Description: Add a new notification.
   - Request Body:
     ```json
     {
       "Type": "Placement|Result|Event",
       "Message": "...",
       "Timestamp": "2026-04-22 17:51:30"
     }
     ```
   - Response:
     ```json
     { "success": true, "ID": "..." }
     ```

4. `GET /notifications/priority-inbox?limit={n}` (alternative to `/notifications`)
   - Description: Return the top N notifications by priority and recency.
   - Response format same as `/notifications`.

---

## Stage 2: Database Design

### Recommended database

- Use a relational database like **PostgreSQL** for notification metadata and query flexibility.
- If the data is large and mostly read-heavy, use **Redis** as a caching layer on top of PostgreSQL.

### Table schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  priority INT NOT NULL,
  user_id UUID NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Priority mapping

- `Placement` => 3
- `Result` => 2
- `Event` => 1

### Example query: insert notification

```sql
INSERT INTO notifications (type, message, timestamp, priority)
VALUES ('Placement', 'CSX Corporation hiring', '2026-04-22 17:51:18', 3);
```

---

## Stage 3: Optimized query for placement notifications in last 7 days

### Slow query fix

A slow query is often caused by full table scans or missing indexes.

### Add indexes

```sql
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX idx_notifications_priority_timestamp ON notifications(priority DESC, timestamp DESC);
```

### Optimized query

```sql
SELECT id, type, message, timestamp
FROM notifications
WHERE type = 'Placement'
  AND timestamp >= NOW() - INTERVAL '7 days'
ORDER BY priority DESC, timestamp DESC
LIMIT 50;
```

---

## Stage 4: Caching strategy

### Problem
Repeated page loads and inbox refreshes cause repeated DB queries.

### Solution
- Use **Redis** as a caching layer.
- Cache the top N notifications for each user or for a global feed.
- Example cache key: `notifications:priority:top:10`

### Cache workflow
1. Query Redis cache first.
2. If cache miss, query PostgreSQL.
3. Store the result in Redis for a short TTL (e.g. 30 seconds).
4. Invalidate/update cache when new notifications are inserted.

### Benefits
- Reduces load on primary database
- Improves response time for inbox loads
- Avoids repeated sorting work in DB for highly frequent reads

---

## Stage 5: Reliable notify_all design for 50,000 students

### Problem with naive approach
- Sending emails/messages sequentially blocks and fails if one request times out.
- `notify_all` for 50,000 users must be scalable and reliable.

### Reliable design
1. Use a **message queue** (RabbitMQ, AWS SQS, or Apache Kafka).
2. Split notification delivery into many small tasks.
3. Use worker consumers to process each message.
4. Track delivery status in a `notification_deliveries` table.

### Pseudocode

```js
function notifyAll(studentIds, message) {
  for (const studentId of studentIds) {
    queue.publish('notification-delivery', {
      studentId,
      message,
      notificationId,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Key points
- Use asynchronous queue processing
- Retry failed deliveries
- Store delivery status separately
- Use batching to keep throughput high

---

## Stage 6: Priority inbox implementation

### Priority rules
- `Placement` > `Result` > `Event`
- Newer notifications appear first within same priority

### Implementation logic

1. Fetch notifications from external service.
2. Assign priority values.
3. Sort by priority descending, then timestamp descending.
4. Return the top N results.

### Example endpoint behavior

`GET /notifications?limit=5`

Response:
```json
{
  "notifications": [
    { "ID": "...", "Type": "Placement", "Message": "...", "Timestamp": "..." },
    ...
  ]
}
```

---

## Notes on repository structure

- Keep each question in a separate folder:
  - `vehicle_scheduling_be/`
  - `campus_notifications/`
- Avoid pushing `node_modules/` or `.DS_Store`
- Use `main` branch only
- Use `vtu25330` repo only
