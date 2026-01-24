import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";
import { success } from "../utils/response";
import { todoQueries } from "../db/todos";

const todos = new Hono<Env>();

todos.get("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User not found" }, 404);
  const todos = await todoQueries.getAllMyTodos(c.env.DB, user.telegram_id);
  
  return c.json(success(todos, "Todos fetched successfully"));
});

todos.post("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User not found" }, 404);
  
  const { title } = await c.req.json();
  const newTodo = await todoQueries.saveMyTodo(c.env.DB, user.telegram_id, title);
  return c.json(success(newTodo, "Todo created successfully"));
});

todos.put("/:id", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User not found" }, 404);
  
  const id = c.req.param("id");
  const { title } = await c.req.json();
  const updatedTodo = await todoQueries.updateMyTodo(c.env.DB, id, user.telegram_id, title);
  return c.json(success(updatedTodo, "Todo updated successfully"));
});

todos.post("/:id", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User not found" }, 404);
  
  const id = c.req.param("id");
  const { check } = await c.req.json();
  if (check) {
    const updatedTodo = await todoQueries.softDelete(c.env.DB, id, user.telegram_id);
    return c.json(success(updatedTodo, "Todo checked successfully"));
  } else {
    const updatedTodo = await todoQueries.restore(c.env.DB, id, user.telegram_id);
    return c.json(success(updatedTodo, "Todo unchecked successfully"));
  }
});

export default todos;
