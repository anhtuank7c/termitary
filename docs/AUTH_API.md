# Authentication API Documentation

## Overview

The authentication API follows RESTful principles with standard HTTP status codes and consistent response formats. It uses the global error handler plugin for unified error handling across the entire application.

## Base URL

```
/api/v1/auth
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
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
    "details": {} // Optional, included for validation errors
  }
}
```

## Endpoints

### 1. Register

Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "session": {
      "id": "session-id",
      "userId": "user-id",
      "createdAt": "2025-11-11T10:00:00.000Z"
    }
  },
  "message": "Registration successful"
}
```

**Error Responses:**

- **400 Bad Request** - Validation error or password mismatch

```json
{
  "success": false,
  "error": {
    "code": "PASSWORD_MISMATCH",
    "message": "Password does not match"
  }
}
```

- **409 Conflict** - Email already exists

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Account with this email already exists"
  }
}
```

### 2. Login

Authenticate an existing user.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "session": {
      "id": "session-id",
      "userId": "user-id",
      "createdAt": "2025-11-11T10:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**

- **400 Bad Request** - Validation error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { /* validation error details */ }
  }
}
```

- **401 Unauthorized** - Invalid credentials

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request (login) |
| 201 | Created | Resource created successfully (register) |
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Valid request but processing failed |
| 500 | Internal Server Error | Server error |

## Error Codes

Custom error codes for better error handling:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `PASSWORD_MISMATCH` | 400 | Passwords don't match |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Validation Rules

### Email
- Must be a valid email format

### Username
- 3-16 characters
- Alphanumeric, hyphens, and underscores only
- Pattern: `^[a-zA-Z0-9_-]{3,16}$`

### Password
- Minimum 8 characters
- Must match confirmPassword on registration

## Security Notes

1. Passwords are hashed using Bun's password hashing with the algorithm specified in `HASH_ALGORITHM` environment variable
2. Session secrets are stored as hashes in the database
3. Sensitive data (password hashes, session secrets) are never returned in API responses
4. Always use HTTPS in production to protect credentials in transit

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md) - Comprehensive guide on the unified error handling system
- [Creating New Modules](./CREATING_NEW_MODULES.md) - Step-by-step guide for creating new API modules with automatic error handling
