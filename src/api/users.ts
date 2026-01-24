import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";
import { success } from "../utils/response";

const users = new Hono<Env>();

users.get("/me", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User tidak ditemukan" }, 404);

  const { api_key, ...safeUser } = user as any;
  return c.json(success(safeUser, "User fetched successfully"));
});

export default users;
