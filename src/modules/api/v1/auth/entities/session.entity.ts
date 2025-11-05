export interface Session {
  id: string;
  secretHash: Uint8Array; // Uint8Array is a byte array
  createdAt: Date;
}

export interface SessionWithToken extends Session {
  token: string;
}
