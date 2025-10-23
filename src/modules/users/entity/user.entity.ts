export interface UserEntity {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}