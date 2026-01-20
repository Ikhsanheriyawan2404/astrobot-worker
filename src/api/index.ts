import { Hono } from "hono";
import type { Env } from "../types";
import users from "./users";

const api = new Hono<Env>();

api.route("/users", users);

export default api;
