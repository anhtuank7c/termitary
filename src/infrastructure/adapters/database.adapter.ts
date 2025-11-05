import { drizzle } from 'drizzle-orm/bun-sql';
import { sessionTable } from '../../modules/auth/auth.schema';
import { usersTable } from '../../modules/users/users.schema';

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
    max: 20,
    idleTimeout: 30,
    maxLifetime: 3600,
  },
  schema: {
    usersTable,
    sessionTable,
  },
});
