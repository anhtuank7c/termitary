import { drizzle } from 'drizzle-orm/bun-sql';

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
    max: 20,
    idleTimeout: 30,
    maxLifetime: 3600,
  },
});
