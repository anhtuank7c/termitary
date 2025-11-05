import Elysia from 'elysia';
import { v1Routes } from './v1/v1.routes';

export const apiRoutes = new Elysia({ name: 'api', prefix: 'api' }).use(v1Routes);
