import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const app = new Hono<Env>();

app.use("*", cors());

app.get("/", (c) => c.json({ message: "Brogrammer API", status: "OK" }));

app.get("/users", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  return c.json(results);
});

app.post("/users", async (c) => {
  const { name, telegram_id } = await c.req.json();

  if (!name || !telegram_id) {
    return c.json({ error: "name dan telegram_id wajib diisi" }, 400);
  }

  try {
    const result = await c.env.DB.prepare(
      "INSERT INTO users (name, telegram_id) VALUES (?, ?) RETURNING *"
    )
      .bind(name, telegram_id)
      .first();

    return c.json(result, 201);
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) {
      return c.json({ error: "telegram_id sudah terdaftar" }, 409);
    }
    return c.json({ error: "Gagal membuat user" }, 500);
  }
});

app.delete("/users/:id", async (c) => {
  const id = c.req.param("id");

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  if (!user) {
    return c.json({ error: "User tidak ditemukan" }, 404);
  }

  await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  return c.json({ message: "User berhasil dihapus" });
});

export default app;
