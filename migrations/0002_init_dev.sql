-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  telegram_id TEXT UNIQUE NOT NULL,
  api_key TEXT,
  api_key_created_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create todos table with relation to users
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,

  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Optional index user_id
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

INSERT INTO users (
  name,
  telegram_id,
  api_key,
  api_key_created_at
) VALUES (
  'Ikhsan',
  '123456789',
  'ed58e6fd-8e18-4ee8-8b9c-4340bf3452e6',
  CURRENT_TIMESTAMP
);

