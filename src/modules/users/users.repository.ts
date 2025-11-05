import { eq } from 'drizzle-orm';
import { db } from '../../infrastructure/adapters/database.adapter';
import { User, usersTable } from './users.schema';

export async function getUserById(userId: string): Promise<User | undefined> {
  return db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  return db.query.usersTable.findFirst({ where: eq(usersTable.username, username) });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
}
