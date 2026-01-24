import { Hono } from "hono";
import type { Env } from "../types";
import { error, success } from "../utils/response";
import data from "../../data/region.json";

const region = new Hono<Env>();

region.get("/", async (c) => {
  const q = (c.req.query("q") || c.req.query("name") || "") as string;
  const qStr = String(q).trim().toLowerCase();

  if (!qStr) {
    return c.json(error("Query parameter '?q' or '?name' is required."));
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

  return c.json(success(results, "Search results"));
});

export default region;
