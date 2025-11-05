import * as t from 'drizzle-orm/pg-core';

export const rolesEnum = t.pgEnum('roles', ['accountant', 'sale', 'user', 'admin']);

export const timestampUtils = {
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t.timestamp('updated_at'),
};

export const usersTable = t.pgTable(
  'users',
  {
    id: t.varchar('id', { length: 36 }).notNull().primaryKey(),
    username: t.varchar('username', { length: 50 }).notNull().unique(),
    email: t.varchar({ length: 255 }).notNull().unique(),
    passwordHashed: t.varchar('password_hashed', { length: 255 }).notNull(),
    suspendedAt: t.timestamp('suspended_at'),
    role: rolesEnum().default('user'),
    ...timestampUtils,
  },
  (table) => [
    t.index('idx_users_username').on(table.username),
    t.index('idx_users_email').on(table.email),
  ],
);

export const sessionTable = t.pgTable(
  'session',
  {
    id: t.varchar('id', { length: 36 }).notNull().primaryKey(),
    userId: t
      .varchar('user_id', { length: 36 })
      .notNull()
      .references(() => usersTable.id, { onDelete: 'no action' }),
    secretHash: t.varchar('secret_hash', { length: 255 }).notNull(),
    createdAt: t.timestamp('created_at').notNull(),
  },
  (table) => [t.index('idx_session_user_id').on(table.userId)],
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Session = typeof sessionTable.$inferSelect;
