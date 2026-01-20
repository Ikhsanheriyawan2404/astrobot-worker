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
| GET | /users | List semua users |
| POST | /users | Tambah user baru |
| DELETE | /users/:id | Hapus user |

### Contoh

```bash
# Tambah user
curl -X POST http://localhost:8787/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "telegram_id": "123456"}'

# List users  
curl http://localhost:8787/users

# Hapus user
curl -X DELETE http://localhost:8787/users/1
```
