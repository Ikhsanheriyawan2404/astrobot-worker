import { Hono } from "hono";

export type Env = {
  Bindings: {
    DB: D1Database;
    TELEGRAM_TOKEN: string;
    SETUP_SECRET?: string;
  };
};

export type AppType = Hono<Env>;
