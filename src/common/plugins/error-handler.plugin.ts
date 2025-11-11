import { Elysia } from 'elysia';
import { HttpError } from '../errors/http-error';

/**
 * Global error handler plugin for consistent error responses across all APIs
 *
 * Features:
 * - Handles custom HttpError instances with appropriate status codes
 * - Handles validation errors (400 Bad Request)
 * - Handles unknown errors (500 Internal Server Error)
 * - Provides consistent error response format
 *
 * Usage:
 * ```ts
 * const app = new Elysia()
 *   .use(errorHandler)
 *   .get('/example', () => {
 *     throw new UnauthorizedError('Authentication required');
 *   });
 * ```
 */
export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ code, error, set }) => {
    console.warn(`onError: ${code}`, error);
    // Handle HttpError instances
    if (error instanceof HttpError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: {
          code: error.code || code,
          message: error.message,
        },
      };
    }

    // Handle validation errors
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error,
        },
      };
    }

    // Handle NOT_FOUND errors
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      };
    }

    // Handle PARSE errors (invalid JSON, etc.)
    if (code === 'PARSE') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Invalid request body',
        },
      };
    }

    // Log unexpected errors for debugging
    console.error('Unexpected error:', error);

    // Handle unknown errors
    set.status = 500;
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message || 'An unexpected error occurred',
      },
    };
  },
);
