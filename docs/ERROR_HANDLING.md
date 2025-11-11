# Error Handling Guide

## Overview

The application uses a unified error handling system that provides consistent error responses across all API endpoints. The error handler is implemented as an Elysia plugin that can be used globally or per-route.

## Architecture

### Error Classes

Located in `src/common/errors/http-error.ts`, these classes provide standard HTTP error responses:

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
} from './common/errors/http-error';
```

| Error Class | Status Code | Use Case |
|-------------|-------------|----------|
| `BadRequestError` | 400 | Invalid request data |
| `UnauthorizedError` | 401 | Authentication required/failed |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource doesn't exist |
| `ConflictError` | 409 | Resource already exists |
| `UnprocessableEntityError` | 422 | Valid request but can't process |
| `InternalServerError` | 500 | Unexpected server error |

### Error Handler Plugin

Located in `src/common/plugins/error-handler.plugin.ts`, this plugin automatically catches and formats all errors.

## Usage

### Global Error Handler

Apply the error handler at the application level (already configured in `src/index.ts`):

```typescript
import { Elysia } from 'elysia';
import { errorHandler } from './common/plugins/error-handler.plugin';

const app = new Elysia()
  .use(errorHandler) // Global error handler
  .use(yourRoutes)
  .listen(3000);
```

### Using in Routes

Once the error handler is applied globally, simply throw error instances in your route handlers:

```typescript
import { Elysia } from 'elysia';
import { NotFoundError, UnauthorizedError } from '../../common/errors/http-error';

export const userRoutes = new Elysia({ prefix: '/api/v1/users' })
  .get('/:id', async ({ params }) => {
    const user = await getUserById(params.id);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return { success: true, data: user };
  })

  .delete('/:id', async ({ params, headers }) => {
    const authToken = headers.authorization;

    if (!authToken) {
      throw new UnauthorizedError('Authentication required', 'AUTH_REQUIRED');
    }

    await deleteUser(params.id);
    return { success: true, message: 'User deleted' };
  });
```

### Module-Level Error Handler (Optional)

You can also apply the error handler at the module level:

```typescript
import { Elysia } from 'elysia';
import { errorHandler } from '../../common/plugins/error-handler.plugin';

export const productRoutes = new Elysia({
  name: 'products',
  prefix: '/api/v1/products'
})
  .use(errorHandler) // Module-level error handler
  .get('/', async () => {
    // Your route logic
  });
```

## Error Response Format

All errors return a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional, for validation errors
  }
}
```

## Error Scenarios

### 1. Custom HTTP Errors

```typescript
// Service layer
import { ConflictError } from '../common/errors/http-error';

export async function createUser(email: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ConflictError('Email already exists', 'EMAIL_EXISTS');
  }
  // ... create user
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already exists"
  }
}
```

### 2. Validation Errors

Zod validation errors are automatically caught:

```typescript
import z from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

export const userRoutes = new Elysia()
  .post('/users', async ({ body }) => {
    // If body doesn't match schema, validation error is thrown automatically
    // ...
  }, {
    body: createUserSchema
  });
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      /* Zod error details */
    }
  }
}
```

### 3. Not Found Errors

```typescript
.get('/users/:id', async ({ params }) => {
  const user = await findUser(params.id);
  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }
  return { success: true, data: user };
});
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

### 4. Authentication Errors

```typescript
import { UnauthorizedError } from '../common/errors/http-error';

export async function requireAuth(token: string) {
  if (!token) {
    throw new UnauthorizedError('Authentication required', 'AUTH_REQUIRED');
  }

  const valid = await validateToken(token);
  if (!valid) {
    throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token"
  }
}
```

### 5. Authorization Errors

```typescript
import { ForbiddenError } from '../common/errors/http-error';

.delete('/users/:id', async ({ params, user }) => {
  if (user.role !== 'admin') {
    throw new ForbiddenError('Admin access required', 'ADMIN_REQUIRED');
  }
  // ...
});
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "code": "ADMIN_REQUIRED",
    "message": "Admin access required"
  }
}
```

## Best Practices

1. **Always use error codes**: Provide a machine-readable error code for client-side handling
   ```typescript
   throw new NotFoundError('User not found', 'USER_NOT_FOUND');
   ```

2. **Use appropriate error classes**: Choose the error class that matches the HTTP status code
   ```typescript
   // Good
   throw new ConflictError('Email exists', 'EMAIL_EXISTS');

   // Bad - wrong status code
   throw new BadRequestError('Email exists', 'EMAIL_EXISTS');
   ```

3. **Handle errors in service layer**: Throw errors from services, not in routes
   ```typescript
   // Good
   // service.ts
   export async function getUser(id: string) {
     const user = await db.findUser(id);
     if (!user) {
       throw new NotFoundError('User not found', 'USER_NOT_FOUND');
     }
     return user;
   }

   // route.ts
   .get('/:id', async ({ params }) => {
     const user = await getUser(params.id);
     return { success: true, data: user };
   });
   ```

4. **Consistent error codes**: Use UPPER_SNAKE_CASE for error codes
   ```typescript
   'USER_NOT_FOUND'
   'EMAIL_EXISTS'
   'INVALID_CREDENTIALS'
   'AUTH_REQUIRED'
   ```

5. **Meaningful messages**: Error messages should be clear and actionable
   ```typescript
   // Good
   throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');

   // Bad
   throw new UnauthorizedError('Error', 'ERR');
   ```

## Environment-Specific Behavior

In production, unexpected errors show a generic message:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

In development, unexpected errors show the actual error message for debugging:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "TypeError: Cannot read property 'id' of undefined"
  }
}
```

## Creating New Modules

When creating new API modules, the error handler is already available globally:

```typescript
// src/modules/products/product.routes.ts
import { Elysia } from 'elysia';
import { NotFoundError, ConflictError } from '../../common/errors/http-error';
import * as productService from './product.service';

export const productRoutes = new Elysia({
  name: 'products',
  prefix: '/api/v1/products'
})
  .get('/:id', async ({ params }) => {
    const product = await productService.getProduct(params.id);
    return { success: true, data: product };
  })
  .post('/', async ({ body }) => {
    const product = await productService.createProduct(body);
    return { success: true, data: product };
  });
```

No need to redefine error handling - it's handled globally!
