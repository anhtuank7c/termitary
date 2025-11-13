import { createUser, getUserByEmail } from '../users/users.repository';
import { NewUser, UserDTO } from '../users/users.schema';
import { createSession } from './auth.repository';
import { SessionWithoutHash } from './auth.schema';
import { generateSecureRandomString } from './auth.util';
import { LoginDto } from './validation/login.validation';
import { RegisterDto } from './validation/register.validation';
import { UnauthorizedError, ConflictError } from '../../common/errors/http-error';

export async function login({ email, password }: LoginDto): Promise<{
  session: SessionWithoutHash;
  user: UserDTO;
}> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }
  const passwordValid = await Bun.password.verify(
    password,
    user.passwordHashed,
    process.env.HASH_ALGORITHM! as Bun.Password.AlgorithmLabel,
  );
  if (!passwordValid) {
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }
  const session = await createSession(user.id);

  return { session, user };
}

export async function register(params: RegisterDto) {
  const user = await getUserByEmail(params.email);
  if (user) {
    throw new ConflictError('Account with this email already exists', 'EMAIL_EXISTS');
  }

  const passwordHashed = await Bun.password.hash(params.password, {
    algorithm: process.env.HASH_ALGORITHM! as Bun.Password.AlgorithmLabel,
  });
  const newUser: NewUser = {
    id: generateSecureRandomString(),
    email: params.email,
    username: params.username,
    passwordHashed,
    createdAt: new Date(),
  };
  await createUser(newUser);
  const session = await createSession(newUser.id);
  return { session, user: newUser };
}
