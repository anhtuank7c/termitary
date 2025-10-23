import { Elysia } from 'elysia';
import { cron } from '@elysiajs/cron';
import { client } from '../../infrastructure/adapters/redis.adapter';
import { CRON_PATTERNS } from '../../utils/cronjob.util';

console.log('⏰ Setting up todos cron jobs in worker...');

// Create a minimal Elysia instance just for cron jobs
// We need to keep this instance alive for cron jobs to work
const _cronApp = new Elysia().use(
  cron({
    name: 'scan-overdue-tasks',
    pattern: CRON_PATTERNS.EVERY_2_HOURS,
    run: async () => {
      console.log('⏰ Triggering overdue tasks check...');
      // Publish event instead of running the task directly
      const publisher = await client.duplicate();
      await publisher.publish(
        'todos.overdue.check',
        JSON.stringify({ triggeredAt: new Date().toISOString() }),
      );
    },
  }),
);

console.log('✅ Todos Cron jobs scheduled in worker');
