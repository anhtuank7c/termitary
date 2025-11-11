import * as t from 'drizzle-orm/pg-core';
import { timestampUtils, usersTable } from '../users/users.schema';

export const sessionTable = t.pgTable(
  'session',
  {
    id: t.varchar('id', { length: 36 }).notNull().primaryKey(),
    userId: t
      .varchar('user_id', { length: 36 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'no action' }),
    secretHash: t.varchar('secret_hash', { length: 255 }).notNull(),
    createdAt: timestampUtils.createdAt,
  },
  (table) => [t.index('idx_session_user_id').on(table.userId)],
);

export type Session = typeof sessionTable.$inferSelect;
export type SessionWithToken = Session & { token: string };
export type SessionWithoutHash = Omit<Session, 'secretHash'>;
