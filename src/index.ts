import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import api from "./api";
import { handleUpdate, type TelegramUpdate } from "./bot";
import { setWebhook } from "./bot/telegram";
import { success } from "./utils/response";
import { userQueries } from "./db/users";

const app = new Hono<Env>();

app.use("*", cors());

app.get("/", (c) => c.json({ message: "Brogrammer API", status: "OK" }));

app.route("/api", api);

app.post("/api/bot/webhook", async (c) => {
  const update = await c.req.json<TelegramUpdate>();
  await handleUpdate(update, c.env);
  return c.json({ ok: true });
});

app.get("/api/bot/setup", async (c) => {
  const provided = c.req.header("x-setup-secret") || "";
  const secret = c.env.SETUP_SECRET;
  if (!secret || provided !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(c.req.url);
  const webhookUrl = `${url.origin}/api/bot/webhook`;
  const result = await setWebhook(c.env.TELEGRAM_TOKEN, webhookUrl);
  return c.json({ webhookUrl, result });
});

app.get("/api/bot/data", async (c) => {
  const provided = c.req.header("x-setup-secret") || "";
  const secret = c.env.SETUP_SECRET;
  if (!secret || provided !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const rows = await userQueries.getAllUserPreferences(c.env.DB);

  const mapUserPreferences = (rows: any[]) => {
    return rows.map((r) => {
      const preferences: Record<string, any> = {};

      if (r.enable_weather) {
        preferences.weather = {
          code: r.weather_adm4,
          time: r.reminder_weather_time,
        };
      }

      if (r.enable_prayer) {
        preferences.prayer = {
          code: r.prayer_city_code,
        };
      }

      if (r.enable_motivation) {
        preferences.motivation = {
          time: r.reminder_motivation_time,
        };
      }

      if (r.enable_todo_reminder) {
        preferences.todo = {
          time: r.reminder_todo_time,
        };
      }

      return {
        name: r.name,
        telegram_id: r.telegram_id,
        preferences,
      };
    });
  };
  
  const data = mapUserPreferences(rows.results || []);

  return success(c, data, "All user preferences");
});

export default app;
