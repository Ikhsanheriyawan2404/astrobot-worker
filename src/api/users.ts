import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";

const users = new Hono<Env>();

users.get("/me", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User tidak ditemukan" }, 404);

  const { api_key, ...safeUser } = user as any;
  return c.json(safeUser);
});

export default users;
