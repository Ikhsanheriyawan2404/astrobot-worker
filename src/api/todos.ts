import { Hono } from "hono";
import type { Env } from "../types";
import { requireAuth } from "../middleware/auth";
import { error, success } from "../utils/response";
import { todoQueries } from "../db/todos";

const todos = new Hono<Env>();

todos.get("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return c.json({ error: "User not found" }, 404);
  const todos = await todoQueries.getAllMyTodos(c.env.DB, user.telegram_id);
  
  return success(c, todos, "Todos fetched successfully");
});

todos.post("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return error(c, "User not found", 404);
  
  const { title } = await c.req.json();
  const newTodo = await todoQueries.saveMyTodo(c.env.DB, user.telegram_id, title);
  return success(c, newTodo, "Todo created successfully");
});

todos.put("/:id", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return error(c, "User not found", 404);
  
  const id = c.req.param("id");
  const { title } = await c.req.json();
  const updatedTodo = await todoQueries.updateMyTodo(c.env.DB, id, user.telegram_id, title);
  return success(c, updatedTodo, "Todo updated successfully");
});

todos.post("/:id", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return error(c, "User not found", 404);
  
  const id = c.req.param("id");
  const { check } = await c.req.json();
  if (check) {
    const updatedTodo = await todoQueries.softDelete(c.env.DB, id, user.telegram_id);
    return success(c, updatedTodo, "Todo checked successfully");
  } else {
    const updatedTodo = await todoQueries.restore(c.env.DB, id, user.telegram_id);
    return success(c, updatedTodo, "Todo unchecked successfully");
  }
});

todos.delete("/", requireAuth, async (c) => {
  const user = (c as any).user;
  if (!user) return error(c, "User not found", 404);

  const res = await todoQueries.deleteAllMyTodos(c.env.DB, user.telegram_id);
  return success(c, res, "All todos deleted successfully");
});

export default todos;
