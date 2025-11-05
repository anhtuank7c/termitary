import { getUserByUsername } from '../users/users.repository';
import { createSession } from './auth.repository';
import { SessionWithToken } from './entities/session.entity';

export async function loginUser(
  username: string,
  password: string,
): Promise<SessionWithToken | null> {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error('User does not exist');
  }
  // TODO: need implement
  // In a real implementation, create a session in the database
  const session = await createSession(user.id);
  return session;
}
