import { client } from '../../infrastructure/adapters/redis.adapter';

// Subscribe to todos.created event
await client.subscribe('users.created', async (payload: unknown) => {
  console.log('📝 Processing users.created event', payload);
});
