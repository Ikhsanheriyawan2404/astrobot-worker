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

### Todos endpoints 🔒

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /todos | List todos milik user terautentikasi |
| POST | /todos | Buat todo baru. Body: `{ "title": "..." }` |
| PUT | /todos/:id | Update title todo. Body: `{ "title": "..." }` |
| POST | /todos/:id | Toggle check/uncheck (soft delete). Body: `{ "check": true }` untuk check |

### Contoh penggunaan Todos

```bash
# Buat todo
curl -X POST http://localhost:8787/todos \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <API_KEY>" \
	-d '{"title":"Belajar Hono"}'

# List todos milik user saat ini
curl http://localhost:8787/todos \
	-H "Authorization: Bearer <API_KEY>"

# Update todo
curl -X PUT http://localhost:8787/todos/1 \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <API_KEY>" \
	-d '{"title":"Belajar Hono lagi"}'

# Check (soft-delete) todo
curl -X POST http://localhost:8787/todos/1 \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <API_KEY>" \
	-d '{"check": true}'
```
