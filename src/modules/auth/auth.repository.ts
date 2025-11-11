import { eq } from 'drizzle-orm';
import { db } from '../../infrastructure/adapters/database.adapter';
import { Session, sessionTable, SessionWithToken } from './auth.schema';
import { generateSecureRandomString } from './auth.util';

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

export async function createSession(userId: string): Promise<SessionWithToken> {
  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await Bun.password.hash(secret, {
    algorithm: process.env.HASH_ALGORITHM! as Bun.Password.AlgorithmLabel,
  });

  const token = id + '.' + secret;

  const session: SessionWithToken = {
    id,
    userId,
    secretHash,
    createdAt: now,
    token,
  };

  await db.insert(sessionTable).values({
    id: session.id,
    userId: session.userId,
    secretHash: session.secretHash,
    createdAt: session.createdAt,
  });
  return session;
}

export async function validateSessionToken(token: string): Promise<Session | null> {
  const tokenParts = token.split('.');
  if (tokenParts.length !== 2) {
    return null;
  }
  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  const valid = await Bun.password.verify(
    sessionSecret,
    session.secretHash,
    process.env.HASH_ALGORITHM! as Bun.Password.AlgorithmLabel,
  );
  if (!valid) {
    return null;
  }

  return session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const now = new Date();

  const session = await db.query.sessionTable.findFirst({ where: eq(sessionTable.id, sessionId) });
  if (!session) {
    return null;
  }

  // Check expiration
  if (now.getTime() - session.createdAt.getTime() >= sessionExpiresInSeconds * 1000) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}
