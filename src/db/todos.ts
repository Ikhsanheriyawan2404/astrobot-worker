export const todoQueries = {
  getMyTodos: async (db: D1Database, userId: string) => {
    const res = await db
      .prepare("SELECT * FROM todos WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC")
      .bind(userId)
      .all();

    return res.results;
  },
    
  getAllMyTodos: async (db: D1Database, userId: string) => {
    const res = await db
      .prepare(`
        SELECT *
        FROM todos
        WHERE user_id = ?
        ORDER BY
          CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END,
          created_at DESC
      `)
      .bind(userId)
      .all();

    return res.results;
  },

  saveMyTodo: (db: D1Database, userId: string, title: string) =>
    db.prepare("INSERT INTO todos (user_id, title) VALUES (?, ?) RETURNING *")
      .bind(userId, title)
      .first(),

  updateMyTodo: (db: D1Database, id: string, userId: string, title: string) =>
    db.prepare("UPDATE todos SET title = ? WHERE id = ? AND user_id = ? RETURNING *")
      .bind(title, id, userId)
      .first(),
      
  delete: (db: D1Database, id: string, userId: string) =>
    db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?").bind(id, userId).run(),

  softDelete: (db: D1Database, id: string, userId: string) =>
    db.prepare("UPDATE todos SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? RETURNING *")
      .bind(id, userId)
      .first(),

  restore: (db: D1Database, id: string, userId: string) =>
    db.prepare("UPDATE todos SET deleted_at = NULL WHERE id = ? AND user_id = ? RETURNING *")
      .bind(id, userId)
      .first(),
};
  