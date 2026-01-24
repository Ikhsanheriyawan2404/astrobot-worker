import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";
import { notificationQueries } from "../db/notifications";
import { error, success } from "../utils/response";

const DEFAULT_SETTINGS = {
  enable_weather: 0,
  enable_prayer: 0,
  enable_todo_reminder: 1,
  enable_motivation: 1,
  prayer_city_code: null as string | null,
  weather_adm4: null as string | null,
  reminder_todo_time: "07:00",
  reminder_weather_time: "06:00",
  reminder_motivation_time: "06:30",
  timezone: "Asia/Jakarta",
};

const settings = new Hono<Env>();

const normalizeTime = (value: any) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed) ? trimmed : null;
};

const formatResponse = (row: typeof DEFAULT_SETTINGS) => ({
  motivation: {
    enabled: Boolean(row.enable_motivation),
    time: row.reminder_motivation_time,
  },
  todo: {
    enabled: Boolean(row.enable_todo_reminder),
    time: row.reminder_todo_time,
  },
  weather: {
    enabled: Boolean(row.enable_weather),
    time: row.reminder_weather_time,
    code: row.weather_adm4,
  },
  prayer: {
    enabled: Boolean(row.enable_prayer),
    code: row.prayer_city_code,
  },
  timezone: row.timezone,
});

settings.get("/", requireAuth, async (c) => {
  const user = (c as any).user;
  const existing = await notificationQueries.getSettings(c.env.DB, user.telegram_id);
  const merged = { ...DEFAULT_SETTINGS, ...(existing || {}) };

  return c.json(success(formatResponse(merged), "Settings fetched"));
});

settings.put("/", requireAuth, async (c) => {
  const user = (c as any).user;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json(error("Invalid JSON body"), 400);
  }

  const updates: Record<string, any> = {};

  if (body?.motivation) {
    if (body.motivation.enabled !== undefined) {
      updates.enable_motivation = body.motivation.enabled ? 1 : 0;
    }
    if (body.motivation.time !== undefined) {
      const normalized = normalizeTime(body.motivation.time);
      if (!normalized) return c.json(error("motivation.time must be HH:MM"), 400);
      updates.reminder_motivation_time = normalized;
    }
  }

  if (body?.todo) {
    if (body.todo.enabled !== undefined) {
      updates.enable_todo_reminder = body.todo.enabled ? 1 : 0;
    }
    if (body.todo.time !== undefined) {
      const normalized = normalizeTime(body.todo.time);
      if (!normalized) return c.json(error("todo.time must be HH:MM"), 400);
      updates.reminder_todo_time = normalized;
    }
  }

  if (body?.weather) {
    if (body.weather.enabled !== undefined) {
      updates.enable_weather = body.weather.enabled ? 1 : 0;
    }
    if (body.weather.time !== undefined) {
      const normalized = normalizeTime(body.weather.time);
      if (!normalized) return c.json(error("weather.time must be HH:MM"), 400);
      updates.reminder_weather_time = normalized;
    }
    if (body.weather.code !== undefined) {
      updates.weather_adm4 = body.weather.code ? String(body.weather.code) : null;
    }
  }

  if (body?.prayer) {
    if (body.prayer.enabled !== undefined) {
      updates.enable_prayer = body.prayer.enabled ? 1 : 0;
    }
    if (body.prayer.code !== undefined) {
      updates.prayer_city_code = body.prayer.code ? String(body.prayer.code) : null;
    }
  }

  if (body?.timezone !== undefined) {
    updates.timezone = String(body.timezone);
  }

  if (Object.keys(updates).length === 0) {
    return c.json(error("No valid fields to update"), 400);
  }

  await notificationQueries.updateSettings(c.env.DB, user.telegram_id, updates);
  const latest = await notificationQueries.getSettings(c.env.DB, user.telegram_id);
  const merged = { ...DEFAULT_SETTINGS, ...(latest || {}) };

  return c.json(success(formatResponse(merged), "Settings updated"));
});

export default settings;
