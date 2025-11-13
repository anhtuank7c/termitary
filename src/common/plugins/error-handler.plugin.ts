import { Elysia } from 'elysia';
import { HttpError } from '../errors/http-error';

// @ts-expect-error Need to add type annotation
export const errorHandler = ({ error, code, set }) => {
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
    const fieldPath = (error.valueError.path ?? '').replace('/', '');
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          [fieldPath]: error.valueError.message,
        },
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
};
