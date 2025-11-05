import { createSession } from './auth.repository';
import { SessionWithToken } from './entities/session.entity';

export async function loginUser(
  username: string,
  password: string,
): Promise<SessionWithToken | null> {
  // Placeholder logic for user authentication
  if (username !== 'testuser' || password !== 'password123') {
    throw new Error('Invalid credentials');
  }
  // In a real implementation, create a session in the database
  const session = await createSession('user-id-1');
  return session;
}
