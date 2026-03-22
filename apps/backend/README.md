# ⚙️ @soulcanvas/backend

NestJS API server running on the **Bun** runtime with **tRPC** for type-safe APIs and **Drizzle ORM** for PostgreSQL.

## 🚀 Quick Start

```bash
# From root
bun install
bun run dev

# Or directly
cd apps/backend && bun run dev
```

Server runs on `http://localhost:3000`.

## 🏗 Architecture & Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | NestJS |
| **Runtime** | Bun |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **API Contract** | tRPC v11 (via `@soulcanvas/api`) |
| **Auth** | Clerk (`@clerk/backend`) |
| **Job Queue** | BullMQ (Redis) |
| **Email** | Resend + React Email |
| **Logging** | Pino + Pino-HTTP |
| **Security** | Helmet, AES-256-GCM encryption, rate limiting |
| **Monitoring** | Sentry |
| **Real-time** | Socket.io WebSocket gateway |

## 🔐 Security

- **Encryption at Rest:** Journal entries encrypted with AES-256-GCM, decrypted only for the verified user.
- **Rate Limiting:** In-memory sliding-window rate limiter on every tRPC route (`@soulcanvas/api`).
- **Helmet:** HTTP security headers on all responses.
- **CORS:** Strict origin allowlist (frontend + command center URLs only).

## 📂 Module Structure

```
src/
├── main.ts                    # App bootstrap (Sentry, Pino, CORS)
├── app.module.ts              # Root NestJS module
├── trpc/                      # tRPC controller + module
├── command-center/            # Internal ops API (admin dashboard)
│   ├── command-center.controller.ts   # REST endpoints
│   └── command-center.service.ts      # Business logic
├── notifications/             # BullMQ notification system
│   ├── notification.worker.ts         # Queue consumer
│   ├── notification.queue.ts          # Queue producer
│   ├── notification-dispatch.service.ts # Email/WhatsApp/GDPR
│   └── notification.constants.ts      # Job type definitions
├── tasks/                     # Scheduled cron jobs
│   └── tasks.service.ts       # Visual mass updates, GDPR purge
├── websocket/                 # Socket.io gateway
└── media/                     # Cloudflare R2 presigned URL service
```

## 📡 Command Center Endpoints

The `/command-api/*` endpoints power the Admin Dashboard:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/command-api/bootstrap` | Initialize super admin on first sign-in |
| GET | `/command-api/stats` | Dashboard aggregate statistics |
| GET | `/command-api/users` | List all users (paginated) |
| GET | `/command-api/users/:id` | User profile with sentiment data |
| POST | `/command-api/users/:id/gdpr-export` | Queue GDPR data export |
| POST | `/command-api/users/:userId/hard-delete` | Permanent user deletion |
| GET | `/command-api/rate-limits` | Live rate limiter status |
| GET | `/command-api/feature-flags` | Feature flag management |
| POST | `/command-api/invites` | Send team invitations |
| GET | `/command-api/audit-logs` | Admin audit trail |

## 📂 Adding New Routes

> **Routes live in `packages/api`, not here.**

1. Create handler in `packages/api/src/namespaces/`
2. Wire it into `packages/api/src/router.ts`
3. Add service methods in `apps/backend/src/.../*.service.ts`

---

*See [SETUP.md](../../SETUP.md) for env vars. See [DEVELOPER_WORKFLOW.md](../../DEVELOPER_WORKFLOW.md) for Git workflow.*
