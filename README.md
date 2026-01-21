# be-astro

REST API simple dengan Hono + Cloudflare D1

## Setup

```bash
# Install
bun install

# Login Cloudflare
bunx wrangler login

# Buat database D1
bun run db:create
# Copy database_id ke wrangler.toml

# Jalankan migration
bun run db:migrate:local

# Development
bun run dev
```

## Deploy

```bash
bun run db:migrate:remote
bun run deploy
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /users/me | Ambil data user saat ini (butuh `Authorization: Bearer <api_key>`) |
