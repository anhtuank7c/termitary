# Termitary API Documentation

Welcome to the Termitary API documentation. This guide provides comprehensive information about the API structure, error handling, and how to create new modules.

## Documentation Index

### 📚 Core Concepts

- **[Error Handling Guide](./ERROR_HANDLING.md)** - Complete guide on the unified error handling system
  - Error classes and HTTP status codes
  - Global error handler plugin
  - Usage examples and best practices
  - Environment-specific behavior

### 🔐 API Modules

- **[Authentication API](./AUTH_API.md)** - RESTful authentication endpoints
  - Login and registration
  - Request/response formats
  - Error codes and status codes
  - Validation rules

### 🛠️ Development Guides

- **[Creating New Modules](./CREATING_NEW_MODULES.md)** - Step-by-step guide for building new API modules
  - Module structure and organization
  - Using the global error handler
  - Example: Products module
  - Testing strategies

## Quick Start

### Project Structure

```
src/
├── common/
│   ├── errors/
│   │   └── http-error.ts           # HTTP error classes
│   ├── plugins/
│   │   └── error-handler.plugin.ts # Global error handler
│   └── schemas/
│       └── response.schema.ts       # Response type definitions
├── modules/
│   └── auth/
│       ├── dto/                     # Data transfer objects
│       ├── auth.schema.ts           # Database schema
│       ├── auth.repository.ts       # Database operations
│       ├── auth.service.ts          # Business logic
│       └── auth.routes.ts           # API routes
└── index.ts                         # Application entry point
```

### Key Features

1. **Unified Error Handling** - Global error handler ensures consistent error responses across all endpoints
2. **RESTful Design** - Follows REST principles with proper HTTP methods and status codes
3. **Type Safety** - Zod schemas for runtime validation with TypeScript types
4. **Modular Architecture** - Clean separation of concerns (routes, services, repositories)
5. **OpenAPI Documentation** - Auto-generated API documentation

### Response Format

All API endpoints return a consistent JSON structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful request with no body |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Valid request but can't process |
| 500 | Internal Server Error | Server error |

### Available Error Classes

```typescript
import {
  BadRequestError,        // 400
  UnauthorizedError,      // 401
  ForbiddenError,         // 403
  NotFoundError,          // 404
  ConflictError,          // 409
  UnprocessableEntityError, // 422
  InternalServerError,    // 500
} from './common/errors/http-error';
```

## Development Workflow

### Creating a New API Module

1. **Define Schema** - Create database schema using Drizzle ORM
2. **Create DTOs** - Define Zod schemas for validation
3. **Build Repository** - Implement database operations
4. **Write Service** - Add business logic (throw errors here)
5. **Create Routes** - Define API endpoints (keep them thin)
6. **Register Routes** - Add to main application

See [Creating New Modules](./CREATING_NEW_MODULES.md) for detailed instructions.

### Error Handling Pattern

```typescript
// Service Layer (src/modules/example/example.service.ts)
import { NotFoundError } from '../../common/errors/http-error';

export async function getExample(id: string) {
  const example = await repository.findById(id);

  if (!example) {
    throw new NotFoundError('Example not found', 'EXAMPLE_NOT_FOUND');
  }

  return example;
}

// Route Layer (src/modules/example/example.routes.ts)
import { Elysia } from 'elysia';
import * as exampleService from './example.service';

export const exampleRoutes = new Elysia({ prefix: '/api/v1/examples' })
  .get('/:id', async ({ params }) => {
    const example = await exampleService.getExample(params.id);
    return { success: true, data: example };
  });
```

**No error handling code needed in routes** - the global error handler catches everything!

## API Versioning

Current API version: `v1`

All endpoints are prefixed with `/api/v1/`:
- `/api/v1/auth/login`
- `/api/v1/auth/register`
- `/api/v1/products/*` (example)

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://...
HASH_ALGORITHM=argon2id
NODE_ENV=development|production
```

## Testing

Run tests with:
```bash
bun test
```

## Running the Application

Development:
```bash
bun run src/index.ts
```

Build:
```bash
bun build src/index.ts --outdir ./dist
```

Production:
```bash
NODE_ENV=production bun run dist/index.js
```

## Best Practices

1. **Always use error codes** - Provide machine-readable codes for client handling
2. **Throw errors in services** - Not in routes
3. **Keep routes thin** - Delegate logic to services
4. **Use appropriate HTTP status codes** - Choose the right error class
5. **Validate at the route level** - Use Zod schemas in route definitions
6. **Never expose sensitive data** - Filter response data appropriately
7. **Log unexpected errors** - For debugging and monitoring

## Contributing

When adding new features:

1. Follow the existing module structure
2. Use the global error handler (don't create custom error handling)
3. Add comprehensive tests
4. Update relevant documentation
5. Use standard HTTP status codes
6. Provide clear error messages and codes

## Support

For questions or issues:
- Check the documentation in the `docs/` folder
- Review existing modules for examples
- Refer to the error handling guide for common scenarios

---

**Happy coding!** 🚀
