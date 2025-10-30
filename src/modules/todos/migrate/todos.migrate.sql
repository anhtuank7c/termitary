-- MySQL-compatible migration for todos
-- Using CHAR(36) to store UUID strings and UUID() as default (MySQL 8+).

CREATE TABLE IF NOT EXISTS todos (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  due_date DATETIME(3),
  completed_at DATETIME(3),
  creator_id CHAR(36) NOT NULL,
  assignee_id CHAR(36),
  created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Index to efficiently find tasks by priority
CREATE INDEX idx_todos_priority ON todos (priority);

-- Index to find todos by creator
CREATE INDEX idx_todos_creator_id ON todos (creator_id);

-- Composite index for assignee queries with sorting by created_at
-- Useful for: WHERE assignee_id = 'xxx' ORDER BY created_at DESC
CREATE INDEX idx_todos_assignee_created ON todos (assignee_id, created_at);

-- Comments table: attach comments to each todo item.
-- Uses CHAR(36) for UUID strings to match the `todos.id` column.
CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) PRIMARY KEY NOT NULL DEFAULT (UUID()),
  todo_id CHAR(36) NOT NULL,
  author VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_comments_todo FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);

-- Index to fetch comments for a given todo sorted by newest first
CREATE INDEX idx_comments_todo_created_at ON comments (todo_id, created_at DESC);
