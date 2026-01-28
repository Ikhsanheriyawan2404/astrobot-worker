import { Hono } from "hono";

export type Env = {
  Bindings: {
    DB: D1Database;
    TELEGRAM_TOKEN: string;
    SETUP_SECRET: string;
    OPENAI_API_KEY: string;
    FRONTEND_URL: string;
    WEATHER_API_BASE_URL: string;
    PRAYER_API_BASE_URL: string;
  };
};

export type AppType = Hono<Env>;
