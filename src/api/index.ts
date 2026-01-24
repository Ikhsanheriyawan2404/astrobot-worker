import { Hono } from "hono";
import type { Env } from "../types";
import users from "./users";
import todos from "./todos";

const api = new Hono<Env>();

api.route("/users", users);
api.route("/todos", todos);

export default api;
