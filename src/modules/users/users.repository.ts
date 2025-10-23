import { sql } from '../../infrastructure/adapters/database.adapter';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';

function mapToUserDto(dbRecord: UserEntity): UserDto {
  return {
    id: dbRecord.id,
    username: dbRecord.username,
    email: dbRecord.email,
    firstName: dbRecord.firstName,
    lastName: dbRecord.lastName,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  } as UserDto;
}

export async function findUserByEmail(email: string): Promise<UserDto | null> {
  const user = await sql`SELECT * FROM users WHERE email = ${email}`;
  return user.length ? mapToUserDto(user[0]) : null;
}

export async function findUserByUsernam(username: string): Promise<UserDto | null> {
  const user = await sql`SELECT * FROM users WHERE username = ${username}`;
  return user.length ? mapToUserDto(user[0]) : null;
}

export async function findAll(): Promise<UserDto[]> {
  const users = await sql`SELECT * FROM users`;
  return users.map(mapToUserDto);
}
