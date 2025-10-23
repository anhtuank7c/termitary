import { RedisClient } from 'bun';

export const client = new RedisClient(Bun.env.REDIS_URL!);
