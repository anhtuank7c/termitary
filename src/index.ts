import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { todoRoutes } from "./modules/todos/todos.routes";

const app = new Elysia();

app.use(cors());

const apiV1 = new Elysia({ name: 'v1', prefix: 'api/v1' });
apiV1.use(todoRoutes);

app.use(apiV1);
app.listen(3000);

console.log(
  `Termitary is running at ${app.server?.hostname}:${app.server?.port}`
);
