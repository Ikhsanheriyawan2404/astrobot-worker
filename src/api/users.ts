import { Hono } from "hono";
import type { Env } from "../types";
import { userQueries } from "../db/users";

const users = new Hono<Env>();

users.get("/", async (c) => {
  const { results } = await userQueries.getAll(c.env.DB);
  return c.json(results);
});

users.post("/", async (c) => {
  const { name, telegram_id } = await c.req.json();

  if (!name || !telegram_id) {
    return c.json({ error: "name dan telegram_id wajib diisi" }, 400);
  }

  try {
    const result = await userQueries.create(c.env.DB, name, telegram_id);
    return c.json(result, 201);
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) {
      return c.json({ error: "telegram_id sudah terdaftar" }, 409);
    }
    return c.json({ error: "Gagal membuat user" }, 500);
  }
});

users.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const user = await userQueries.getById(c.env.DB, id);
  if (!user) {
    return c.json({ error: "User tidak ditemukan" }, 404);
  }

  await userQueries.delete(c.env.DB, id);
  return c.json({ message: "User berhasil dihapus" });
});

export default users;
