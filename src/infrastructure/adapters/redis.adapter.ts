import { RedisClient } from 'bun';

const client = new RedisClient(Bun.env.REDIS_URL!);

client.onconnect = () => {
  console.log('✅ Connected to Redis server');
};

// Called when disconnected from Redis server
client.onclose = (error) => {
  console.error('❌ Disconnected from Redis server:', error);
};

// https://bun.com/blog/bun-v1.3#built-in-redis-client

export { client };
