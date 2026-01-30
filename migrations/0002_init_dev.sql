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

-- Motivations table: store reusable daily motivation messages
CREATE TABLE IF NOT EXISTS motivations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  language TEXT DEFAULT 'id',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (
  name,
  telegram_id,
  api_key,
  api_key_created_at
) VALUES (
  'Ikhsan',
  '1131652151',
  'ed58e6fd-8e18-4ee8-8b9c-4340bf3452e6',
  CURRENT_TIMESTAMP
);

-- Seed user_notifications for dev user with requested defaults
INSERT INTO user_notifications (
  user_id,
  enable_weather,
  enable_prayer,
  enable_todo_reminder,
  enable_motivation,
  prayer_city_code,
  weather_adm4,
  reminder_todo_time,
  reminder_weather_time,
  reminder_motivation_time,
  timezone
) VALUES (
  '1131652151',
  1, -- weather off
  1, -- prayer off
  1, -- todo reminder ON
  1, -- motivation ON
  "3636638817772e42b59d74cff571fbb3",
  "32.09.37.2007",
  '07:00',
  '06:00',
  '06:30',
  'Asia/Jakarta'
);

INSERT INTO users (
  name,
  telegram_id,
  api_key,
  api_key_created_at
) VALUES (
  'Roger',
  '123456789',
  'a1c4b7d2-91ef-4c2a-9b8f-771c8a2f9abc',
  CURRENT_TIMESTAMP
);

-- Seed user_notifications
INSERT INTO user_notifications (
  user_id,
  enable_weather,
  enable_prayer,
  enable_todo_reminder,
  enable_motivation,
  prayer_city_code,
  weather_adm4,
  reminder_todo_time,
  reminder_weather_time,
  reminder_motivation_time,
  timezone
) VALUES (
  '123456789',
  0, -- weather ON
  0, -- prayer ON
  1, -- todo reminder ON
  1, -- motivation OFF
  NULL,
  NULL,
  '07:00',
  '06:00',
  '06:30',
  'Asia/Jakarta'
);


