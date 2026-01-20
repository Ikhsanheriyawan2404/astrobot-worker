import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import api from "./api";
import { handleUpdate, type TelegramUpdate } from "./bot";
import { setWebhook } from "./bot/telegram";

const app = new Hono<Env>();

app.use("*", cors());

app.get("/", (c) => c.json({ message: "Brogrammer API", status: "OK" }));

app.route("/api", api);

app.post("/bot/webhook", async (c) => {
  const update = await c.req.json<TelegramUpdate>();
  await handleUpdate(update, c.env);
  return c.json({ ok: true });
});

app.get("/bot/setup", async (c) => {
  const provided = c.req.header("x-setup-secret") || "";
  const secret = c.env.SETUP_SECRET;
  if (!secret || provided !== secret) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const url = new URL(c.req.url);
  const webhookUrl = `${url.origin}/bot/webhook`;
  const result = await setWebhook(c.env.TELEGRAM_TOKEN, webhookUrl);
  return c.json({ webhookUrl, result });
});

export default app;
