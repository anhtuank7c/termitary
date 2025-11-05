import { createUser, getUserByEmail } from '../users/users.repository';
import { NewUser } from '../users/users.schema';
import { createSession } from './auth.repository';
import { SessionWithToken } from './auth.schema';
import { generateSecureRandomString } from './auth.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export async function login({ email, password }: LoginDto): Promise<SessionWithToken | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('User does not exist');
  }
  const passwordValid = await Bun.password.verify(
    password,
    user.passwordHashed,
    process.env.HASH_ALGORITHM! as Bun.Password.AlgorithmLabel,
  );
  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }
  const session = await createSession(user.id);
  return session;
}

export async function register(params: RegisterDto) {
  const user = await getUserByEmail(params.email);
  if (user) {
    throw new Error('Account with this email already exist');
  }
  if (params.password !== params.confirmPassword) {
    throw new Error('Password does not match');
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
