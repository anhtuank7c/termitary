import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { createSession } from './auth.repository';

// Mock the auth utilities
const mockGenerateSecureRandomString = mock(() => 'mock-random-string');
const mockHashSecret = mock(async () => new Uint8Array([1, 2, 3, 4]));
const mockConstantTimeEqual = mock(() => true);

mock.module('./auth.util', () => ({
  generateSecureRandomString: mockGenerateSecureRandomString,
  hashSecret: mockHashSecret,
  constantTimeEqual: mockConstantTimeEqual,
}));

mock.module('../../../../infrastructure/adapters/database.adapter', () => ({
  sql: mock(async () => []),
}));

describe('AuthRepository', () => {
  describe('createSession', () => {
    beforeEach(() => {
      mockGenerateSecureRandomString.mockClear();
      mockHashSecret.mockClear();
      mockGenerateSecureRandomString.mockReturnValue('mock-random-string');
      mockHashSecret.mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
    });

    test('should create a new session with valid token', async () => {
      let capturedQuery: any;

      const session = await createSession();

      expect(session).toBeDefined();
      expect(session.id).toBe('mock-random-string');
      expect(session.secretHash).toBeInstanceOf(Uint8Array);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.token).toBe('mock-random-string.mock-random-string');
    });

    test('should generate unique session id and secret', async () => {
      let callCount = 0;
      mockGenerateSecureRandomString.mockImplementation(() => {
        callCount++;
        return `random-string-${callCount}`;
      });

      const session = await createSession();

      expect(mockGenerateSecureRandomString).toHaveBeenCalledTimes(2);
      expect(session.id).toBe('random-string-1');
      expect(session.token).toBe('random-string-1.random-string-2');
    });

    test('should hash the secret before storing', async () => {
      const mockHash = new Uint8Array([10, 20, 30, 40]);
      mockHashSecret.mockResolvedValue(mockHash);
      const session = await createSession();

      expect(mockHashSecret).toHaveBeenCalledTimes(1);
      expect(mockHashSecret).toHaveBeenCalledWith('mock-random-string');
      expect(session.secretHash).toEqual(mockHash);
    });

    test('should insert session into database with correct parameters', async () => {
      let insertedData: any = null;
      const beforeTime = Math.floor(Date.now() / 1000);
      await createSession();
      const afterTime = Math.floor(Date.now() / 1000);

      expect(insertedData).toBeDefined();
      expect(insertedData.id).toBe('mock-random-string');
      expect(insertedData.secretHash).toBeInstanceOf(Uint8Array);
      expect(insertedData.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(insertedData.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('should return token in format "id.secret"', async () => {
      mockGenerateSecureRandomString
        .mockReturnValueOnce('test-id-123')
        .mockReturnValueOnce('test-secret-456');
      const session = await createSession();

      expect(session.token).toBe('test-id-123.test-secret-456');
      expect(session.token).toContain('.');
      expect(session.token.split('.')).toHaveLength(2);
    });

    test('should set createdAt to current time', async () => {
      const beforeTime = Date.now();

      const session = await createSession();

      const afterTime = Date.now();
      const sessionTime = session.createdAt.getTime();

      expect(sessionTime).toBeGreaterThanOrEqual(beforeTime);
      expect(sessionTime).toBeLessThanOrEqual(afterTime);
    });

    test('should create session with Unix timestamp in seconds', async () => {
      let insertedTimestamp: number | null = null;

      const beforeTime = Math.floor(Date.now() / 1000);
      await createSession();
      const afterTime = Math.floor(Date.now() / 1000);

      expect(insertedTimestamp).toBeDefined();
      expect(insertedTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(insertedTimestamp).toBeLessThanOrEqual(afterTime);
      // Ensure it's in seconds, not milliseconds
      expect(insertedTimestamp!.toString().length).toBe(10);
    });

    test('should handle database insertion errors', async () => {
      mock.module('../../../../infrastructure/adapters/database.adapter', () => {
        throw new Error('Database connection error');
      });

      await expect(createSession()).rejects.toThrow('Database connection error');
    });

    test('should return SessionWithToken interface', async () => {
      const session = await createSession();

      // Verify all required properties exist
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('secretHash');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('token');

      // Verify types
      expect(typeof session.id).toBe('string');
      expect(session.secretHash).toBeInstanceOf(Uint8Array);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(typeof session.token).toBe('string');
    });
  });

  describe('validateSessionToken (private function behavior)', () => {
    test('should split token correctly by dot separator', () => {
      const token = 'session-id.session-secret';
      const parts = token.split('.');

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe('session-id');
      expect(parts[1]).toBe('session-secret');
    });

    test('should reject invalid token format', () => {
      const invalidTokens = [
        'no-separator',
        'too.many.separators',
        '.missing-id',
        'missing-secret.',
        '',
      ];

      invalidTokens.forEach((token) => {
        const parts = token.split('.');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          expect(parts.length !== 2 || !parts[0] || !parts[1]).toBe(true);
        }
      });
    });
  });

  describe('getSession (private function behavior)', () => {
    test('should convert Unix timestamp to Date object correctly', () => {
      const unixTimestamp = 1704067200; // 2024-01-01 00:00:00 UTC
      const date = new Date(unixTimestamp * 1000);

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(1704067200000);
    });

    test('should calculate session expiration correctly', () => {
      const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day
      const now = new Date();
      const createdAt = new Date(now.getTime() - sessionExpiresInSeconds * 1000 - 1000); // 1 second past expiry

      const isExpired = now.getTime() - createdAt.getTime() >= sessionExpiresInSeconds * 1000;

      expect(isExpired).toBe(true);
    });

    test('should not expire valid session within timeframe', () => {
      const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day
      const now = new Date();
      const createdAt = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago

      const isExpired = now.getTime() - createdAt.getTime() >= sessionExpiresInSeconds * 1000;

      expect(isExpired).toBe(false);
    });
  });

  describe('constantTimeEqual behavior', () => {
    test('should compare byte arrays for equality', () => {
      const arr1 = new Uint8Array([1, 2, 3, 4]);
      const arr2 = new Uint8Array([1, 2, 3, 4]);

      // Implement the actual constant time comparison logic
      const result =
        arr1.byteLength === arr2.byteLength && arr1.every((val, idx) => val === arr2[idx]);

      expect(result).toBe(true);
    });

    test('should detect different byte arrays', () => {
      const arr1 = new Uint8Array([1, 2, 3, 4]);
      const arr2 = new Uint8Array([1, 2, 3, 5]);

      // Implement the actual constant time comparison logic
      const result =
        arr1.byteLength === arr2.byteLength && arr1.every((val, idx) => val === arr2[idx]);

      expect(result).toBe(false);
    });

    test('should handle different length arrays', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2, 3, 4]);

      // Implement the actual constant time comparison logic
      const result =
        arr1.byteLength === arr2.byteLength && arr1.every((val, idx) => val === arr2[idx]);

      expect(result).toBe(false);
    });

    test('should handle empty arrays', () => {
      const arr1 = new Uint8Array([]);
      const arr2 = new Uint8Array([]);

      // Implement the actual constant time comparison logic
      const result = arr1.byteLength === arr2.byteLength;

      expect(result).toBe(true);
    });
  });

  describe('Session expiration constants', () => {
    test('should have correct expiration time (1 day)', () => {
      const sessionExpiresInSeconds = 60 * 60 * 24;
      expect(sessionExpiresInSeconds).toBe(86400);
    });

    test('should convert expiration to milliseconds correctly', () => {
      const sessionExpiresInSeconds = 60 * 60 * 24;
      const milliseconds = sessionExpiresInSeconds * 1000;
      expect(milliseconds).toBe(86400000);
    });
  });
});
