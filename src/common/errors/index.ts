/**
 * Error utilities for consistent error handling across the application
 *
 * Usage:
 * ```typescript
 * import { NotFoundError, UnauthorizedError } from '@/common/errors';
 *
 * throw new NotFoundError('User not found', 'USER_NOT_FOUND');
 * ```
 */

export {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
} from './http-error';
