import { client } from '../../../../infrastructure/adapters/redis.adapter';

// Subscribe to todos.created event
await client.subscribe('todos.overdue.check', async (payload: unknown) => {
  console.log('📝 Processing todos.overdue.check event', payload);
});
