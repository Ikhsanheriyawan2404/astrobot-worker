export const userQueries = {
  getAll: (db: D1Database) => 
    db.prepare("SELECT * FROM users ORDER BY created_at DESC").all(),

  getById: (db: D1Database, id: string) => 
    db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first(),

  getByTelegramId: (db: D1Database, telegramId: string) => 
    db.prepare("SELECT * FROM users WHERE telegram_id = ?").bind(telegramId).first(),

  create: (db: D1Database, name: string, telegramId: string) =>
    db.prepare("INSERT INTO users (name, telegram_id) VALUES (?, ?) RETURNING *")
      .bind(name, telegramId)
      .first(),

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
};
