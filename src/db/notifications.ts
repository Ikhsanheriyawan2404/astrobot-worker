export const notificationQueries = {
  upsertForUser: async (db: D1Database, userId: string, fields: Record<string, any>) => {
    const cols = Object.keys(fields);
    if (cols.length === 0) return;

    const placeholders = cols.map(() => "?").join(", ");
    const insertCols = ["user_id", ...cols].join(", ");
    const insertPlaceholders = ["?", ...cols.map(() => "?")].join(", ");

    const updates = cols.map((c) => `${c} = excluded.${c}`).join(", ");

    const sql = `INSERT INTO user_notifications (${insertCols}) VALUES (${insertPlaceholders}) ON CONFLICT(user_id) DO UPDATE SET ${updates}`;

    const params: any[] = [userId, ...cols.map((c) => fields[c])];
    return db.prepare(sql).bind(...params).run();
  },

  setPrayerCityCode: (db: D1Database, userId: string, code: string) =>
    notificationQueries.upsertForUser(db, userId, { prayer_city_code: code }),

  setWeatherAdm4: (db: D1Database, userId: string, code: string) =>
    notificationQueries.upsertForUser(db, userId, { weather_adm4: code }),
};
