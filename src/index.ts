import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import api from "./api";
import { handleUpdate, type TelegramUpdate } from "./bot";
import { setWebhook } from "./bot/telegram";
import { success } from "./utils/response";
import { userQueries } from "./db/users";
import { buildUrl } from "./utils/helper";
import { generateDailyMotivation } from "./utils/thirdparty";
import { motivationQueries } from "./db/motivation";
import { todoQueries } from "./db/todos";

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
  const motivation = "test";
  await motivationQueries.saveMotivation(c.env.DB, motivation);

  const mapUserPreferences = (rows: any[]) => {
    return rows.map(async (r) => {
      const preferences: Record<string, any> = {};

      if (r.enable_weather && r.weather_adm4) {
        preferences.weather = {
          code: r.weather_adm4,
          time: r.reminder_weather_time,
          url: buildUrl(c.env.WEATHER_API_BASE_URL, r.weather_adm4),
        };
      }

      if (r.enable_prayer && r.prayer_city_code) {
        preferences.prayer = {
          code: r.prayer_city_code,
          url: buildUrl(c.env.PRAYER_API_BASE_URL, r.prayer_city_code),
        };
      }

      if (r.enable_motivation) {
        preferences.motivation = {
          time: r.reminder_motivation_time,
          text: motivation,
        };
      }
      
      const todos = await todoQueries.getMyTodos(c.env.DB, r.telegram_id);
      if (r.enable_todo_reminder) {
        preferences.todo = {
          time: r.reminder_todo_time,
          data: todos.map((t) => ({ title: t.title })),
        };
      }

      return {
        name: r.name,
        telegram_id: r.telegram_id,
        preferences,
      };
    });
  };
  
  const data = await Promise.all(mapUserPreferences(rows.results || []));
  return success(c, data, "All user preferences");
});

export default app;
