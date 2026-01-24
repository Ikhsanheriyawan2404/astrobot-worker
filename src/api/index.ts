import { Hono } from "hono";
import type { Env } from "../types";
import users from "./users";
import todos from "./todos";
import region from "./region";
import city from "./city";
import settings from "./settings";

const api = new Hono<Env>();

api.route("/users", users);
api.route("/todos", todos);
api.route("/region", region);
api.route("/city", city);
api.route("/settings", settings);

export default api;
