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

-- Migration: 0003_user_notifications.sql
-- Simple related table for per-user notification settings

CREATE TABLE IF NOT EXISTS user_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  -- default toggles: todo and motivation ON, others OFF
  enable_weather INTEGER DEFAULT 0,
  enable_prayer INTEGER DEFAULT 0,
  enable_todo_reminder INTEGER DEFAULT 1,
  enable_motivation INTEGER DEFAULT 1,
  -- location codes for external APIs
  prayer_city_code TEXT,
  weather_adm4 TEXT,
  -- separate reminder times per feature (HH:MM)
  reminder_todo_time TEXT DEFAULT '07:00',
  reminder_weather_time TEXT DEFAULT '06:00',
  reminder_motivation_time TEXT DEFAULT '06:30',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
