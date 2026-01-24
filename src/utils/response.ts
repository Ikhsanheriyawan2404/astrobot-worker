import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export const success = (c: Context, data: any, message?: string) => {
  return c.json({ data, message }, 200);
};

export const error = (c: Context, message: string, status: StatusCode) => {
  c.status(status);
  return c.json({ message });
};
