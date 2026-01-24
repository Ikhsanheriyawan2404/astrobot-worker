import { Hono } from "hono";
import type { Env } from "../types";
import { error, success } from "../utils/response";
import data from "../../data/city.json";

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

export default city;
