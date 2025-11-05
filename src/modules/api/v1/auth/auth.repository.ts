import { SQL } from 'bun';
import { Session, SessionWithToken } from './entities/session.entity';
import { constantTimeEqual, generateSecureRandomString, hashSecret } from './auth.util';

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

export async function createSession(sql: SQL): Promise<SessionWithToken> {
  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);

  const token = id + '.' + secret;

  const session: SessionWithToken = {
    id,
    secretHash,
    createdAt: now,
    token,
  };

  await sql`INSERT INTO session (id, secret_hash, created_at) VALUES (${session.id}, ${session.secretHash}, ${Math.floor(session.createdAt.getTime() / 1000)})`;

  return session;
}

async function validateSessionToken(sql: SQL, token: string): Promise<Session | null> {
  const tokenParts = token.split('.');
  if (tokenParts.length !== 2) {
    return null;
  }
  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = await getSession(sql, sessionId);
  if (!session) {
    return null;
  }

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
  if (!validSecret) {
    return null;
  }

  return session;
}

async function getSession(sql: SQL, sessionId: string): Promise<Session | null> {
  const now = new Date();

  const result = await sql`SELECT id, secret_hash, created_at FROM session WHERE id = ${sessionId}`;
  if (result.length !== 1) {
    return null;
  }
  const row = result[0];
  const session: Session = {
    id: row.id,
    secretHash: row.secret_hash,
    createdAt: new Date(row.created_at * 1000),
  };

  // Check expiration
  if (now.getTime() - session.createdAt.getTime() >= sessionExpiresInSeconds * 1000) {
    await deleteSession(sql, sessionId);
    return null;
  }

  return session;
}

async function deleteSession(sql: SQL, sessionId: string): Promise<void> {
  await sql`DELETE FROM session WHERE id = ${sessionId}`;
}

// Example usage (for testing purposes)
// (async () => {
//     // This is just to avoid "unused function" errors during development
//     const dummySql = new SQL("sqlite::memory:");
//     await dummySql`CREATE TABLE session (id TEXT PRIMARY KEY, secret_hash BLOB, created_at INTEGER)`;
//     const newSession = await createSession(dummySql);
//     console.log("Created session:", newSession);
//     const validatedSession = await validateSessionToken(dummySql, newSession.token);
//     console.log("Validated session:", validatedSession);
//     await deleteSession(dummySql, newSession.id);
//     console.log("Deleted session:", newSession.id);
// })();
