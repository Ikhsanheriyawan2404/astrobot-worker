import { Hono } from "hono";
import type { Env } from "../types";
import { error, success } from "../utils/response";
import data from "../../data/city.json";
import { requireAuth } from "../middleware/auth";
import { notificationQueries } from "../db/notifications";

const city = new Hono<Env>();

city.get("/", async (c) => {
  const q = (c.req.query("q") || c.req.query("name") || "") as string;
  const qStr = String(q).trim().toLowerCase();

  if (!qStr) {
    return c.json(error("Query parameter '?q' or '?name' is required."));
  }
  
  const terms = qStr.split(/\s+/);

  const matches = (data as Array<any>)
    .filter((item) => {
      const name = String(item.lokasi || "").toLowerCase();
      return terms.every((term) => name.includes(term));
    });
  
  const results = matches.map((item) => {
    return {
      code: item.id,
      name: item.lokasi
    };
  });

  return c.json(success(results, "Search results"));
});

city.post("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User not found" }, 404);

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const code = body && (body.code || body.id || body.code_id);
  if (!code) return c.json({ error: "Field 'code' is required" }, 400);

  await notificationQueries.setPrayerCityCode(c.env.DB, user.telegram_id, String(code));

  return c.json(success({ code: String(code) }, "Prayer city code saved"));
});

export default city;
