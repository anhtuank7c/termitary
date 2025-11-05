import { generateSecureRandomString } from './auth.util';

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

export async function createSession(userId: string): Promise<SessionWithToken> {
  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await Bun.password.hash(secret, { algorithm: 'argon2id' });

  const token = id + '.' + secret;

  const session: SessionWithToken = {
    id,
    userId,
    secretHash,
    createdAt: now,
    token,
  };

  await sql`INSERT INTO session (id, user_id, secret_hash, created_at) VALUES (${session.id}, ${session.userId}, ${session.secretHash}, ${Math.floor(session.createdAt.getTime() / 1000)})`;

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

  const valid = await Bun.password.verify(sessionSecret, session.secretHash);
  if (!valid) {
    return null;
  }

  return session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const now = new Date();

  const result =
    await sql`SELECT id, user_id, secret_hash, created_at FROM session WHERE id = ${sessionId}`;
  if (result.length !== 1) {
    return null;
  }
  const row = result[0];
  const session: Session = {
    id: row.id,
    userId: row.user_id,
    secretHash: row.secret_hash,
    createdAt: new Date(row.created_at * 1000),
  };

  // Check expiration
  if (now.getTime() - session.createdAt.getTime() >= sessionExpiresInSeconds * 1000) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await sql`DELETE FROM session WHERE id = ${sessionId}`;
}
