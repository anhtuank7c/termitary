This folder contains SQL migrations for the `todos` module.

Notes for MySQL users:
- The original migration used the PostgreSQL extension `uuid-ossp` and the `uuid` column type.
- MySQL does not support that extension. The migration here stores UUIDs as `CHAR(36)` and uses `UUID()` as the default value:

  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID())

- Alternative (more compact) approach: store UUIDs as `BINARY(16)` using `UNHEX(REPLACE(UUID(),'-',''))` and use a BEFORE INSERT trigger to set the value when not provided. This reduces storage size and index length but requires application-level packing/unpacking or SQL helpers.

Example BINARY(16) column and insert trigger (optional):

  id BINARY(16) PRIMARY KEY NOT NULL,
  --
  -- Trigger to set id if missing:
  -- CREATE TRIGGER todos_before_insert BEFORE INSERT ON todos FOR EACH ROW
  -- SET NEW.id = COALESCE(NEW.id, UNHEX(REPLACE(UUID(),'-','')));

Always test migrations against a staging database before applying to production.

Indexing for common queries:
- The migration creates a composite index on `(is_completed, due_date)` to speed up queries that filter by completion status and order by due date (e.g., to find incomplete tasks that are near due).
- Example query using the index:

  SELECT *
  FROM todos
  WHERE is_completed = 0
  ORDER BY due_date ASC
  LIMIT 20;

- Notes:
  - The index column order matters: `(is_completed, due_date)` is ideal when you filter by `is_completed` and then sort by `due_date`.
  - MySQL does not support true partial indexes (index only rows meeting a predicate) prior to v8.0 functional indexed workarounds. Using `is_completed` as the leading column effectively narrows the range for `due_date`.
  - If you frequently query for only incomplete tasks, consider maintaining a separate filtered materialized set or using a generated column + functional index depending on MySQL version and workload.

  Comments table:

  - The migration creates a `comments` table that references `todos(id)` with `ON DELETE CASCADE` so comments are removed when a todo is deleted.
  - Schema highlights:

    - `id` CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID())
    - `todo_id` CHAR(36) NOT NULL (foreign key to `todos.id`)
    - `author` VARCHAR(255) -- optional
    - `body` TEXT NOT NULL
    - `created_at` / `updated_at` DATETIME(6) with automatic timestamps

  - Example: insert a comment for a todo (replace <TODO_ID> with the actual UUID):

    INSERT INTO comments (todo_id, author, body)
    VALUES ('<TODO_ID>', 'Alice', 'This is a helpful comment');

  - Example: get latest comments for a todo:

    SELECT * FROM comments WHERE todo_id = '<TODO_ID>' ORDER BY created_at DESC LIMIT 50;

  - Indexing: the composite index on `(todo_id, created_at DESC)` supports the above query pattern efficiently.
