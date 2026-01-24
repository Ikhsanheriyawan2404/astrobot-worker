import { Hono } from "hono";
import type { Env } from "../types";
import { error, success } from "../utils/response";
import data from "../../data/region.json";
import { requireAuth } from "../middleware/auth";
import { notificationQueries } from "../db/notifications";

const region = new Hono<Env>();

region.get("/", async (c) => {
  const q = (c.req.query("q") || c.req.query("name") || "") as string;
  const qStr = String(q).trim().toLowerCase();

  if (!qStr) {
    return error(c, "Query parameter '?q' or '?name' is required.", 400);
  }
  
  const terms = qStr.split(/\s+/);

  const matches = (data as Array<any>)
    .filter((item) => {
      const code = String(item.kode || "");
      return code.split(".").length === 4;
    })
    .filter((item) => {
      const name = String(item.nama || "").toLowerCase();
      return terms.every((term) => name.includes(term));
    });
  
  const mapByCode = new Map<string, any>();
  (data as Array<any>).forEach((item) => {
    if (item.kode) {
      mapByCode.set(String(item.kode), item);
    }
  });
  
  const results = matches.map((item) => {
    const parts: string[] = [];
    let current: any = item;

    while (current) {
      parts.push(current.nama);
      if (!current.parent) break;
      current = mapByCode.get(current.parent);
    }

    const normalizedName = parts.join(", ");

    return {
      code: item.kode,
      name: normalizedName
    };
  });

  return success(c, results, "Search results");
});

region.post("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return error(c, "User not found", 404);

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return error(c, "Invalid JSON body", 400);
  }

  const code = body && (body.code || body.id || body.code_id);
  if (!code) return error(c, "Field 'code' is required", 400);

  await notificationQueries.setWeatherAdm4(c.env.DB, user.telegram_id, String(code));

  return success(c, { code: String(code) }, "Weather adm4 saved");
});

export default region;
