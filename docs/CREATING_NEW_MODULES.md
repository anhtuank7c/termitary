# Creating New API Modules

This guide shows how to create new API modules that automatically use the unified error handling system.

## Quick Start

When creating a new module, the global error handler is already available - you don't need to configure it!

## Example: Creating a Products Module

### 1. Create the Schema

```typescript
// src/modules/products/products.schema.ts
import * as t from 'drizzle-orm/pg-core';
import { timestampUtils } from '../common/timestamp-utils';

export const productsTable = t.pgTable('products', {
  id: t.varchar('id', { length: 36 }).notNull().primaryKey(),
  name: t.varchar('name', { length: 255 }).notNull(),
  description: t.text('description'),
  price: t.decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: t.integer('stock').notNull().default(0),
  createdAt: timestampUtils.createdAt,
  updatedAt: timestampUtils.updatedAt,
});

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
```

### 2. Create DTOs

```typescript
// src/modules/products/dto/create-product.dto.ts
import z from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
```

```typescript
// src/modules/products/dto/update-product.dto.ts
import z from 'zod';

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
```

### 3. Create Repository

```typescript
// src/modules/products/products.repository.ts
import { db } from '../../db';
import { productsTable, type Product, type NewProduct } from './products.schema';
import { eq } from 'drizzle-orm';

export async function createProduct(product: NewProduct): Promise<Product> {
  const [created] = await db.insert(productsTable).values(product).returning();
  return created;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  return product;
}

export async function getAllProducts(): Promise<Product[]> {
  return db.select().from(productsTable);
}

export async function updateProduct(
  id: string,
  updates: Partial<NewProduct>
): Promise<Product | undefined> {
  const [updated] = await db
    .update(productsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(productsTable.id, id))
    .returning();
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning({ id: productsTable.id });
  return result.length > 0;
}
```

### 4. Create Service Layer

```typescript
// src/modules/products/products.service.ts
import {
  createProduct as createProductRepo,
  getProductById as getProductByIdRepo,
  getAllProducts as getAllProductsRepo,
  updateProduct as updateProductRepo,
  deleteProduct as deleteProductRepo,
} from './products.repository';
import { NotFoundError } from '../../common/errors/http-error';
import { generateSecureRandomString } from '../../common/utils/crypto';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

export async function createProduct(data: CreateProductDto) {
  const product = {
    id: generateSecureRandomString(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return createProductRepo(product);
}

export async function getProduct(id: string) {
  const product = await getProductByIdRepo(id);

  if (!product) {
    throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
  }

  return product;
}

export async function getAllProducts() {
  return getAllProductsRepo();
}

export async function updateProduct(id: string, data: UpdateProductDto) {
  // Verify product exists
  await getProduct(id); // Throws NotFoundError if not exists

  const updated = await updateProductRepo(id, data);
  return updated!;
}

export async function deleteProduct(id: string) {
  // Verify product exists
  await getProduct(id); // Throws NotFoundError if not exists

  await deleteProductRepo(id);
}
```

### 5. Create Routes

```typescript
// src/modules/products/products.routes.ts
import { Elysia } from 'elysia';
import * as productService from './products.service';
import { createProductSchema } from './dto/create-product.dto';
import { updateProductSchema } from './dto/update-product.dto';

export const productRoutes = new Elysia({
  name: 'products',
  prefix: '/api/v1/products'
})
  // Get all products
  .get('/', async () => {
    const products = await productService.getAllProducts();
    return {
      success: true,
      data: products,
    };
  }, {
    detail: {
      summary: 'Get all products',
      description: 'Retrieve a list of all products',
      tags: ['Products'],
    },
  })

  // Get product by ID
  .get('/:id', async ({ params, set }) => {
    const product = await productService.getProduct(params.id);
    return {
      success: true,
      data: product,
    };
  }, {
    detail: {
      summary: 'Get product by ID',
      description: 'Retrieve a single product by its ID',
      tags: ['Products'],
    },
  })

  // Create product
  .post('/', async ({ body, set }) => {
    const product = await productService.createProduct(body);
    set.status = 201;
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }, {
    body: createProductSchema,
    detail: {
      summary: 'Create product',
      description: 'Create a new product',
      tags: ['Products'],
    },
  })

  // Update product
  .patch('/:id', async ({ params, body, set }) => {
    const product = await productService.updateProduct(params.id, body);
    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  }, {
    body: updateProductSchema,
    detail: {
      summary: 'Update product',
      description: 'Update an existing product',
      tags: ['Products'],
    },
  })

  // Delete product
  .delete('/:id', async ({ params, set }) => {
    await productService.deleteProduct(params.id);
    set.status = 204;
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }, {
    detail: {
      summary: 'Delete product',
      description: 'Delete a product by ID',
      tags: ['Products'],
    },
  });
```

### 6. Register Routes in Main App

```typescript
// src/index.ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { fromTypes, openapi } from '@elysiajs/openapi';
import { bearer } from '@elysiajs/bearer';
import { authRoutes } from './modules/auth/auth.routes';
import { productRoutes } from './modules/products/products.routes'; // Import new routes
import { errorHandler } from './common/plugins/error-handler.plugin';
import z from 'zod';

const app = new Elysia()
  .use(
    openapi({
      references: fromTypes(),
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
    }),
  )
  .use(bearer())
  .use(cors())
  .use(errorHandler) // Global error handler
  .use(authRoutes)
  .use(productRoutes) // Register new routes
  .get('/', () => 'Hello Termitary')
  .listen(Number(Bun.env.PORT) || 3000);

console.log(`🚀 Termitary API is running at ${app.server?.hostname}:${app.server?.port}`);
```

## Error Handling Examples

The global error handler automatically catches all errors:

### 1. Not Found (404)

```typescript
// Service throws NotFoundError
export async function getProduct(id: string) {
  const product = await getProductByIdRepo(id);
  if (!product) {
    throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
  }
  return product;
}

// Automatic response:
// Status: 404
// Body:
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

### 2. Validation Error (400)

```typescript
// Invalid request body automatically caught by Zod
POST /api/v1/products
{
  "name": "",  // Too short
  "price": -10 // Must be positive
}

// Automatic response:
// Status: 400
// Body:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { /* Zod validation errors */ }
  }
}
```

### 3. Conflict (409)

```typescript
// Check for duplicates
export async function createProduct(data: CreateProductDto) {
  const existing = await getProductByName(data.name);
  if (existing) {
    throw new ConflictError('Product with this name already exists', 'PRODUCT_EXISTS');
  }
  // ...
}

// Automatic response:
// Status: 409
// Body:
{
  "success": false,
  "error": {
    "code": "PRODUCT_EXISTS",
    "message": "Product with this name already exists"
  }
}
```

## Module Structure

```
src/modules/products/
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
├── products.schema.ts
├── products.repository.ts
├── products.service.ts
└── products.routes.ts
```

## Best Practices

1. **Use the service layer for business logic** - Throw errors from services, not routes
2. **Validate at the route level** - Use Zod schemas in route definitions
3. **Use proper HTTP status codes** - Choose the right error class
4. **Always provide error codes** - Makes client-side error handling easier
5. **Keep routes thin** - Delegate logic to services
6. **Use consistent response format** - `{ success, data, message }` or `{ success, error }`

## Testing Your Module

```typescript
// Test file example
import { describe, it, expect } from 'bun:test';

describe('Products API', () => {
  it('should create a product', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Product',
          price: 99.99,
          stock: 10,
        }),
      })
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test Product');
  });

  it('should return 404 for non-existent product', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/products/invalid-id')
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});
```

## Summary

With the global error handler in place, creating new modules is straightforward:

1. Define schemas and DTOs
2. Create repository for database operations
3. Create service layer with business logic (throw errors here)
4. Create routes (keep them thin)
5. Register routes in main app

The error handling is automatic - just throw the appropriate error class and the response will be formatted correctly!
