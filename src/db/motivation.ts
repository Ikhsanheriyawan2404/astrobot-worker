export const motivationQueries = {
  saveMotivation: async (
    db: D1Database,
    message: string,
  ) => {
    return db
      .prepare("INSERT INTO motivations (message) VALUES (?) RETURNING *")
      .bind(message)
      .first();
  },
}
