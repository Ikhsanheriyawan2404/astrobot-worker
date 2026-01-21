export async function requireAuth(c: any, next: any) {
  const auth = c.req.header("authorization") || c.req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const apiKey = match[1];
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE api_key = ?").bind(apiKey).first();
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  if (user.api_key_created_at) {
    const created = Date.parse(user.api_key_created_at);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (isNaN(created) || now - created > oneDay) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  (c as any).user = user;

  return next();
}
