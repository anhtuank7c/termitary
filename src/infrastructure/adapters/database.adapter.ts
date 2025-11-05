import { SQL } from 'bun';

export const sql = new SQL(Bun.env.DATABASE_URL!, {
  // Pool configuration
  max: 20, // Maximum 20 concurrent connections
  idleTimeout: 30, // Close idle connections after 30s
  maxLifetime: 3600, // Max connection lifetime 1 hour
  connectionTimeout: 10, // Connection timeout 10s
});
