-- /D:/projects/personal/termitary/src/modules/todos/migrates/todos.migrate.sql
-- MySQL-compatible migration
-- Converted from PostgreSQL. MySQL does not support the "uuid-ossp" extension.
-- Using CHAR(36) to store UUID strings and UUID() as default (MySQL 8+).
-- Alternatively, for storage/space efficiency you can use BINARY(16) and store UUIDs packed using UNHEX(REPLACE(UUID(),'-',''))
-- and add triggers to set them; the CHAR(36) approach is simplest and most portable.

CREATE TABLE IF NOT EXISTS todos (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed TINYINT(1) NOT NULL DEFAULT 0,
  due_date DATETIME(6),
  priority INT DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
  updated_at DATETIME(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Index to efficiently find incomplete tasks ordered by due date.
-- This composite index supports queries like:
--   SELECT * FROM todos WHERE is_completed = 0 ORDER BY due_date ASC LIMIT 10;
CREATE INDEX IF NOT EXISTS idx_todos_is_completed_due_date ON todos (is_completed, due_date);

-- Index to efficiently find incomplete tasks ordered by due date and priority.
-- This composite index supports queries like:
--   SELECT * FROM todos WHERE is_completed = 0 ORDER BY due_date ASC, priority desc LIMIT 10;
CREATE INDEX IF NOT EXISTS idx_todos_is_completed_due_date_priority ON todos (is_completed, due_date, priority);

-- Comments table: attach comments to each todo item.
-- Uses CHAR(36) for UUID strings to match the `todos.id` column.
CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  todo_id CHAR(36) NOT NULL,
  author VARCHAR(255),
  body TEXT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
  updated_at DATETIME(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_comments_todo FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);

-- Index to fetch comments for a given todo sorted by newest first
CREATE INDEX IF NOT EXISTS idx_comments_todo_created_at ON comments (todo_id, created_at DESC);
