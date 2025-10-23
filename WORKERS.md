# Worker System Documentation

## Overview

The Termitary application uses a **worker instance architecture** that separates heavy background tasks from the main API server. Workers communicate with the Elysia application via **Redis pub/sub events**, avoiding overhead on the main Bun process.

## Architecture

```
┌─────────────────┐           ┌──────────────┐
│  Elysia API     │  pub/sub  │    Redis     │
│  (src/index.ts) │◄─────────►│              │
└─────────────────┘           └──────────────┘
                                      ▲
                                      │ pub/sub
                                      ▼
                              ┌──────────────┐
                              │   Workers    │
                              │ (src/worker) │
                              │              │
                              │ - Cron Jobs  │
                              │ - Events     │
                              │ - Tasks      │
                              └──────────────┘
```

## Setup

### 1. Install Redis

Make sure you have Redis running locally or remotely:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
# macOS: brew install redis
# Ubuntu: apt-get install redis-server
# Windows: Use WSL or Docker
```

### 2. Configure Redis Connection

Create a `.env` file in the project root:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, leave empty if no password
```

### 3. Run the Application

You need to run both the API server and worker instances:

**Terminal 1 - API Server:**
```bash
bun run dev
# or
bun run start
```

**Terminal 2 - Worker Instance:**
```bash
bun run worker
# or
bun run start:worker
```

## Events

### Available Events

#### Todos Events

- **`todos.created`** - Triggered when a new todo is created
  ```typescript
  {
    id: string;
    title: string;
    description?: string;
    assignee?: string;
    priority?: string;
    dueDate?: string;
  }
  ```

- **`todos.updated`** - Triggered when a todo is updated
  ```typescript
  {
    id: string;
    title: string;
    changes: object;
  }
  ```

- **`todos.deleted`** - Triggered when a todo is deleted
  ```typescript
  {
    id: string;
    title: string;
  }
  ```

- **`todos.overdue.check`** - Triggered by cron job to check overdue tasks
  ```typescript
  {
    triggeredAt: string; // ISO timestamp
  }
  ```

#### Users Events

- **`users.created`** - Triggered when a new user is created
  ```typescript
  {
    id: string;
    email: string;
    name: string;
  }
  ```

- **`users.updated`** - Triggered when a user is updated
  ```typescript
  {
    id: string;
    email: string;
    changes: object;
  }
  ```

- **`users.deleted`** - Triggered when a user is deleted
  ```typescript
  {
    id: string;
    email: string;
  }
  ```

- **`users.login`** - Triggered when a user logs in
  ```typescript
  {
    userId: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
  }
  ```

## Creating New Workers

### 1. Create a Worker Subscriber

Create a new file in `src/workers/<module>/<module>.worker.ts`:

```typescript
import eventBus from '../../infrastructure/events';
import type { EventPayload } from '../../infrastructure/events';

// Subscribe to an event
eventBus.subscribe('your.event.name', async (payload: EventPayload) => {
  console.log('Processing event:', payload);

  try {
    // Your worker logic here
    // - Send emails
    // - Process data
    // - Update cache
    // - Call external APIs

    console.log('✅ Event processed successfully');
  } catch (error) {
    console.error('❌ Error processing event:', error);
  }
});

console.log('✅ Your workers registered');
```

### 2. Register the Worker

Add your worker to `src/worker.ts`:

```typescript
import './workers/your-module/your-module.worker';
```

### 3. Publish Events from API

In your route handler:

```typescript
import eventBus from '../../infrastructure/events';

// Inside your route handler
await eventBus.publish('your.event.name', {
  // your event payload
});
```

## Cron Jobs

Cron jobs are now handled by workers in `src/workers/cron-scheduler.ts`.

### Adding New Cron Jobs

```typescript
import { cron } from '@elysiajs/cron';
import eventBus from '../infrastructure/events';

.use(
  cron({
    name: 'your-cron-job',
    pattern: '0 0 * * *', // Daily at midnight
    run: async () => {
      // Publish an event instead of running logic directly
      await eventBus.publish('your.scheduled.event', {
        triggeredAt: new Date().toISOString(),
      });
    },
  }),
)
```

## Production Deployment

### Using Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start API server
pm2 start --name "termitary-api" bun -- run start

# Start worker (can run multiple instances)
pm2 start --name "termitary-worker-1" bun -- run start:worker
pm2 start --name "termitary-worker-2" bun -- run start:worker

# View logs
pm2 logs
```

### Using Docker Compose

```yaml
version: '3.8'

services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  api:
    build: .
    command: bun run start
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis

  worker:
    build: .
    command: bun run start:worker
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    # Scale workers: docker-compose up --scale worker=3
```

## Benefits

✅ **Separation of Concerns** - API handles requests, workers handle background tasks
✅ **Scalability** - Run multiple worker instances independently
✅ **Reliability** - Workers can fail and restart without affecting API
✅ **Performance** - No blocking operations in the main API process
✅ **Flexibility** - Easy to add/modify background jobs
✅ **Monitoring** - Independent logs and metrics for API and workers

## Troubleshooting

### Worker not receiving events

1. Check Redis connection:
   ```bash
   redis-cli ping
   ```

2. Verify Redis configuration in `.env`

3. Check worker logs for subscription confirmations

### Events being missed

- Ensure worker is running before publishing events
- Redis pub/sub doesn't persist messages - consider using Redis Streams for critical events

### Multiple workers processing same event

- This is expected with pub/sub - all subscribed workers will receive the event
- Use Redis queues (Bull, BullMQ) if you need exactly-once processing
