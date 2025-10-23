import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { cron } from '@elysiajs/cron';
import { todoRoutes } from "./modules/todos/todos.routes";
import { scanAndNotifyOverdueTasks } from "./modules/todos/todos.cronjob";
import { CRON_PATTERNS } from "./utils/cronjob.util";

const apiV1 = new Elysia({ name: 'v1', prefix: 'api/v1' });
apiV1.use(todoRoutes);

const app = new Elysia()
  .use(cors())
  .use(
    cron({
      name: 'scan-overdue-tasks',
      pattern: CRON_PATTERNS.EVERY_MINUTE,
      run: async () => {
        await scanAndNotifyOverdueTasks();
      }
    })
  )
  .use(apiV1)
  .get('/', () => 'Hello Termitary')
  .listen(3000);

console.log(
  `Termitary is running at ${app.server?.hostname}:${app.server?.port}`
);
