/**
 * Common plugins for the Elysia application
 *
 * Usage:
 * ```typescript
 * import { errorHandler } from '@/common/plugins';
 *
 * const app = new Elysia()
 *   .use(errorHandler)
 *   .listen(3000);
 * ```
 */

export { errorHandler } from './error-handler.plugin';
