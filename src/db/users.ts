export const userQueries = {
  getAll: (db: D1Database) => 
    db.prepare("SELECT * FROM users ORDER BY created_at DESC").all(),

  getById: (db: D1Database, id: string) => 
    db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first(),

  getByTelegramId: (db: D1Database, telegramId: string) => 
    db.prepare("SELECT * FROM users WHERE telegram_id = ?").bind(telegramId).first(),

  create: async (db: D1Database, name: string, telegramId: string) => {
    await db.prepare("INSERT INTO users (name, telegram_id) VALUES (?, ?)")
      .bind(name, telegramId)
      .run();

    await db.prepare("INSERT OR IGNORE INTO user_notifications (user_id) VALUES (?)")
      .bind(telegramId)
      .run();

    const user = await db.prepare("SELECT * FROM users WHERE telegram_id = ?")
      .bind(telegramId)
      .first();

    return user;
  },

  setApiKey: async (db: D1Database, telegramId: string, apiKey: string, createdAt: string) => {
    await db.prepare("UPDATE users SET api_key = ?, api_key_created_at = ? WHERE telegram_id = ?").bind(apiKey, createdAt, telegramId).run();
    await db.prepare("INSERT OR IGNORE INTO users (name, telegram_id, api_key, api_key_created_at) VALUES (?, ?, ?, ?)")
      .bind('', telegramId, apiKey, createdAt)
      .run();
  },

  getByApiKey: (db: D1Database, apiKey: string) =>
    db.prepare("SELECT * FROM users WHERE api_key = ?").bind(apiKey).first(),

  delete: (db: D1Database, id: string) =>
    db.prepare("DELETE FROM users WHERE id = ?").bind(id).run(),
  
  getAllUserPreferences: async (db: D1Database) => {
    return db
      .prepare(`
        SELECT
          u.name,
          u.telegram_id,

          un.enable_weather,
          un.weather_adm4,
          un.reminder_weather_time,

          un.enable_prayer,
          un.prayer_city_code,

          un.enable_motivation,
          un.reminder_motivation_time,

          un.enable_todo_reminder,
          un.reminder_todo_time
        FROM users u
        LEFT JOIN user_notifications un
          ON un.user_id = u.telegram_id
        ORDER BY u.created_at DESC
      `)
      .all();
  },
  
};
