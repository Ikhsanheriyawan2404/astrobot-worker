-- Disable foreign key checks
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS user_notifications;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;
