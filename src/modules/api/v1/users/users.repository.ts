import { sql } from '../../../../infrastructure/adapters/database.adapter';
import { client } from '../../../../infrastructure/adapters/redis.adapter';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';

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

export async function createUser(userData: Partial<UserEntity>): Promise<UserDto> {
  const [newUser] = await sql`
    INSERT INTO users ${sql(userData)}
    RETURNING *
  `;
  const user = mapToUserDto(newUser);
  const publisher = await client.duplicate();
  publisher.publish('users.created', JSON.stringify(user));
  await publisher.close();
  return user;
}

export async function updateUser(
  id: string,
  userData: Partial<UserEntity>,
): Promise<UserDto | null> {
  const [updatedUser] = await sql`
    UPDATE users
    SET ${sql(userData)}
    WHERE id = ${id}
    RETURNING *
  `;
  return updatedUser ? mapToUserDto(updatedUser) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM users
    WHERE id = ${id}
  `;
  return result.count > 0;
}
